interface ModuleOverviewProps {
    title?: string;
    summary?: string;
    abstract?: string;
    levels?: string[];
    roles?: string[];
    products?: string[];
}

export function ModuleOverview({
    title,
    summary,
    abstract,
    levels,
    roles,
    products,
}: ModuleOverviewProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
                Module Overview
            </h2>

            {title && (
                <div className="mb-3">
                    <h3 className="text-xl font-medium text-blue-400">
                        {title}
                    </h3>
                </div>
            )}

            {summary && (
                <div className="mb-3">
                    <p className="text-gray-300">{summary}</p>
                </div>
            )}

            {abstract && (
                <div className="mb-3">
                    <div className="text-sm text-gray-400">
                        <strong>Abstract:</strong> {abstract}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {levels && (
                    <div>
                        <strong className="text-sm text-gray-400">Levels:</strong>
                        <div className="text-sm text-gray-300">
                            {levels.join(", ")}
                        </div>
                    </div>
                )}

                {roles && (
                    <div>
                        <strong className="text-sm text-gray-400">Roles:</strong>
                        <div className="text-sm text-gray-300">
                            {roles.join(", ")}
                        </div>
                    </div>
                )}

                {products && (
                    <div>
                        <strong className="text-sm text-gray-400">Products:</strong>
                        <div className="text-sm text-gray-300">
                            {products.join(", ")}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
