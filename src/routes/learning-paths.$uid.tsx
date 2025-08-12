import { createFileRoute } from "@tanstack/react-router";
import { useLearningPathByUid } from "../queries/useCatalogQueries";
import { Module, Unit, Progress } from "~/github/githubTypes";
import { act, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScrollReset } from "~/hooks/useScrollReset";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { LearningPathView } from "~/components/LearningPathView";
import ModuleCompletionDialog from "~/components/ModuleCompletionDialog";
import { ModuleView, ModuleViewProps } from "~/components/ModuleView";
import { UnitView, UnitViewProps } from "~/components/UnitView";
import { useModuleContentById } from "~/queries/useContentById";
import { TabType } from "~/components/side-panel/SidePanel.types";
import { LearningPathSidePanel } from "~/components/side-panel/LearningPathSidePanel";
import { useProgressManagement } from "~/hooks/useProgressManagement";

// Progress state decoupled from content objects
interface ModuleProgressState {
    progress: Progress; // module progress
    totalUnits: number;
    units: Record<string, Progress>; // unitId -> progress
}
type ModuleProgressMap = Record<string, ModuleProgressState>;

export const Route = createFileRoute("/learning-paths/$uid")({
    component: LearningPathDetail,
});

function LearningPathDetail() {
    const { uid } = Route.useParams();

    const learningPathQuery = useLearningPathByUid(uid);

    const [activeTab, setActiveTab] = useState<TabType>({ type: "learningPath", learningPathId: uid });
    const mainRef = useRef<HTMLElement | null>(null);
    const resetScroll = useScrollReset({ container: mainRef });

    const [completedModule, setCompletedModule] = useState<Module | null>(null);

    const { state: progress, start, complete } = useProgressManagement();

    const onTabChange = (tab: TabType, triggerCompletion: boolean = false) => {
        setActiveTab(tab);

        if (triggerCompletion) {
            switch (activeTab.type) {
                case "learningPath":
                    complete(activeTab.learningPathId);
                    break;
                case "module":
                    complete(activeTab.moduleId);
                    break;
                case "unit":
                    complete(activeTab.unit.uid);
                    break;
            }
        }

        switch (tab.type) {
            case "learningPath":
                start(tab.learningPathId);
                break;
            case "module":
                start(tab.moduleId);
                break;
            case "unit":
                start(tab.unit.uid);
                break;
        }

        requestAnimationFrame(() => resetScroll());
    };

    return (
        <div className="dark:bg-zinc-900 min-h-[calc(100dvh-5rem)] dark:text-zinc-100">
            <ErrorDisplay error={learningPathQuery.error} />

            {completedModule != null && (
                <ModuleCompletionDialog
                    module={completedModule}
                    open
                    onClose={() => {
                        setCompletedModule(null);
                        onTabChange({ type: "learningPath", learningPathId: uid }, true);
                    }}
                />
            )}

            <div className="flex h-[calc(100dvh-66px)] dark:bg-zinc-900">
                {learningPathQuery.isSuccess && (
                    <LearningPathSidePanel
                        progress={progress}
                        learningPath={learningPathQuery.data}
                        activeTab={activeTab}
                        setActiveTab={onTabChange}
                    />
                )}

                <main ref={mainRef} className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {learningPathQuery.isSuccess && (
                            <>
                                {activeTab.type === "learningPath" && (
                                    <LearningPathView
                                        progress={progress}
                                        learningPathId={uid}
                                        onModuleSelected={(moduleId) =>
                                            onTabChange({ type: "module", moduleId, learningPathId: uid })
                                        }
                                    />
                                )}
                                {activeTab.type === "module" && (
                                    <ModuleViewWithFetching
                                        progress={progress}
                                        moduleId={activeTab.moduleId}
                                        onUnitSelected={(unit) => {
                                            onTabChange({
                                                type: "unit",
                                                unit,
                                                moduleId: activeTab.moduleId,
                                                learningPathId: activeTab.learningPathId,
                                            });
                                        }}
                                    />
                                )}
                                {activeTab.type === "unit" && (
                                    <UnitViewWithFetching
                                        progress={progress}
                                        unit={activeTab.unit}
                                        moduleId={activeTab.moduleId}
                                        onUnitSelected={(unit) =>
                                            onTabChange({
                                                type: "unit",
                                                unit,
                                                moduleId: activeTab.moduleId,
                                                learningPathId: activeTab.learningPathId,
                                            })
                                        }
                                        onUnitCompleted={(nextUnit) => {
                                            onTabChange(
                                                {
                                                    type: "unit",
                                                    unit: nextUnit,
                                                    moduleId: activeTab.moduleId,
                                                    learningPathId: activeTab.learningPathId,
                                                },
                                                true,
                                            );
                                        }}
                                        onModuleCompleted={(module) => {
                                            onTabChange(
                                                {
                                                    type: "module",
                                                    moduleId: module.uid!,
                                                    learningPathId: activeTab.learningPathId,
                                                },
                                                true,
                                            );

                                            complete(module.uid!);
                                            setCompletedModule(module);
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

interface ModuleViewWithFetchingProps extends Omit<ModuleViewProps, "module"> {
    moduleId: string;
}

function ModuleViewWithFetching({ moduleId, ...props }: ModuleViewWithFetchingProps) {
    const moduleQuery = useModuleContentById(moduleId);

    if (moduleQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (!moduleQuery.isSuccess) {
        return <div>Error loading module</div>;
    }

    return <ModuleView module={moduleQuery.data} {...props} />;
}

interface UnitViewWithFetchingProps extends Omit<UnitViewProps, "module"> {
    moduleId: string;
}

function UnitViewWithFetching({ moduleId, ...props }: UnitViewWithFetchingProps) {
    const moduleQuery = useModuleContentById(moduleId);

    if (moduleQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (!moduleQuery.isSuccess) {
        return <div>Error loading module</div>;
    }

    return <UnitView module={moduleQuery.data} {...props} />;
}
