interface EnhancedImageProps {
    src: string;
    alt: string;
    type?: string;
}

// Enhanced image component with type-based styling and features
export function EnhancedImage({ 
    src, 
    alt, 
    type = "content"
}: EnhancedImageProps) {
    // Different styling based on image type
    const getImageClasses = () => {
        const baseClasses = "max-w-full h-auto rounded-lg";
        
        switch (type) {
            case "content":
                return `${baseClasses} bg-zinc-200 dark:bg-zinc-800 p-8 shadow-lg`;
            case "diagram":
                return `${baseClasses} bg-white p-2`;
            case "screenshot":
                return `${baseClasses} shadow-xl`;
            case "icon":
                return "w-8 h-8 inline-block";
            default:
                return baseClasses;
        }
    };

    const getContainerClasses = () => {
        switch (type) {
            case "content":
            case "diagram":
            case "screenshot":
                return "my-4 text-center";
            case "icon":
                return "inline-block mx-1";
            default:
                return "my-4";
        }
    };

    return (
        <div className={getContainerClasses()}>
            <img 
                src={src} 
                alt={alt}
                className={getImageClasses()}
                loading="lazy"
            />
            {(type === "content" || type === "diagram" || type === "screenshot") && alt && (
                <div className="mt-2 text-sm text-zinc-400 italic text-center">
                    {alt}
                </div>
            )}
        </div>
    );
}
