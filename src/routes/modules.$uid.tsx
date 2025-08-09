import { createFileRoute } from "@tanstack/react-router";
import { useModuleByUid } from "../queries/useCatalogQueries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { LearningPathView } from "~/components/LearningPathView";
import ModuleCompletionDialog from "~/components/ModuleCompletionDialog";
import { ModuleView } from "~/components/ModuleView";
import { Overview } from "~/components/Overview";
import { TabType, completeContent, startIfNotStarted, SidePanel, LearningPathTab } from "~/components/SidePanel";
import { UnitView } from "~/components/UnitView";
import { ContentDownloadResult, DownloadContentFromGitHub, DownloadModuleFromGitHub } from "~/github/githubService";
import { isModule, isLearningPath, Module } from "~/github/githubTypes";

export const Route = createFileRoute("/modules/$uid")({
    component: ModuleDetail,
});

type ModuleOnlyTabType = Exclude<TabType, LearningPathTab>;

function ModuleDetail() {
    const { uid } = Route.useParams();

    const metadataQuery = useModuleByUid(uid);

    const [activeTab, setActiveTab] = useState<ModuleOnlyTabType>({ type: "overview" });

    const [completedModule, setCompletedModule] = useState<Module | null>(null);

    const downloadContent = useServerFn(DownloadModuleFromGitHub);
    const moduleQuery = useQuery({
        queryKey: ["module", uid],
        queryFn: () => downloadContent({ data: { folderPath: metadataQuery.data!.url } }),
        enabled: metadataQuery.isSuccess,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (moduleQuery.data?.status === "success" && activeTab.type === "overview") {
            setActiveTab({ type: "module", module: moduleQuery.data.content });
        }
    }, [moduleQuery, activeTab]);

    const result = moduleQuery.data ?? null;

    const onTabChange = (tab: ModuleOnlyTabType, triggerCompletion: boolean = false) => {
        setActiveTab(tab);

        if (triggerCompletion) {
            completeContent(activeTab, result);
        }

        startIfNotStarted(tab, result);
    };

    return (
        <div className="dark:bg-zinc-900 min-h-[calc(100dvh-5rem)] dark:text-zinc-100">
            <ErrorDisplay error={moduleQuery.error} />

            {completedModule != null && (
                <ModuleCompletionDialog
                    module={completedModule}
                    open
                    onClose={() => {
                        setCompletedModule(null);

                        if (result?.status === "success") {
                            onTabChange({ type: "module", module: result.content }, true);
                        }
                    }}
                />
            )}

            <div className="flex h-[calc(100dvh-66px)] overflow-hidden dark:bg-zinc-900">
                <SidePanel
                    activeTab={activeTab}
                    setActiveTab={(tab) => onTabChange(tab as ModuleOnlyTabType)}
                    result={result}
                    isLoading={moduleQuery.isLoading}
                />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {activeTab.type === "overview" && (
                            <>
                            {/* loading state... */}
                            {/* idk? */}
                            </>
                        )}

                        {activeTab.type === "module" && (
                            <ModuleView
                                module={activeTab.module}
                                onUnitSelected={(unit) =>
                                    onTabChange({
                                        type: "unit",
                                        unit,
                                        module: activeTab.module,
                                        learningPath: activeTab.learningPath,
                                    })
                                }
                            />
                        )}

                        {activeTab.type === "unit" && (
                            <UnitView
                                unit={activeTab.unit}
                                module={activeTab.module}
                                onUnitSelected={(unit) =>
                                    onTabChange({
                                        type: "unit",
                                        unit,
                                        module: activeTab.module,
                                        learningPath: activeTab.learningPath,
                                    })
                                }
                                onUnitCompleted={(nextUnit) =>
                                    onTabChange(
                                        {
                                            type: "unit",
                                            unit: nextUnit,
                                            module: activeTab.module,
                                            learningPath: activeTab.learningPath,
                                        },
                                        true,
                                    )
                                }
                                onModuleCompleted={(module) => {
                                    onTabChange({ type: "module", module, learningPath: activeTab.learningPath }, true);
                                    setCompletedModule(module);
                                }}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
