import { createServerFn } from "@tanstack/react-start";
import yaml from "js-yaml";
import { GithubContentItem, Module, ModuleYaml, Unit, UnitYaml } from "./githubTypes";

interface ModuleDownloadRequest {
    folderPath: string;
}

const accessToken = process.env.GITHUB_ACCESS_TOKEN;

// Request queue and batching configuration
const MAX_CONCURRENT_REQUESTS = 15; // Increased from 10 for better performance
let activeRequests = 0;
const requestQueue: Array<() => Promise<any>> = [];

// Simple in-memory cache for downloaded content
const downloadCache = new Map<string, Promise<string>>();

// Enhanced fetch with connection pooling and request limiting
async function throttledFetch(url: string, options?: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
        const executeRequest = async () => {
            activeRequests++;
            try {
                const response = await fetch(url, options);
                resolve(response);
            } catch (error) {
                reject(error);
            } finally {
                activeRequests--;
                // Process next request in queue
                if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
                    const nextRequest = requestQueue.shift();
                    if (nextRequest) {
                        nextRequest();
                    }
                }
            }
        };

        if (activeRequests < MAX_CONCURRENT_REQUESTS) {
            executeRequest();
        } else {
            requestQueue.push(executeRequest);
        }
    });
}

// Helper function to check if a string is a URL or a folder path
function isUrlOrPath(input: string): { isUrl: boolean; isPath: boolean; type: 'url' | 'path' | 'unknown' } {
    // Check if it's a URL
    try {
        const url = new URL(input);
        // Valid URL protocols for GitHub
        const validProtocols = ['http:', 'https:'];
        if (validProtocols.includes(url.protocol)) {
            return { isUrl: true, isPath: false, type: 'url' };
        }
    } catch {
        // Not a valid URL, continue to check if it's a path
    }

    // Check if it's a folder path
    // Folder paths typically:
    // - Don't contain protocol (http://, https://)
    // - May start with / or contain / or \ separators
    // - May contain relative path indicators (., ..)
    // - Don't contain spaces at the beginning/end (trimmed)
    const trimmedInput = input.trim();
    
    // If it contains URL-like patterns, it's probably not a path
    if (trimmedInput.includes('://') || trimmedInput.startsWith('http')) {
        return { isUrl: false, isPath: false, type: 'unknown' };
    }
    
    // Check for path-like characteristics
    const pathPatterns = [
        /^[a-zA-Z]:[/\\]/, // Windows absolute path (C:\ or C:/)
        /^[/\\]/, // Unix absolute path or Windows UNC
        /^\.{1,2}[/\\]/, // Relative path starting with ./ or ../
        /[/\\]/, // Contains path separators
        /^[a-zA-Z0-9\-_.]+$/, // Simple folder/file name without spaces
        /^[a-zA-Z0-9\-_./\\]+$/ // Path with valid characters
    ];
    
    const isPath = pathPatterns.some(pattern => pattern.test(trimmedInput)) && 
                   !trimmedInput.includes(' ') || // No spaces (usually)
                   trimmedInput.length > 0; // Not empty
    
    if (isPath) {
        return { isUrl: false, isPath: true, type: 'path' };
    }
    
    return { isUrl: false, isPath: false, type: 'unknown' };
}

// Helper function to format duration in milliseconds to human readable format
function formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
        return `${Math.round(milliseconds)}ms`;
    } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(1);
        return `${minutes}m ${seconds}s`;
    }
}

// Helper function to create headers with optional authentication
function createGitHubHeaders() {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Learn-Module-Viewer",
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return headers;
}

// Helper function to extract folder path from Microsoft Learn module URL
async function extractFolderPathFromLearnUrl(learnUrl: string): Promise<string> {
    try {
        console.log(`Fetching Learn module page: ${learnUrl}`);
        
        const response = await fetch(learnUrl, {
            headers: {
                "User-Agent": "Learn-Module-Viewer",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Learn module page: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        
        // Look for the source_path meta tag
        const metaTagRegex = /<meta\s+name="source_path"\s+content="([^"]+)"/i;
        const match = html.match(metaTagRegex);
        
        if (!match) {
            throw new Error("Could not find source_path meta tag in the Learn module page. Make sure this is a valid Microsoft Learn module URL.");
        }
        
        const sourcePath = match[1];
        console.log(`Found source_path: ${sourcePath}`);
        
        // Remove /index.yml from the end to get the folder path
        const folderPath = sourcePath.replace(/\/index\.yml$/, '');
        console.log(`Extracted folder path: ${folderPath}`);
        
        return folderPath;
    } catch (error) {
        console.error("Error extracting folder path from Learn URL:", error);
        throw new Error(`Failed to extract folder path from Learn URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

export const DownloadLearnModuleFromGitHub = createServerFn()
    .validator((data: ModuleDownloadRequest) => data)
    .handler(async ({ data }) => {
        const startTime = performance.now();

        // Clear cache for fresh requests
        downloadCache.clear();

        // Log authentication status for debugging
        console.log(`GitHub API: Using ${accessToken ? "authenticated" : "unauthenticated"} requests`);
        if (!accessToken) {
            console.warn("No GitHub token found. Using unauthenticated requests (60 requests/hour limit). Set GITHUB_ACCESS_TOKEN environment variable for higher limits (5000 requests/hour).");
        }

        // Check if the input is a URL or path
        const inputType = isUrlOrPath(data.folderPath);
        console.log(`Input detected as: ${inputType.type} (${data.folderPath})`);

        let hierarchy: Record<string, GithubContentItem[]>;
        const hierarchyStartTime = performance.now();

        if (inputType.isUrl) {
            // Handle Microsoft Learn module URLs
            // Extract folder path from the Learn module page's meta tag
            console.log("URL detected - extracting folder path from Learn module page...");
            const folderPath = await extractFolderPathFromLearnUrl(data.folderPath);
            hierarchy = await buildHierarchyAndFetchContents(folderPath, {});
        } else {
            // Handle as folder path (existing logic)
            hierarchy = await buildHierarchyAndFetchContents(data.folderPath, {});
        }

        const hierarchyEndTime = performance.now();

        // Process the hierarchy into a more usable structure
        const processingStartTime = performance.now();
        const processedModule = await processHierarchyIntoModule(hierarchy);
        const processingEndTime = performance.now();

        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        const hierarchyDuration = hierarchyEndTime - hierarchyStartTime;
        const processingDuration = processingEndTime - processingStartTime;

        console.log(`Module processing completed in ${totalDuration.toFixed(2)}ms`);
        console.log(`- Hierarchy building: ${hierarchyDuration.toFixed(2)}ms (${((hierarchyDuration / totalDuration) * 100).toFixed(1)}%)`);
        console.log(`- Content processing: ${processingDuration.toFixed(2)}ms (${((processingDuration / totalDuration) * 100).toFixed(1)}%)`);
        console.log(`- Cache hits: ${downloadCache.size} unique downloads`);

        // Add performance metrics to the result
        return {
            ...processedModule,
            performance: {
                duration: Math.round(totalDuration),
                durationFormatted: formatDuration(totalDuration),
                breakdown: {
                    hierarchy: Math.round(hierarchyDuration),
                    processing: Math.round(processingDuration),
                    uniqueDownloads: downloadCache.size,
                },
            },
        };
    });

async function downloadFolderContents(path: string) {
    const apiUrl = `https://api.github.com/repos/MicrosoftDocs/learn/contents/${path}`;

    const response = await throttledFetch(apiUrl, {
        headers: createGitHubHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Error fetching folder contents: ${response.statusText}`);
    }

    const items: GithubContentItem[] = await response.json();
    return items;
}

async function buildHierarchyAndFetchContents(directory: string, hierarchy: Record<string, GithubContentItem[]>) {
    // Initialize the current directory in hierarchy if it doesn't exist
    if (!hierarchy[directory]) {
        // Fetch contents for this directory
        const items = await downloadFolderContents(directory);
        hierarchy[directory] = items.filter((item) => item.type === "file");

        // Recursively fetch contents for subdirectories in parallel
        const subdirectories = items.filter((item) => item.type === "dir");

        await Promise.all(subdirectories.map((subdir) => buildHierarchyAndFetchContents(subdir.path, hierarchy)));
    }

    return hierarchy;
}

async function downloadFile(url: string) {
    // Check cache first
    if (downloadCache.has(url)) {
        return await downloadCache.get(url)!;
    }

    // Create promise and cache it immediately to prevent duplicate requests
    const downloadPromise = (async () => {
        const fileName = url.split("/").pop() || "unknown";

        const response = await throttledFetch(url, {
            headers: createGitHubHeaders(),
        });

        // Check for rate limiting
        if (response.status === 403 || response.status === 429) {
            const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
            const rateLimitReset = response.headers.get("x-ratelimit-reset");
            const rateLimitLimit = response.headers.get("x-ratelimit-limit");
            const retryAfter = response.headers.get("retry-after");

            const authStatus = accessToken ? "authenticated" : "unauthenticated";

            console.error("Rate limiting detected:", {
                status: response.status,
                statusText: response.statusText,
                file: fileName,
                authStatus,
                rateLimitRemaining,
                rateLimitLimit,
                rateLimitReset: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : null,
                retryAfter: retryAfter ? `${retryAfter} seconds` : null,
            });

            throw new Error(`Rate limited while downloading ${fileName}. Status: ${response.status}. ${!accessToken ? "Consider adding a GitHub token for higher rate limits." : ""}`);
        }

        if (!response.ok) {
            throw new Error(`Failed to download ${fileName}: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    })();

    downloadCache.set(url, downloadPromise);
    return await downloadPromise;
}

async function processHierarchyIntoModule(hierarchy: Record<string, GithubContentItem[]>): Promise<Module> {
    const processedModule: Module = {
        units: [],
        markdownFiles: [],
        images: [],
        codeFiles: [],
        imagesByPath: {},
        imageReferenceMap: {},
        unitsByUid: {},
        markdownByPath: {},
        codeFilesByPath: {},
    };

    // Collect all file processing promises to run in parallel
    const fileProcessingPromises: Promise<void>[] = [];

    // Process all items in the hierarchy
    for (const [folderPath, items] of Object.entries(hierarchy)) {
        for (const item of items) {
            const extension = item.name.split(".").pop()?.toLowerCase();

            switch (extension) {
                case "yml":
                case "yaml":
                    fileProcessingPromises.push(processYamlFile(item, processedModule, hierarchy));
                    break;
                case "md":
                    fileProcessingPromises.push(processMarkdownFile(item, processedModule, hierarchy));
                    break;
                case "png":
                case "jpg":
                case "jpeg":
                case "gif":
                case "svg":
                    fileProcessingPromises.push(processImageFile(item, processedModule));
                    break;
            }
        }
    }

    // Wait for all file processing to complete in parallel
    await Promise.all(fileProcessingPromises);

    // Sort units and markdown files by their numeric prefix
    sortProcessedModuleContents(processedModule);

    // Build lookup maps after processing all items
    buildLookupMaps(processedModule);

    return processedModule;
}

function sortProcessedModuleContents(module: Module) {
    // Helper function to extract numeric prefix from filename
    const extractNumericPrefix = (name: string): number => {
        const match = name.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0; // Put files without numeric prefix at the end
    };

    // Sort units by numeric prefix in their YAML filename or title
    module.units.sort((a, b) => {
        // Try to get order from yaml.title first, then fall back to other properties
        const aOrder = extractNumericPrefix(a.path.split('/').pop() ?? '');
        const bOrder = extractNumericPrefix(b.path.split('/').pop() ??'');
        return aOrder - bOrder;
    });

    // Sort markdown files by numeric prefix in their filename
    module.markdownFiles.sort((a, b) => {
        const aOrder = extractNumericPrefix(a.name);
        const bOrder = extractNumericPrefix(b.name);
        return aOrder - bOrder;
    });
}

function buildLookupMaps(module: Module) {
    // Build image lookup map
    module.images.forEach((image) => {
        module.imagesByPath[image.path] = image.dataUrl;

        // Build image reference map for enhanced images (using same logic as in createEnhancedImage)
        const imageRef = `IMG_REF_${image.path.replace(/[^a-zA-Z0-9]/g, "_")}`;
        module.imageReferenceMap[imageRef] = image.dataUrl;
    });

    // Build unit lookup map
    module.units.forEach((unit) => {
        if (unit.yaml.uid) {
            module.unitsByUid[unit.yaml.uid] = unit;
        }
    });

    // Build markdown lookup map
    module.markdownFiles.forEach((markdown) => {
        module.markdownByPath[markdown.path] = markdown;
    });

    // Build code file lookup map
    module.codeFiles.forEach((codeFile) => {
        module.codeFilesByPath[codeFile.path] = codeFile;
    });
}

async function processYamlFile(item: GithubContentItem, module: Module, hierarchy: Record<string, GithubContentItem[]>) {
    const yamlContent = await downloadFile(item.download_url);

    if (yamlContent.startsWith("### YamlMime:ModuleUnit")) {
        const unit = await processUnitYaml(item, yamlContent, hierarchy);

        if (unit) module.units.push(unit);
    } else if (yamlContent.startsWith("### YamlMime:Module")) {
        const parsed = yaml.load(yamlContent) as ModuleYaml;

        // Flatten module properties into the ProcessedModule
        module.title = parsed.title;
        module.summary = parsed.summary;
        module.abstract = parsed.abstract;
        module.iconUrl = parsed.iconUrl;
        module.levels = parsed.levels;
        module.roles = parsed.roles;
        module.products = parsed.products;
        module.prerequisites = parsed.prerequisites;
        module.badgeUid = parsed.badge?.uid;
        module.uid = parsed.uid;
    }
}

async function processUnitYaml(item: GithubContentItem, yamlContent: string, hierarchy: Record<string, GithubContentItem[]>): Promise<Unit | undefined> {
    const parsed = yaml.load(yamlContent) as UnitYaml;
    const unit: Unit = {
        path: item.path,
        yaml: parsed,
    };

    // Look for include tags in the content property to find the markdown file
    if (parsed.content) {
        const includeMatch = parsed.content.match(/\[!include\[\]\(([^)]+)\)\]/);
        if (includeMatch) {
            // Resolve the relative path from the YAML file's directory using our helper function
            const fullMarkdownPath = resolveRelativePath(`./${includeMatch[1]}`, item.path);

            try {
                const markdownContent = await downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${fullMarkdownPath}`);

                unit.markdownContent = await processMarkdownContent(markdownContent, fullMarkdownPath, hierarchy);

                return unit;
            } catch (error) {
                console.error("Failed to load markdown for unit:", parsed.title, "from", fullMarkdownPath, error);
            }
        } else {
            console.warn("No include tag found in unit content:", parsed.title);
        }
    }
}

async function processMarkdownFile(item: GithubContentItem, module: Module, hierarchy: Record<string, GithubContentItem[]>) {
    // Only process standalone markdown files (not those already processed with units)
    const hasCorrespondingYaml = module.units.some((unit) => unit.yaml.uid && item.path.includes(unit.yaml.uid));

    if (!hasCorrespondingYaml) {
        const content = await downloadFile(item.download_url);
        const processedContent = await processMarkdownContent(content, item.path, hierarchy);
        module.markdownFiles.push({
            path: item.path,
            name: item.name,
            content: processedContent,
        });
    }
}

async function processImageFile(item: GithubContentItem, module: Module) {
    try {
        const response = await throttledFetch(item.download_url, {
            headers: createGitHubHeaders(),
        });
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // Determine MIME type based on extension
        const extension = item.name.split(".").pop()?.toLowerCase();
        let mimeType = "image/";
        switch (extension) {
            case "png":
                mimeType += "png";
                break;
            case "jpg":
            case "jpeg":
                mimeType += "jpeg";
                break;
            case "gif":
                mimeType += "gif";
                break;
            case "svg":
                mimeType += "svg+xml";
                break;
            default:
                mimeType += "png";
        }

        const dataUrl = `data:${mimeType};base64,${base64}`;

        module.images.push({
            path: item.path,
            name: item.name,
            dataUrl: dataUrl,
        });
    } catch (error) {
        console.error("Error processing image:", item.name, error);
    }
}

// Simple function to process markdown content - replaces code directives with enhanced code blocks
async function processMarkdownContent(content: string, markdownPath: string, hierarchy: Record<string, GithubContentItem[]>): Promise<string> {
    // Find all code directives in the content
    const codeDirectiveRegex = /:::code\s+language="([^"]+)"\s+source="([^"]+)"(?:\s+highlight="([^"]+)")?(?:\s+range="([^"]+)")?(?:\s+id="([^"]+)")?:::/g;

    let processedContent = content;
    const matches = Array.from(content.matchAll(codeDirectiveRegex));

    // Prepare all code downloads in parallel first
    const codeDownloadPromises = matches.map(async (match) => {
        const [fullMatch, language, source, highlight, range, id] = match;
        try {
            const resolvedPath = resolveRelativePath(source, markdownPath);
            if (resolvedPath) {
                const codeContent = await downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${resolvedPath}`);
                return { match, codeContent, resolvedPath, error: null };
            } else {
                console.warn(`Could not resolve code file path: ${source} from ${markdownPath}`);
                return { match, codeContent: null, resolvedPath: null, error: `Could not find code file: ${source}` };
            }
        } catch (error) {
            console.error(`Failed to fetch code file ${source}:`, error);
            return {
                match,
                codeContent: null,
                resolvedPath: null,
                error: `Error loading code file: ${source}\n${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    });

    // Wait for all code downloads to complete
    const codeResults = await Promise.all(codeDownloadPromises);

    // Process each directive in reverse order to avoid position shifting
    for (let i = codeResults.length - 1; i >= 0; i--) {
        const { match, codeContent, resolvedPath, error } = codeResults[i];
        const [fullMatch, language, source, highlight, range, id] = match;

        // Detect indentation of the original :::code directive
        const matchStart = match.index!;
        const lineStart = processedContent.lastIndexOf("\n", matchStart) + 1;
        const indentation = processedContent.substring(lineStart, matchStart);

        let replacement: string;

        if (error || !codeContent) {
            // Replace with error message
            replacement = `${indentation}\`\`\`text
${indentation}${error || "Unknown error"}
${indentation}\`\`\``;
        } else {
            // Create the enhanced code block with metadata
            const fileName = source.split("/").pop() || "unknown";
            replacement = createEnhancedCodeBlock(language, codeContent, highlight, fileName, source, indentation);
        }

        // Replace the directive with the code block
        const matchEnd = matchStart + fullMatch.length;
        processedContent = processedContent.substring(0, matchStart) + replacement + processedContent.substring(matchEnd);
    }

    // Process image directives
    const imageDirectiveRegex = /:::image\s+type="([^"]+)"\s+source="([^"]+)"\s+alt-text="([^"]*)":::/g;
    const imageMatches = Array.from(processedContent.matchAll(imageDirectiveRegex));

    // Process each image directive in reverse order to avoid position shifting
    for (let i = imageMatches.length - 1; i >= 0; i--) {
        const match = imageMatches[i];
        const [fullMatch, type, source, altText] = match;

        try {
            // Resolve the relative path to absolute path (same logic as for code files)
            const resolvedPath = resolveRelativePath(source, markdownPath);
            if (resolvedPath) {
                // Use the resolved path for the reference to match the imageReferenceMap
                const imageRef = `IMG_REF_${resolvedPath.replace(/[^a-zA-Z0-9]/g, "_")}`;

                // Create enhanced markdown image with metadata comments
                const imageBlock = createEnhancedImage(imageRef, altText, type, source);

                // Replace the directive with the image block
                const matchStart = match.index!;
                const matchEnd = matchStart + fullMatch.length;
                processedContent = processedContent.substring(0, matchStart) + imageBlock + processedContent.substring(matchEnd);
            } else {
                console.warn(`Could not resolve image path: ${source} from ${markdownPath}`);
                // Replace with error message
                const errorBlock = `![Error: Could not find image: ${source}](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==)`;
                const matchStart = match.index!;
                const matchEnd = matchStart + fullMatch.length;
                processedContent = processedContent.substring(0, matchStart) + errorBlock + processedContent.substring(matchEnd);
            }
        } catch (error) {
            console.error(`Failed to process image directive ${source}:`, error);
            // Replace with error message
            const errorBlock = `![Error loading image: ${source}](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==)`;
            const matchStart = match.index!;
            const matchEnd = matchStart + fullMatch.length;
            processedContent = processedContent.substring(0, matchStart) + errorBlock + processedContent.substring(matchEnd);
        }
    }

    return processedContent;
}

// Create an enhanced code block with metadata attributes
function createEnhancedCodeBlock(language: string, code: string, highlight?: string, fileName?: string, source?: string, indentation?: string): string {
    // Create metadata comments at the top of the code block
    const metadataComments = [];

    if (highlight) {
        metadataComments.push(`// @highlight: ${highlight}`);
    }
    if (fileName) {
        metadataComments.push(`// @filename: ${fileName}`);
    }
    if (source) {
        metadataComments.push(`// @source: ${source}`);
    }

    const metadataSection = metadataComments.length > 0 ? metadataComments.join("\n") + "\n" : "";

    // Apply indentation to all lines if specified
    const indent = indentation || "";
    const indentedCode = code
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n");
    const indentedMetadata = metadataSection
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n");

    const result = `${indent}\`\`\`${language}
${indentedMetadata}${indentedCode}
${indent}\`\`\``;

    return result;
}

// Create an enhanced image with metadata comments
function createEnhancedImage(imageRef: string, altText: string, type?: string, source?: string): string {
    // Create metadata comments on the same line or as a block
    const metadataComments = [];

    if (type) {
        metadataComments.push(`<!-- @type: ${type} -->`);
    }
    metadataComments.push(`<!-- @enhanced: true -->`);
    metadataComments.push(`<!-- @ref: ${imageRef} -->`);

    // Put comments inline after the image
    const result = `![${altText}](${imageRef}) ${metadataComments.join(" ")}`;

    console.log("Generated enhanced image block:");
    console.log(JSON.stringify(result, null, 2));

    return result;
}

// Resolve any relative path to an absolute path within the repository
function resolveRelativePath(relativePath: string, basePath: string): string {
    // If it's already an absolute path (doesn't start with . or ..), return as is
    if (!relativePath.startsWith(".")) {
        return relativePath;
    }

    // Get the directory of the base path (remove filename if present)
    const baseDir = basePath.substring(0, basePath.lastIndexOf("/"));

    // Split both paths into segments
    const baseSegments = baseDir.split("/").filter((segment) => segment.length > 0);
    const relativeSegments = relativePath.split("/").filter((segment) => segment.length > 0);

    // Start with base directory segments
    const resolvedSegments = [...baseSegments];

    // Process each segment of the relative path
    for (const segment of relativeSegments) {
        if (segment === "..") {
            // Go up one directory (remove last segment)
            if (resolvedSegments.length > 0) {
                resolvedSegments.pop();
            }
        } else if (segment === ".") {
            // Current directory - do nothing
            continue;
        } else {
            // Regular directory or file name
            resolvedSegments.push(segment);
        }
    }

    // Join segments back together
    return resolvedSegments.join("/");
}
