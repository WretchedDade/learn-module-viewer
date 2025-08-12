import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useScrollReset } from "~/hooks/useScrollReset";
import ModuleCompletionDialog from "~/components/ModuleCompletionDialog";
import { ModuleView } from "~/components/ModuleView";
import { UnitView } from "~/components/UnitView";
import { Module } from "~/github/githubTypes";
import { ModuleSidePanel } from "~/components/side-panel/ModuleSidePanel";
import { LearningPathTab, TabType } from "~/components/side-panel/SidePanel.types";
import { SidePanel } from "~/components/side-panel/SidePanel";
import { ModuleSkeleton, SidePanelHeaderSkeleton } from "~/components/SkeletonLoading";
import { useProgressManagement } from "~/hooks/useProgressManagement";
import { getModuleByUidOptions } from "~/queries/useCatalogQueries";
import { useModuleContentById } from "~/queries/useContentById";

export const Route = createFileRoute("/modules/$uid")({
    component: ModuleDetail,
    loader: async ({ params, context: { queryClient } }) => {
        queryClient.prefetchQuery(getModuleByUidOptions(params.uid));
    },
});

type ModuleOnlyTabType = Exclude<TabType, LearningPathTab>;

function ModuleDetail() {
    const { uid } = Route.useParams();

    const moduleQuery = useModuleContentById(uid);
    const [activeTab, setActiveTab] = useState<ModuleOnlyTabType>({ type: "module", moduleId: uid });
    const mainRef = useRef<HTMLElement | null>(null);
    const resetScroll = useScrollReset({ container: mainRef });

    const [completedModule, setCompletedModule] = useState<Module | null>(null);

    const { state: progress, start, complete } = useProgressManagement();

    const onTabChange = (tab: ModuleOnlyTabType, triggerCompletion: boolean = false) => {
        setActiveTab(tab);

        if (triggerCompletion) {
            switch (activeTab.type) {
                case "module":
                    complete(activeTab.moduleId);
                    break;
                case "unit":
                    complete(activeTab.unit.uid);
                    break;
            }
        }

        switch (tab.type) {
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
            {completedModule != null && (
                <ModuleCompletionDialog
                    module={completedModule}
                    open
                    onClose={() => {
                        setCompletedModule(null);
                        onTabChange({ type: "module", moduleId: uid }, true);
                    }}
                />
            )}

            <div className="flex h-[calc(100dvh-66px)] overflow-hidden dark:bg-zinc-900">
                {moduleQuery.isSuccess && (
                    <ModuleSidePanel
                        module={moduleQuery.data}
                        activeTab={activeTab}
                        progress={progress}
                        setActiveTab={(tab) => onTabChange(tab as ModuleOnlyTabType)}
                    />
                )}

                {moduleQuery.isLoading && (
                    <SidePanel header={<SidePanelHeaderSkeleton />}>
                        <ModuleSkeleton showUnits />
                    </SidePanel>
                )}

                <main ref={mainRef} className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {moduleQuery.isSuccess && (
                            <>
                                {activeTab.type === "module" && (
                                    <ModuleView
                                        progress={progress}
                                        module={moduleQuery.data}
                                        onUnitSelected={(unit) =>
                                            onTabChange({
                                                type: "unit",
                                                unit,
                                                moduleId: activeTab.moduleId,
                                            })
                                        }
                                    />
                                )}

                                {activeTab.type === "unit" && (
                                    <UnitView
                                        progress={progress}
                                        unit={activeTab.unit}
                                        module={moduleQuery.data}
                                        onUnitSelected={(unit) =>
                                            onTabChange({
                                                type: "unit",
                                                unit,
                                                moduleId: activeTab.moduleId,
                                            })
                                        }
                                        onUnitCompleted={(nextUnit) =>
                                            onTabChange(
                                                {
                                                    type: "unit",
                                                    unit: nextUnit,
                                                    moduleId: activeTab.moduleId,
                                                },
                                                true,
                                            )
                                        }
                                        onModuleCompleted={(module) => {
                                            onTabChange({ type: "module", moduleId: module.uid! }, true);
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
