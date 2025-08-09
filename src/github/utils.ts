// Request queue and batching configuration
const MAX_CONCURRENT_REQUESTS = 15; // Increased from 10 for better performance
let activeRequests = 0;
const requestQueue: Array<() => Promise<any>> = [];

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

const accessToken = process.env.GITHUB_ACCESS_TOKEN;

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

export const utils = {
    throttledFetch,
    createGitHubHeaders,
    authStatus: accessToken ? "authenticated" : "unauthenticated",
    formatDuration,
} as const;

