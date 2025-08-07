interface VideoBlockProps {
    url: string;
}

export function VideoBlock({ url }: VideoBlockProps) {
    // Helper function to extract video ID and platform
    const getVideoInfo = (url: string) => {
        // YouTube patterns
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return {
                platform: 'youtube',
                id: youtubeMatch[1],
                embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
            };
        }

        // Vimeo patterns
        const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return {
                platform: 'vimeo',
                id: vimeoMatch[1],
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
            };
        }

        // Microsoft Learn / go.microsoft.com patterns
        // These often redirect to other platforms, so we'll handle them as generic embeds
        if (url.includes('go.microsoft.com') || url.includes('learn.microsoft.com')) {
            return {
                platform: 'microsoft',
                id: null,
                embedUrl: url // Will need to handle redirects in a more sophisticated way
            };
        }

        // Direct video file patterns
        const videoFileRegex = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
        if (videoFileRegex.test(url)) {
            return {
                platform: 'direct',
                id: null,
                embedUrl: url
            };
        }

        // Default: treat as generic embed
        return {
            platform: 'generic',
            id: null,
            embedUrl: url
        };
    };

    const videoInfo = getVideoInfo(url);

    // Render based on platform
    const renderVideo = () => {
        switch (videoInfo.platform) {
            case 'youtube':
            case 'vimeo':
                return (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                        <iframe
                            className="absolute top-0 left-0 w-full h-full rounded"
                            src={videoInfo.embedUrl}
                            title="Video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );

            case 'direct':
                return (
                    <video
                        className="w-full rounded"
                        controls
                        preload="metadata"
                    >
                        <source src={videoInfo.embedUrl} />
                        Your browser does not support the video tag.
                    </video>
                );

            case 'microsoft':
                // For Microsoft Learn videos, we'll try to embed them directly
                // but provide a fallback link if embedding fails
                return (
                    <div className="space-y-3">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded"
                                src={videoInfo.embedUrl}
                                title="Microsoft Learn Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="text-center">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                                Open video in new tab
                            </a>
                        </div>
                    </div>
                );

            default:
                // Generic fallback - try iframe but provide link as backup
                return (
                    <div className="space-y-3">
                        <div className="text-center p-4 bg-gray-800 rounded border border-gray-600">
                            <div className="text-gray-300 mb-2">📹 Video Content</div>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                Watch Video
                            </a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="my-4 video-block">
            {renderVideo()}
        </div>
    );
}
