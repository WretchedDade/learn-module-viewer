import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface CalloutBlockProps {
    children: any;
}

export function CalloutBlock({ children }: CalloutBlockProps) {
    // Helper function to extract text content from React elements
    const extractTextContent = (element: any): string => {
        if (typeof element === "string") return element;
        if (Array.isArray(element))
            return element.map(extractTextContent).join("");
        if (element?.props?.children)
            return extractTextContent(element.props.children);
        return "";
    };

    // Get the full text content of the blockquote
    const fullText = extractTextContent(children);
    
    const trimmedText = fullText.trim();

    // Check if this starts with a callout pattern (allowing for whitespace/newlines at the start)
    const calloutMatch = trimmedText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
    
    // Also try a more permissive regex
    const permissiveMatch = trimmedText.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);

    if (calloutMatch || permissiveMatch) {
        const match = calloutMatch || permissiveMatch;
        const calloutType = match![1];

        // Remove the callout marker from the text and create new content
        const cleanedText = trimmedText
            .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/, "")
            .trim();
        const calloutStyles = {
            NOTE: {
                border: "border-blue-500",
                bg: "bg-blue-900/20",
                icon: "ℹ️",
                iconColor: "text-blue-400",
            },
            TIP: {
                border: "border-green-500",
                bg: "bg-green-900/20",
                icon: "💡",
                iconColor: "text-green-400",
            },
            IMPORTANT: {
                border: "border-purple-500",
                bg: "bg-purple-900/20",
                icon: "❗",
                iconColor: "text-purple-400",
            },
            WARNING: {
                border: "border-yellow-500",
                bg: "bg-yellow-900/20",
                icon: "⚠️",
                iconColor: "text-yellow-400",
            },
            CAUTION: {
                border: "border-red-500",
                bg: "bg-red-900/20",
                icon: "🚨",
                iconColor: "text-red-400",
            },
        };

        const style =
            calloutStyles[calloutType as keyof typeof calloutStyles] ||
            calloutStyles.NOTE;

        return (
            <div
                className={`${style.border} ${style.bg} border-l-4 rounded-r p-4 my-4`}
            >
                <div className="flex items-start gap-2">
                    <span
                        className={`${style.iconColor} text-lg flex-shrink-0`}
                    >
                        {style.icon}
                    </span>
                    <div className="flex-1">
                        <div
                            className={`${style.iconColor} font-semibold text-sm uppercase tracking-wide mb-1`}
                        >
                            {calloutType}
                        </div>
                        <div className="text-gray-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                    // Basic components for callout content (no recursive callouts)
                                    p: ({ children }: any) => (
                                        <p className="text-gray-300 mb-2 leading-relaxed last:mb-0">
                                            {children}
                                        </p>
                                    ),
                                    code: ({
                                        inline,
                                        children,
                                        ...props
                                    }: any) =>
                                        inline ? (
                                            <code
                                                className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded text-sm font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        ) : (
                                            <code
                                                className="block bg-gray-800 p-2 rounded text-sm font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        ),
                                    strong: ({ children }: any) => (
                                        <strong className="font-semibold text-gray-100">
                                            {children}
                                        </strong>
                                    ),
                                    em: ({ children }: any) => (
                                        <em className="italic">{children}</em>
                                    ),
                                    a: ({ children, href }: any) => (
                                        <a
                                            href={href}
                                            className="text-blue-400 hover:text-blue-300 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {cleanedText}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not a callout, return null to let the parent handle as regular blockquote
    return null;
}
