import { useState } from "react";
import { Markdown } from "./Markdown";

interface MarkdownContentProps {
    content: string;
    title?: string;
    previewLength?: number;
    showFullContent?: boolean;
    expandedDisplay?: boolean; // New prop to disable collapsible wrapper
    images?: Record<string, string>; // imageRef -> data URL
}

export function MarkdownContent({ content, title = "View Content", previewLength = 500, showFullContent = false, expandedDisplay = false, images }: MarkdownContentProps) {
    const [showRaw, setShowRaw] = useState(false);
    const preview = content.substring(0, previewLength);
    const hasMore = content.length > previewLength;
    const displayContent = showFullContent ? content : preview;

    // If expandedDisplay is true, render without collapsible wrapper
    if (expandedDisplay) {
        return (
            <div className="prose prose-invert max-w-none">
                <Markdown content={displayContent} images={images ?? {}} />
            </div>
        );
    }

    return (
        <details className="mt-2">
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300">{title}</summary>
            <div className="mt-2 p-3 bg-zinc-700 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-zinc-400">{showRaw ? "Raw Markdown" : "Rendered"}</div>
                    <button onClick={() => setShowRaw(!showRaw)} className="text-xs bg-zinc-600 hover:bg-zinc-500 text-zinc-200 px-2 py-1 rounded transition-colors">
                        {showRaw ? "Show Rendered" : "Show Raw"}
                    </button>
                </div>

                {showRaw ? (
                    <pre className="bg-zinc-800 overflow-x-auto p-3 rounded text-xs text-zinc-300 whitespace-pre-wrap">{displayContent}</pre>
                ) : (
                    <Markdown content={displayContent} images={images ?? {}} />
                )}

                {hasMore && !showFullContent && <div className="mt-2 text-zinc-400 text-xs">... (content truncated)</div>}
            </div>
        </details>
    );
}
