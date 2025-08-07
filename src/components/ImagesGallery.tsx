interface Image {
    path: string;
    name: string;
    dataUrl: string;
}

interface ImagesGalleryProps {
    images: Image[];
}

export function ImagesGallery({ images }: ImagesGalleryProps) {
    if (images.length === 0) return null;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
                Images ({images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="border border-gray-600 bg-gray-750 rounded p-2"
                    >
                        <img
                            src={image.dataUrl}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded mb-2"
                        />
                        <div
                            className="text-xs text-gray-400 truncate"
                            title={image.name}
                        >
                            {image.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
