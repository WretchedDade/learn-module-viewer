import { Unit } from "~/github/githubTypes";
import { Markdown } from "./markdown/Markdown";

interface UnitViewProps {
    unit: Unit;
    images?: Record<string, string>; // imageRef -> dataUrl
}

export function UnitView({ unit, images = {} }: UnitViewProps) {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="p-6 space-y-8 bg-gray-800 rounded-3xl">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-200 mb-4">{unit.title}</h1>

                {/* Unit Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {unit.durationInMinutes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-600">Duration</div>
                            <div className="text-lg font-semibold text-blue-900">{unit.durationInMinutes} minutes</div>
                        </div>
                    )}

                    {unit.uid && (
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-400">Unit ID</div>
                            <div className="text-sm font-mono text-gray-200 break-all">{unit.uid}</div>
                        </div>
                    )}

                    {unit.path && (
                        <div className="bg-gray-900 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-400">File Path</div>
                            <div className="text-sm font-mono text-gray-200 break-all">{unit.path}</div>
                        </div>
                    )}
                </div>

                {/* Additional Metadata */}
                {unit.metadata && Object.keys(unit.metadata).length > 0 && (
                    <div className="bg-gray-900 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-200 mb-3">Metadata</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {unit.metadata.description && (
                                <div>
                                    <span className="font-medium text-gray-400">Description:</span>
                                    <p className="text-gray-200 mt-1">{unit.metadata.description}</p>
                                </div>
                            )}

                            {unit.metadata.author && (
                                <div>
                                    <span className="font-medium text-gray-400">Author:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata.author}</span>
                                </div>
                            )}

                            {unit.metadata["ms.author"] && (
                                <div>
                                    <span className="font-medium text-gray-400">MS Author:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata["ms.author"]}</span>
                                </div>
                            )}

                            {unit.metadata["ms.date"] && (
                                <div>
                                    <span className="font-medium text-gray-400">Last Updated:</span>
                                    <span className="text-gray-200 ml-2">{formatDate(unit.metadata["ms.date"])}</span>
                                </div>
                            )}

                            {unit.metadata.manager && (
                                <div>
                                    <span className="font-medium text-gray-400">Manager:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata.manager}</span>
                                </div>
                            )}

                            {unit.metadata["ms.service"] && (
                                <div>
                                    <span className="font-medium text-gray-400">Service:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata["ms.service"]}</span>
                                </div>
                            )}

                            {unit.metadata["ms.topic"] && (
                                <div>
                                    <span className="font-medium text-gray-400">Topic:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata["ms.topic"]}</span>
                                </div>
                            )}

                            {unit.metadata["ms.custom"] && (
                                <div>
                                    <span className="font-medium text-gray-400">Custom:</span>
                                    <span className="text-gray-200 ml-2">{unit.metadata["ms.custom"]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="prose prose-lg max-w-none">
                {unit.markdownContent  ? (
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Content</h2>
                        <div className="bg-gray-900 rounded-lg border border-gray-200 p-6">
                            <Markdown content={unit.markdownContent} images={images} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-200 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">No Content Available</h3>
                                <p className="text-sm text-yellow-700 mt-1">This unit doesn't have any markdown content to display.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
