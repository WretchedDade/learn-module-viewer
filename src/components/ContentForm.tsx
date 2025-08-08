import { pathUtilities } from "~/github/pathUtilities";

interface ContentFormProps {
    folderPath: string | undefined;
    setFolderPath: (path: string) => void;
    onLoadModule: () => void;
    isLoading: boolean;
}

export function ContentForm({ folderPath, setFolderPath, onLoadModule, isLoading }: ContentFormProps) {
    const pathType = folderPath ? pathUtilities.detectPathType(folderPath) : null;
    const isLearningPath = pathType === "learning-path-folder" || pathType === "learning-path-url";

    const getButtonText = () => {
        if (isLoading) {
            return isLearningPath ? "Loading Path..." : "Loading...";
        }

        return isLearningPath ? "Load Learning Path" : "Load Content";
    };

    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Load Content</h2>

            <div className="mt-3 text-sm text-gray-400">
                <p className="mb-4">You can provide either:</p>
                <ul className="space-y-4 list-disc list-outside pl-4">
                    <li>
                        <span className="font-medium text-blue-400">Module URL:</span>
                        <div className="text-gray-500 text-xs mt-1">
                            https://learn.microsoft.com/en-us/training/modules/explore-ai-basics/
                        </div>
                    </li>
                    <li>
                        <span className="font-medium text-blue-400">Module Folder:</span>
                        <div className="text-gray-500 text-xs mt-1">learn-pr/philanthropies/explore-ai-basics</div>
                    </li>
                    <li>
                        <span className="font-medium text-green-400">Learning Path URL:</span>
                        <div className="text-gray-500 text-xs mt-1">
                            https://learn.microsoft.com/en-us/training/paths/ai-fluency/
                        </div>
                    </li>
                    <li>
                        <span className="font-medium text-green-400">Learning Path Folder:</span>
                        <div className="text-gray-500 text-xs mt-1">learn-pr/paths/ai-fluency</div>
                    </li>
                </ul>
                <hr className="my-6" />
            </div>

            <div className="mb-6">
                <label htmlFor="folderPath" className="block text-sm font-medium mb-2 text-gray-300">
                    Module/Learning Path Url or Folder:
                </label>

                <input
                    id="folderPath"
                    type="text"
                    value={folderPath || ""}
                    onChange={(e) => setFolderPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="https://learn.microsoft.com/en-us/training/modules/explore-ai-basics/"
                />

                {pathType != null && (
                    <div className="mt-6 p-2 bg-gray-700 rounded-md text-xs">
                        <span className="text-gray-300">Detected: </span>
                        <span className={isLearningPath ? "text-green-400" : "text-blue-400"}>
                            {isLearningPath ? "Learning Path" : "Module"}
                        </span>
                    </div>
                )}
            </div>

            <button
                onClick={onLoadModule}
                disabled={isLoading || !folderPath}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {getButtonText()}
            </button>
        </div>
    );
}
