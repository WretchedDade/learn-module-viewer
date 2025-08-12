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

// Helper function to extract folder path from Microsoft Learn module URL
async function extractFolderPathFromLearnModuleUrl(learnUrl: string): Promise<string> {
    try {
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
            throw new Error(
                "Could not find source_path meta tag in the Learn module page. Make sure this is a valid Microsoft Learn module URL.",
            );
        }

        const sourcePath = match[1];

        // Remove /index.yml from the end to get the folder path
        const folderPath = sourcePath.replace(/\/index\.yml$/, "");

        return folderPath;
    } catch (error) {
        console.error("Error extracting folder path from Learn URL:", error);
        throw new Error(
            `Failed to extract folder path from Learn URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

async function extractFolderPathFromLearnLearningPathUrl(learnUrl: string): Promise<string> {
    try {
        const response = await fetch(learnUrl, {
            headers: {
                "User-Agent": "Learn-Module-Viewer",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Learn learning path page: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();

        // Look for the original_content_git_url meta tag
        const metaTagRegex = /<meta\s+name="original_content_git_url"\s+content="([^"]+)"/i;
        const match = html.match(metaTagRegex);

        if (!match) {
            throw new Error(
                "Could not find original_content_git_url meta tag in the Learn learning path page. Make sure this is a valid Microsoft Learn learning path URL.",
            );
        }

        const gitUrl = match[1];

        // Extract the path from the GitHub URL
        // Example: https://github.com/MicrosoftDocs/learn-pr/blob/live/learn-pr/paths/microsoft-azure-fundamentals-describe-cloud-concepts/index.yml
        // We want: learn-pr/paths/microsoft-azure-fundamentals-describe-cloud-concepts
        const pathRegex = /\/blob\/[^\/]+\/(.+)\/index\.yml$/;
        const pathMatch = gitUrl.match(pathRegex);

        if (!pathMatch) {
            throw new Error("Could not extract folder path from the GitHub URL format.");
        }

        return pathMatch[1];
    } catch (error) {
        console.error("Error extracting folder path from Learn learning path URL:", error);
        throw new Error(
            `Failed to extract folder path from Learn learning path URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

export type PathType = "module-url" | "learning-path-url" | "module-folder" | "learning-path-folder";

/**
 * Detects the type of a given path or URL.
 * @param input The input string to analyze (URL or path)
 * @returns The detected path type
 */
function detectPathType(input: string): PathType {
    const trimmedInput = input.trim();

    // Check if it's a URL
    const isUrl = /^https?:\/\//.test(trimmedInput);

    if (isUrl) {
        // Check for learning path URLs
        if (trimmedInput.includes("/training/paths/")) {
            return "learning-path-url";
        }

        // Check for module URLs
        if (trimmedInput.includes("/training/modules/")) {
            return "module-url";
        }

        // Default to module for other Learn URLs
        return "module-url";
    } else if (trimmedInput.includes("/paths/")) {
        return "learning-path-folder";
    } else {
        return "module-folder";
    }
}

/**
 * Converts a uid to folder path
 * @param uid A uid in the form of 'learn.philanthropies.explore-ai-basics'
 */
function createPathFromUid(uid: string): string {
    // The uids have just learn at the start but the folder path is learn-pr
    return uid
        .trim()
        .split(".")
        .map((part) => (part === "learn" ? "learn-pr" : part))
        .join("/");
}

export const pathUtilities = {
    resolveRelativePath,
    extractFolderPathFromLearnModuleUrl,
    extractFolderPathFromLearnLearningPathUrl,
    detectPathType,
    createPathFromUid,
};
