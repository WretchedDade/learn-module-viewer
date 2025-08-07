import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { ModuleViewer } from "~/components/ModuleViewer";
import { DownloadLearnModuleFromGitHub } from "~/github/githubService";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const downloadModule = useServerFn(DownloadLearnModuleFromGitHub);

    const [folderPath, setFolderPath] = useState<string>("https://learn.microsoft.com/en-us/training/modules/explore-ai-basics/");
    const [queryTrigger, setQueryTrigger] = useState(0);

    const moduleQuery = useQuery({
        queryKey: ["module-download", folderPath, queryTrigger],
        queryFn: ({ queryKey: [_, folderPath, __] }) => {
            if (!folderPath || typeof folderPath !== 'string') {
                return Promise.resolve(null);
            }
            
            return downloadModule({ data: { folderPath } });
        },
        enabled: !!folderPath && queryTrigger > 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const handleLoadModule = () => {
        if (folderPath) {
            setQueryTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100">
            <ErrorDisplay error={moduleQuery.error} />
            
            <ModuleViewer
                folderPath={folderPath}
                setFolderPath={setFolderPath}
                onLoadModule={handleLoadModule}
                isLoading={moduleQuery.isFetching}
                moduleData={moduleQuery.data || null}
            />
        </div>
    );
}
