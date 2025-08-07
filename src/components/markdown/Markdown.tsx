import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { CalloutBlock } from "./CalloutBlock";
import { EnhancedCodeBlock } from "./EnhancedCodeBlock";
import { EnhancedImage } from "./EnhancedImage";
import { remarkEnhancedCodeBlocks } from "./remarkEnhancedCodeBlocks";
import { remarkEnhancedImages } from "./remarkEnhancedImages";
import { VideoBlock } from "./VideoBlock";

interface MarkdownProps {
    content: string;
    images: Record<string, string>; // imageRef -> dataUrl
}

export function Markdown({ content, images }: MarkdownProps) {
    const markdownComponents = {
        // Custom styling for markdown elements to match dark theme
        h1: ({ children }: any) => <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-lg font-semibold text-gray-100 mb-2 mt-3 first:mt-0">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-md font-medium text-gray-200 mb-2 mt-3 first:mt-0">{children}</h3>,
        p: ({ children }: any) => {
            // Helper function to extract text content from React elements
            const extractTextContent = (element: any): string => {
                if (typeof element === "string") return element;
                if (Array.isArray(element)) return element.map(extractTextContent).join("");
                if (element?.props?.children) return extractTextContent(element.props.children);
                return "";
            };

            // Get the full text content of the paragraph
            const fullText = extractTextContent(children);
            const trimmedText = fullText.trim();

            // Check if this is a video block pattern: [!VIDEO URL]
            const videoMatch = trimmedText.match(/^\[!VIDEO\s+(.+?)\]$/);

            if (videoMatch) {
                const videoUrl = videoMatch[1].trim();
                return <VideoBlock url={videoUrl} />;
            }

            // Regular paragraph
            return <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>;
        },
        ul: ({ children }: any) => <ul className="list-disc list-outside text-gray-300 mb-3 space-y-1 pl-6">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal list-outside text-gray-300 mb-3 space-y-1 pl-6">{children}</ol>,
        li: ({ children }: any) => <li className="text-gray-300">{children}</li>,
        blockquote: ({ children }: any) => {
            // Try to render as a callout first
            const callout = CalloutBlock({ children });
            if (callout) {
                return callout;
            }

            // Regular blockquote
            return <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-3">{children}</blockquote>;
        },
        code: ({ node, inline, className, children, ...props }: any) => {
            // Check if this is inline code (either inline=true or no parent pre element)
            const isInline = inline === true || (inline !== false && !className?.includes("language-"));

            if (!isInline) {
                // Block code (with syntax highlighting)
                return (
                    <code className={className} {...props}>
                        {children}
                    </code>
                );
            } else {
                // Inline code
                return (
                    <code className="bg-gray-800 p-1 rounded text-sm font-mono" {...props}>
                        {children}
                    </code>
                );
            }
        },
        pre: ({ children, ...props }: any) => {
            // Check if the child code element has enhanced properties
            const codeElement = children?.props;
            const codeNode = codeElement?.node;

            if (codeNode?.properties?.["data-enhanced"] === "true") {
                const language = codeNode.properties["data-language"] || "";
                // Try data-code first (from our plugin), fall back to extracting from children
                const code =
                    codeNode.properties["data-code"] || (typeof codeElement?.children === "string" ? codeElement.children : Array.isArray(codeElement?.children) ? codeElement.children.join("") : "");
                const highlight = codeNode.properties["data-highlight"];
                const filename = codeNode.properties["data-filename"];
                const source = codeNode.properties["data-source"];

                return <EnhancedCodeBlock code={code} language={language} highlight={highlight} filename={filename} source={source} />;
            }

            // Extract language from className for normal code blocks
            const className = codeElement?.className || "";
            const languageMatch = className.match(/language-(\w+)/);
            const language = languageMatch ? languageMatch[1] : null;

            // Normal pre block with optional language label in top right
            return (
                <div className="relative mb-3">
                    <pre className="bg-gray-800 overflow-x-auto p-3 rounded" {...props}>
                        {children}
                    </pre>
                    {language && <div className="absolute top-2 right-2 bg-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-400">{language}</div>}
                </div>
            );
        },
        a: ({ children, href }: any) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
        table: ({ children }: any) => (
            <div className="overflow-x-auto mb-3">
                <table className="min-w-full border-collapse border border-gray-600">{children}</table>
            </div>
        ),
        th: ({ children }: any) => <th className="border border-gray-600 bg-gray-700 text-gray-200 px-3 py-2 text-left font-semibold">{children}</th>,
        td: ({ children }: any) => <td className="border border-gray-600 text-gray-300 px-3 py-2">{children}</td>,
        div: ({ className, ...props }: any) => {
            // Handle enhanced code blocks
            if (className?.includes("enhanced-code-block")) {
                const language = props["data-language"] || "";
                const code = props["data-code"] || "";
                const highlight = props["data-highlight"];
                const filename = props["data-filename"];
                const source = props["data-source"];

                return <EnhancedCodeBlock code={code} language={language} highlight={highlight} filename={filename} source={source} />;
            }

            // Regular div
            return <div className={className} {...props} />;
        },
        img: ({ src, alt, node, ...props }: any) => {
            // Check if this is an enhanced image
            const isEnhanced = node?.properties?.["data-enhanced"] === "true";

            if (isEnhanced) {
                const imageRef = node.properties["data-ref"];
                const type = node.properties["data-type"];
                const source = node.properties["data-source"];

                // Get the actual image data from the images prop
                const imageData = images[imageRef];

                if (imageData) {
                    return <EnhancedImage src={imageData} alt={alt} type={type} />;
                } else {
                    // Fallback for missing image data
                    console.warn(`Image data not found for reference: ${imageRef}`);
                    return (
                        <div className="my-4 p-4 border border-red-500 rounded bg-red-900/20 text-center">
                            <div className="text-red-400 text-sm">⚠️ Image not available: {source || imageRef}</div>
                            {alt && <div className="text-gray-400 text-xs mt-1">{alt}</div>}
                        </div>
                    );
                }
            }

            // Regular image
            return <img src={src} alt={alt} className="max-w-full h-auto rounded my-3" loading="lazy" {...props} />;
        },
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkEnhancedCodeBlocks, remarkEnhancedImages, remarkGfm, remarkBreaks]}
            rehypePlugins={[
                [
                    rehypeHighlight,
                    {
                        detect: true,
                        ignoreMissing: true,
                        aliases: {
                            js: "javascript",
                            ts: "typescript",
                            jsx: "javascript",
                            tsx: "typescript",
                        },
                    },
                ],
            ]}
            components={markdownComponents}
        >
            {content}
        </ReactMarkdown>
    );
}
