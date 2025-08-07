import { createServerFn } from "@tanstack/react-start";
import { GithubContentItem, Module, ModuleYaml, Unit, UnitYaml, CodeDirective, CodeFile } from "./githubTypes";
import yaml from "js-yaml";

interface ModuleDownloadRequest {
    folderPath: string;
}

const accessToken = process.env.GITHUB_ACCESS_TOKEN;

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

export const DownloadLearnModuleFromGitHub = createServerFn()
    .validator((data: ModuleDownloadRequest) => data)
    .handler(async ({ data }) => {
        const startTime = performance.now();
        
        // Log authentication status for debugging
        console.log(`GitHub API: Using ${accessToken ? "authenticated" : "unauthenticated"} requests`);
        if (!accessToken) {
            console.warn("No GitHub token found. Using unauthenticated requests (60 requests/hour limit). Set GITHUB_ACCESS_TOKEN environment variable for higher limits (5000 requests/hour).");
        }

        // Build the hierarchy starting from the root folder and fetch all contents recursively
        const hierarchy = await buildHierarchyAndFetchContents(data.folderPath, {});

        // Process the hierarchy into a more usable structure
        const processedModule = await processHierarchyIntoModule(hierarchy);

        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Module processing completed in ${duration.toFixed(2)}ms`);

        // Add performance metrics to the result
        return {
            ...processedModule,
            performance: {
                duration: Math.round(duration),
                durationFormatted: formatDuration(duration)
            }
        };
    });

async function downloadFolderContents(path: string) {
    const apiUrl = `https://api.github.com/repos/MicrosoftDocs/learn/contents/${path}`;

    const response = await fetch(apiUrl, {
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

        // Recursively fetch contents for subdirectories
        const subdirectories = items.filter((item) => item.type === "dir");

        for (const subdir of subdirectories) {
            await buildHierarchyAndFetchContents(subdir.path, hierarchy);
        }
    }

    return hierarchy;
}

async function downloadFile(url: string) {
    const fileName = url.split("/").pop() || "unknown";

    const response = await fetch(url, {
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

    // Process all items in the hierarchy
    for (const [folderPath, items] of Object.entries(hierarchy)) {
        for (const item of items) {
            const extension = item.name.split(".").pop()?.toLowerCase();

            switch (extension) {
                case "yml":
                case "yaml":
                    await processYamlFile(item, processedModule, hierarchy);
                    break;
                case "md":
                    await processMarkdownFile(item, processedModule, hierarchy);
                    break;
                case "png":
                case "jpg":
                case "jpeg":
                case "gif":
                case "svg":
                    await processImageFile(item, processedModule);
                    break;
            }
        }
    }

    // Build lookup maps after processing all items
    buildLookupMaps(processedModule);

    return processedModule;
}

function buildLookupMaps(module: Module) {
    // Build image lookup map
    module.images.forEach((image) => {
        module.imagesByPath[image.path] = image.dataUrl;
        
        // Build image reference map for enhanced images (using same logic as in createEnhancedImage)
        const imageRef = `IMG_REF_${image.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
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
        const response = await fetch(item.download_url, {
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

    // Process each directive in reverse order to avoid position shifting
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const [fullMatch, language, source, highlight, range, id] = match;

        try {
            const resolvedPath = resolveRelativePath(source, markdownPath);
            if (resolvedPath) {
                const codeContent = await downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${resolvedPath}`);

                // Detect indentation of the original :::code directive
                const matchStart = match.index!;
                const lineStart = processedContent.lastIndexOf('\n', matchStart) + 1;
                const indentation = processedContent.substring(lineStart, matchStart);

                // Create the enhanced code block with metadata
                const fileName = source.split("/").pop() || "unknown";
                const codeBlock = createEnhancedCodeBlock(language, codeContent, highlight, fileName, source, indentation);

                // Replace the directive with the code block
                const matchEnd = matchStart + fullMatch.length;
                processedContent = processedContent.substring(0, matchStart) + codeBlock + processedContent.substring(matchEnd);
            } else {
                console.warn(`Could not resolve code file path: ${source} from ${markdownPath}`);
                // Replace with error message
                const errorBlock = `\`\`\`text
Error: Could not find code file: ${source}
\`\`\``;
                const matchStart = match.index!;
                const matchEnd = matchStart + fullMatch.length;
                processedContent = processedContent.substring(0, matchStart) + errorBlock + processedContent.substring(matchEnd);
            }
        } catch (error) {
            console.error(`Failed to fetch code file ${source}:`, error);
            // Replace with error message
            const errorBlock = `\`\`\`text
Error loading code file: ${source}
${error instanceof Error ? error.message : "Unknown error"}
\`\`\``;
            const matchStart = match.index!;
            const matchEnd = matchStart + fullMatch.length;
            processedContent = processedContent.substring(0, matchStart) + errorBlock + processedContent.substring(matchEnd);
        }
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
                const imageRef = `IMG_REF_${resolvedPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
                
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
    
    const metadataSection = metadataComments.length > 0 ? metadataComments.join('\n') + '\n' : '';
    
    // Apply indentation to all lines if specified
    const indent = indentation || '';
    const indentedCode = code.split('\n').map(line => line ? indent + line : line).join('\n');
    const indentedMetadata = metadataSection.split('\n').map(line => line ? indent + line : line).join('\n');
    
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
    const result = `![${altText}](${imageRef}) ${metadataComments.join(' ')}`;
    
    console.log('Generated enhanced image block:');
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
