import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ContentForm } from "~/components/ContentForm";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { ModuleView } from "~/components/ModuleView";
import { Overview } from "~/components/Overview";
import { SidePanel, TabType } from "~/components/SidePanel";
import { UnitView } from "~/components/UnitView";
import { DownloadContentFromGitHub } from "~/github/githubService";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const [activeTab, setActiveTab] = useState<TabType>({ type: "overview" });
    const [folderPath, setFolderPath] = useState<string>("learn-pr/paths/ai-fluency");

    const downloadContent = useServerFn(DownloadContentFromGitHub);
    const mutation = useMutation({
        mutationFn: (data: { folderPath: string }) => downloadContent({ data }),
    });

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100">
            <ErrorDisplay error={mutation.error} />

            <div className="flex h-screen bg-gray-900">
                <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} result={mutation.data} isLoading={mutation.isPending} />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {activeTab.type === "overview" && (
                            <Overview folderPath={folderPath} setFolderPath={setFolderPath} onLoadModule={() => mutation.mutate({ folderPath })} isLoading={mutation.isPending} result={mutation.data} />
                        )}

                        {activeTab.type === "module" && <ModuleView module={activeTab.module} />}
                        {activeTab.type === "unit" && <UnitView unit={activeTab.unit} images={activeTab.module.imageReferenceMap} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
