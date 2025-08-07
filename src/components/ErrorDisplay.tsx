interface ErrorDisplayProps {
    error: Error | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
    if (!error) return null;

    return (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error.message || "Failed to load module"}
        </div>
    );
}
