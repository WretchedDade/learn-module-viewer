import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { DownloadLearnModuleFromGitHub } from "~/github/githubService";
import { ModuleForm } from "~/components/ModuleForm";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { ModuleOverview } from "~/components/ModuleOverview";
import { UnitsList } from "~/components/UnitsList";
import { ImagesGallery } from "~/components/ImagesGallery";
import { MarkdownFiles } from "~/components/MarkdownFiles";
import { ModuleStatistics } from "~/components/ModuleStatistics";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const downloadModule = useServerFn(DownloadLearnModuleFromGitHub);

    const [folderPath, setFolderPath] = useState<string>("learn-pr/aspnetcore/build-web-api-minimal-api");
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
    });

    const handleLoadModule = () => {
        if (folderPath) {
            setQueryTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-900 min-h-screen text-gray-100">
            <ModuleForm
                folderPath={folderPath}
                setFolderPath={setFolderPath}
                onLoadModule={handleLoadModule}
                isLoading={moduleQuery.isFetching}
            />

            <ErrorDisplay error={moduleQuery.error} />

            {moduleQuery.data && (
                <div className="space-y-6">
                    <ModuleOverview
                        title={moduleQuery.data.title}
                        summary={moduleQuery.data.summary}
                        abstract={moduleQuery.data.abstract}
                        levels={moduleQuery.data.levels}
                        roles={moduleQuery.data.roles}
                        products={moduleQuery.data.products}
                    />

                    <UnitsList units={moduleQuery.data.units} imageReferenceMap={moduleQuery.data.imageReferenceMap} />

                    <ImagesGallery images={moduleQuery.data.images} />

                    <MarkdownFiles markdownFiles={moduleQuery.data.markdownFiles} imageReferenceMap={moduleQuery.data.imageReferenceMap} />

                    <ModuleStatistics
                        units={moduleQuery.data.units}
                        images={moduleQuery.data.images}
                        markdownFiles={moduleQuery.data.markdownFiles}
                        codeFiles={moduleQuery.data.codeFiles}
                        performance={moduleQuery.data.performance}
                    />
                </div>
            )}
        </div>
    );
}
