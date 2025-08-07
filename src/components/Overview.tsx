import { ContentDownloadResult } from "~/github/githubService";
import { isLearningPath, isModule } from "~/github/githubTypes";
import { ContentForm } from "./ContentForm";

interface OverviewProps {
    folderPath: string;
    setFolderPath: (path: string) => void;
    onLoadModule: () => void;
    isLoading: boolean;

    result: ContentDownloadResult | null | undefined;
}

export function Overview({ folderPath, setFolderPath, onLoadModule, isLoading, result }: OverviewProps) {
    return (
        <div className="space-y-6">
            <ContentForm folderPath={folderPath} setFolderPath={setFolderPath} onLoadModule={onLoadModule} isLoading={isLoading} />
            
            {result && (
                <div className="bg-gray-800 rounded-3xl p-6">
                    {result.status === "success" ? (
                        <div className="space-y-6">
                            {/* Success Header */}
                            <div className="border-b border-gray-700 pb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <h2 className="text-xl font-semibold text-gray-200">Content Loaded Successfully</h2>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Loaded in {result.performance.durationFormatted}
                                </p>
                            </div>

                            {/* Content Summary */}
                            <div className="space-y-4">
                                {isModule(result.content) && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-200 mb-3">Module Overview</h3>
                                        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-200 mb-1">
                                                        {result.content.title || "Untitled Module"}
                                                    </h4>
                                                    {result.content.summary && (
                                                        <p className="text-gray-400 text-sm mb-2">
                                                            {result.content.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-700">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-400">
                                                        {result.content.units?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Units</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-400">
                                                        {result.content.units?.reduce((total, unit) => total + (unit.durationInMinutes || 0), 0) || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Minutes</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-400">
                                                        {result.content.levels?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Levels</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-400">
                                                        {result.content.roles?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Roles</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isLearningPath(result.content) && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-200 mb-3">Learning Path Overview</h3>
                                        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-200 mb-1">
                                                        {result.content.title || "Untitled Learning Path"}
                                                    </h4>
                                                    {result.content.summary && (
                                                        <p className="text-gray-400 text-sm mb-2">
                                                            {result.content.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-700">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-400">
                                                        {result.content.modules?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Modules</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-400">
                                                        {result.content.modules?.reduce((total, module) => 
                                                            total + (module.units?.length || 0), 0) || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Total Units</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-400">
                                                        {result.content.levels?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Levels</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-400">
                                                        {result.content.roles?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Roles</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Performance Details */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-200 mb-3">Performance</h3>
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Load Time:</span>
                                            <span className="text-gray-200 font-mono">
                                                {result.performance.durationFormatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Error Header */}
                            <div className="border-b border-gray-700 pb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <h2 className="text-xl font-semibold text-gray-200">Error Loading Content</h2>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Failed after {result.performance.durationFormatted}
                                </p>
                            </div>

                            {/* Error Message */}
                            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                <p className="text-red-300">{result.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
