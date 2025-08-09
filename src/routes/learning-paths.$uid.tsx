import { createFileRoute } from "@tanstack/react-router";
import { useLearningPathByUid } from "../queries/useCatalogQueries";
import { completeContent, SidePanel, startIfNotStarted, TabType } from "~/components/SidePanel";
import { DownloadLearningPathFromGitHub } from "~/github/githubService";
import { useQuery } from "@tanstack/react-query";
import { isLearningPath, isModule, Module } from "~/github/githubTypes";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { LearningPathView } from "~/components/LearningPathView";
import ModuleCompletionDialog from "~/components/ModuleCompletionDialog";
import { ModuleView } from "~/components/ModuleView";
import { Overview } from "~/components/Overview";
import { UnitView } from "~/components/UnitView";

export const Route = createFileRoute("/learning-paths/$uid")({
    component: LearningPathDetail,
});

function LearningPathDetail() {
    const { uid } = Route.useParams();
    const metadataQuery = useLearningPathByUid(uid);

    const [activeTab, setActiveTab] = useState<TabType>({ type: "overview" });

    const [completedModule, setCompletedModule] = useState<Module | null>(null);

    const downloadContent = useServerFn(DownloadLearningPathFromGitHub);
    const learningPathQuery = useQuery({
        queryKey: ["learning-path", uid],
        queryFn: () => downloadContent({ data: { folderPath: metadataQuery.data!.url } }),
        enabled: metadataQuery.isSuccess,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const result = learningPathQuery.data ?? null;

    const onTabChange = (tab: TabType, triggerCompletion: boolean = false) => {
        setActiveTab(tab);

        if (triggerCompletion) {
            completeContent(activeTab, result);
        }

        startIfNotStarted(tab, result);
    };

    return (
        <div className="dark:bg-zinc-900 min-h-screen dark:text-zinc-100">
            <ErrorDisplay error={learningPathQuery.error} />

            {completedModule != null && (
                <ModuleCompletionDialog
                    module={completedModule}
                    open
                    onClose={() => {
                        setCompletedModule(null);

                        if (result?.status === "success") {
                            if (isLearningPath(result.content)) {
                                onTabChange({ type: "learningPath", learningPath: result.content }, true);
                            }

                            if (isModule(result.content)) {
                                onTabChange({ type: "module", module: result.content }, true);
                            }
                        }
                    }}
                />
            )}

            <div className="flex h-screen dark:bg-zinc-900">
                <SidePanel
                    activeTab={activeTab}
                    setActiveTab={onTabChange}
                    result={result}
                    isLoading={learningPathQuery.isLoading}
                />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {activeTab.type === "overview" && (
                            <>
                                {/* loading state... */}
                                {/* idk? */}
                            </>
                        )}

                        {activeTab.type === "learningPath" && (
                            <LearningPathView
                                learningPath={activeTab.learningPath}
                                onModuleSelected={(module) =>
                                    onTabChange({ type: "module", module, learningPath: activeTab.learningPath })
                                }
                            />
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
