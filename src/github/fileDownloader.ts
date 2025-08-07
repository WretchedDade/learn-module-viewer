import { GithubContentItem } from "./githubTypes";
import { utils } from "./utils";

// Simple in-memory cache for downloaded content
const downloadCache = new Map<string, Promise<string>>();

async function downloadFile(url: string) {
    // Check cache first
    if (downloadCache.has(url)) {
        return await downloadCache.get(url)!;
    }

    // Create promise and cache it immediately to prevent duplicate requests
    const downloadPromise = (async () => {
        const fileName = url.split("/").pop() || "unknown";

        const response = await utils.throttledFetch(url, {
            headers: utils.createGitHubHeaders(),
        });

        // Check for rate limiting
        if (response.status === 403 || response.status === 429) {
            const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
            const rateLimitReset = response.headers.get("x-ratelimit-reset");
            const rateLimitLimit = response.headers.get("x-ratelimit-limit");
            const retryAfter = response.headers.get("retry-after");

            console.error("Rate limiting detected:", {
                status: response.status,
                statusText: response.statusText,
                file: fileName,
                authStatus: utils.authStatus,
                rateLimitRemaining,
                rateLimitLimit,
                rateLimitReset: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : null,
                retryAfter: retryAfter ? `${retryAfter} seconds` : null,
            });

            throw new Error(
                `Rate limited while downloading ${fileName}. Status: ${response.status}. ${utils.authStatus === "unauthenticated" ? "Consider adding a GitHub token for higher rate limits." : ""}`,
            );
        }

        if (!response.ok) {
            throw new Error(`Failed to download ${fileName}: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    })();

    downloadCache.set(url, downloadPromise);
    return await downloadPromise;
}

async function downloadFolderContents(path: string): Promise<GithubContentItem[]> {
    const apiUrl = `https://api.github.com/repos/MicrosoftDocs/learn/contents/${path}`;

    const response = await utils.throttledFetch(apiUrl, {
        headers: utils.createGitHubHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Error fetching folder contents: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Downloads a media file from a URL and returns a data URL.
 * @param url The URL of the media file.
 * @param name The name of the media file.
 * @returns A promise that resolves to a data URL containing the media file.
 */
async function downloadMedia(url: string, name: string): Promise<string> {
    const response = await utils.throttledFetch(url, {
        headers: utils.createGitHubHeaders(),
    });
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Determine MIME type based on extension
    const extension = name.split(".").pop()?.toLowerCase();
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

    return `data:${mimeType};base64,${base64}`;
}

export const fileDownloader = {
    clearCache: () => downloadCache.clear(),
    downloadFile,
    downloadFolderContents,
	downloadMedia
};
