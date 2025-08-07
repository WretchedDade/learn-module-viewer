import { fileDownloader } from "./fileDownloader";
import { pathUtilities } from "./pathUtilities";
import { githubRegex } from "./regex";

async function downloadLearnMarkdown(path: string) {
    try {
        const markdownContent = await fileDownloader.downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${path}`);
        return await processMarkdown(markdownContent, path);
    } catch (error) {
        console.error("Failed to download or process markdown at path:", path, error);
    }
}

async function processMarkdown(content: string, markdownPath: string, processedIncludes: Set<string> = new Set()): Promise<string> {
    let processedContent = await processIncludeDirectives(content, markdownPath, processedIncludes);

    // Find all code directives in the content
    const matches = Array.from(processedContent.matchAll(githubRegex.codeDirective));

    async function downloadCodeFile(match: RegExpExecArray) {
        const [_fullMatch, _language, source] = match;

        try {
            const resolvedPath = pathUtilities.resolveRelativePath(source, markdownPath);
            if (resolvedPath) {
                const codeContent = await fileDownloader.downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${resolvedPath}`);
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
    }

    // Prepare all code downloads in parallel first
    const codeDownloadPromises = matches.map(downloadCodeFile);

    // Wait for all code downloads to complete
    const codeResults = await Promise.all(codeDownloadPromises);

    // Process each directive in reverse order to avoid position shifting
    for (let index = codeResults.length - 1; index >= 0; index--) {
        const { match, codeContent, resolvedPath, error } = codeResults[index];
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
            const resolvedPath = pathUtilities.resolveRelativePath(source, markdownPath);
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

async function processIncludeDirectives(content: string, markdownPath: string, processedIncludes: Set<string> = new Set()): Promise<string> {
    // Pattern to match [!include[](path)] or [!include[title](path)]
    const includeDirectiveRegex = /\[!include\[([^\]]*)\]\(([^)]+)\)\]/g;

    let processedContent = content;
    const matches = Array.from(content.matchAll(includeDirectiveRegex));

    if (matches.length === 0) {
        return processedContent;
    }

    // Prepare all include downloads in parallel
    const includeDownloadPromises = matches.map(async (match) => {
        const [fullMatch, title, includePath] = match;

        try {
            // Resolve the relative path to absolute path
            const resolvedPath = pathUtilities.resolveRelativePath(includePath.trim(), markdownPath);

            if (!resolvedPath) {
                console.warn(`Could not resolve include path: ${includePath} from ${markdownPath}`);
                return {
                    match,
                    content: null,
                    resolvedPath: null,
                    error: `Could not resolve include path: ${includePath}`,
                };
            }

            // Check for circular references
            if (processedIncludes.has(resolvedPath)) {
                console.warn(`Circular include reference detected: ${resolvedPath}`);
                return {
                    match,
                    content: null,
                    resolvedPath,
                    error: `Circular include reference: ${includePath}`,
                };
            }

            // Add current path to processed includes to prevent circular references
            const newProcessedIncludes = new Set(processedIncludes);
            newProcessedIncludes.add(resolvedPath);

            // Download the include file
            const includeContent = await fileDownloader.downloadFile(`https://raw.githubusercontent.com/MicrosoftDocs/learn/main/${resolvedPath}`);

            // Recursively process the included content for nested includes
            const fullyProcessedContent = await processIncludeDirectives(includeContent, resolvedPath, newProcessedIncludes);

            return {
                match,
                content: fullyProcessedContent,
                resolvedPath,
                error: null,
            };
        } catch (error) {
            console.error(`Failed to fetch include file ${includePath}:`, error);
            return {
                match,
                content: null,
                resolvedPath: null,
                error: `Error loading include file: ${includePath}\n${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    });

    // Wait for all include downloads to complete
    const includeResults = await Promise.all(includeDownloadPromises);

    // Process each include directive in reverse order to avoid position shifting
    for (let i = includeResults.length - 1; i >= 0; i--) {
        const { match, content: includeContent, resolvedPath, error } = includeResults[i];
        const [fullMatch] = match;

        // Detect indentation of the original include directive
        const matchStart = match.index!;
        const lineStart = processedContent.lastIndexOf("\n", matchStart) + 1;
        const indentation = processedContent.substring(lineStart, matchStart);

        let replacement: string;

        if (error || !includeContent) {
            // Replace with error message in a comment block
            replacement = `${indentation}<!-- Include Error: ${error || "Unknown error"} -->`;
        } else {
            // Apply indentation to all lines of the included content if needed
            if (indentation.trim() === "") {
                // No indentation needed
                replacement = includeContent;
            } else {
                // Apply indentation to each line
                const indentedContent = includeContent
                    .split("\n")
                    .map((line, index) => {
                        // Don't indent the first line if it's replacing the include directive
                        if (index === 0) return line;
                        return line ? indentation + line : line;
                    })
                    .join("\n");
                replacement = indentedContent;
            }
        }

        // Replace the directive with the processed content
        const matchEnd = matchStart + fullMatch.length;
        processedContent = processedContent.substring(0, matchStart) + replacement + processedContent.substring(matchEnd);
    }

    return processedContent;
}

export const markdownProcessor = {
    downloadLearnMarkdown,
    processMarkdown,
};
