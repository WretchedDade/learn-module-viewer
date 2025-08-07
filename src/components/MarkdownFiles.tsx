import { MarkdownContent } from "./MarkdownContent";

interface Markdown {
    path: string;
    name: string;
    content: string;
}

interface MarkdownFilesProps {
    markdownFiles: Markdown[];
    imageReferenceMap?: Record<string, string>; // imageRef -> data URL
}

export function MarkdownFiles({ markdownFiles, imageReferenceMap }: MarkdownFilesProps) {
    if (markdownFiles.length === 0) return null;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
                Standalone Markdown Files ({markdownFiles.length})
            </h2>
            <div className="space-y-2">
                {markdownFiles.map((markdown, index) => (
                    <div
                        key={index}
                        className="border border-gray-600 bg-gray-750 rounded p-3"
                    >
                        <h3 className="font-medium text-gray-200 mb-2">
                            {markdown.name}
                        </h3>
                        <MarkdownContent 
                            content={markdown.content} 
                            title="View File Content"
                            showFullContent
                            images={imageReferenceMap}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
