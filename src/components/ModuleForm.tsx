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
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-white">
                Learn Module Viewer
            </h1>

            <div className="mb-4">
                <label
                    htmlFor="folderPath"
                    className="block text-sm font-medium mb-2 text-gray-300"
                >
                    Module Path:
                </label>
                <input
                    id="folderPath"
                    type="text"
                    value={folderPath || ""}
                    onChange={(e) => setFolderPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="learn-pr/aspnetcore/build-web-api-minimal-api"
                />
            </div>

            <button
                onClick={onLoadModule}
                disabled={isLoading || !folderPath}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Loading..." : "Load Module"}
            </button>
        </div>
    );
}
