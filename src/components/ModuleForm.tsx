interface ModuleFormProps {
    folderPath: string | undefined;
    setFolderPath: (path: string) => void;
    onLoadModule: () => void;
    isLoading: boolean;
}

export function ModuleForm({
    folderPath,
    setFolderPath,
    onLoadModule,
    isLoading,
}: ModuleFormProps) {
    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-white">
                Load Module
            </h2>

            <div className="mb-6">
                <label
                    htmlFor="folderPath"
                    className="block text-sm font-medium mb-2 text-gray-300"
                >
                    Module URL or Path:
                </label>
                
                <input
                    id="folderPath"
                    type="text"
                    value={folderPath || ""}
                    onChange={(e) => setFolderPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="https://learn.microsoft.com/en-us/training/modules/explore-ai-basics/"
                />
                
                <div className="mt-3 text-sm text-gray-400">
                    <p className="mb-2">You can provide either:</p>
                    <div className="space-y-1 ml-4">
                        <div>
                            <span className="font-medium text-blue-400">Microsoft Learn URL:</span>
                            <div className="text-gray-500 text-xs mt-1">
                                https://learn.microsoft.com/en-us/training/modules/explore-ai-basics/
                            </div>
                        </div>
                        <div>
                            <span className="font-medium text-green-400">GitHub folder path:</span>
                            <div className="text-gray-500 text-xs mt-1">
                                learn-pr/philanthropies/explore-ai-basics
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onLoadModule}
                disabled={isLoading || !folderPath}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? "Loading..." : "Load Module"}
            </button>
        </div>
    );
}
