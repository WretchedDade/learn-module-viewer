import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ContentForm } from "~/components/ContentForm";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { LearningPathView } from "~/components/LearningPathView";
import ModuleCompletionDialog from "~/components/ModuleCompletionDialog";
import { ModuleView } from "~/components/ModuleView";
import { Overview } from "~/components/Overview";
import { SidePanel, TabType } from "~/components/SidePanel";
import { UnitView } from "~/components/UnitView";
import { ContentDownloadResult, DownloadContentFromGitHub } from "~/github/githubService";
import { isLearningPath, isModule, Module, Progress } from "~/github/githubTypes";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const [activeTab, setActiveTab] = useState<TabType>({ type: "overview" });
    const [folderPath, setFolderPath] = useState<string>("learn-pr/paths/ai-fluency");

    const [result, setResult] = useState<ContentDownloadResult | null>(null);

    const [completedModule, setCompletedModule] = useState<Module | null>(null);

    const downloadContent = useServerFn(DownloadContentFromGitHub);
    const mutation = useMutation({
        mutationFn: (data: { folderPath: string }) => downloadContent({ data }),
        onSuccess: (data) => {
            setResult(data);

            if (data.status === "success") {
                if (isModule(data.content)) {
                    setActiveTab({ type: "module", module: data.content });
                } else if (isLearningPath(data.content)) {
                    setActiveTab({ type: "learningPath", learningPath: data.content });
                }
            } else {
                setActiveTab({ type: "error" });
            }
        },
    });

    const onTabChange = (tab: TabType, triggerCompletion: boolean = false) => {
        setActiveTab(tab);

        if (triggerCompletion) {
            completeContent(activeTab, result);
        }

        startIfNotStarted(tab, result);
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100">
            <ErrorDisplay error={mutation.error} />

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

            <div className="flex h-screen bg-gray-900">
                <SidePanel
                    activeTab={activeTab}
                    setActiveTab={onTabChange}
                    result={result}
                    isLoading={mutation.isPending}
                    onExperienceReset={() => {
                        setResult(null);
                        setActiveTab({ type: "overview" });
                    }}
                />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 mx-auto">
                        {activeTab.type === "overview" && (
                            <Overview
                                folderPath={folderPath}
                                setFolderPath={setFolderPath}
                                onLoadModule={() => mutation.mutate({ folderPath })}
                                isLoading={mutation.isPending}
                                result={result}
                            />
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

/**
 * Completes the content's progress state.
 * @param previousTab The previous active tab.
 * @param result The result of the content download.
 */
function completeContent(previousTab: TabType, result: ContentDownloadResult | null) {
    if (result?.status !== "success") return;

    if (previousTab.type === "learningPath") {
        if (isLearningPath(result.content)) {
            result.content.progress = "completed";
        }
    }

    if (previousTab.type === "module") {
        if (isModule(result.content)) {
            result.content.progress = "completed";
        } else if (isLearningPath(result.content)) {
            for (const module of result.content.modules) {
                if (module.uid === previousTab.module.uid) {
                    module.progress = "completed";
                }
            }
        }
    }

    if (previousTab.type === "unit") {
        if (isModule(result.content)) {
            for (const unit of previousTab.module.units) {
                if (unit.uid === previousTab.unit.uid) {
                    unit.progress = "completed";
                }
            }
        } else if (isLearningPath(result.content)) {
            for (const module of result.content.modules) {
                for (const unit of module.units) {
                    if (unit.uid === previousTab.unit.uid) {
                        unit.progress = "completed";
                    }
                }
            }
        }
    }
}

/**
 * Starts the content's progress state if it has not been started yet.
 * @param newTab The new tab to switch to.
 * @param result The result of the content download.
 */
function startIfNotStarted(newTab: TabType, result: ContentDownloadResult | null) {
    if (result?.status !== "success") return;

    if (newTab.type === "learningPath") {
        if (isLearningPath(result.content) && result.content.progress === "not-started") {
            result.content.progress = "started";
        }
    }

    if (newTab.type === "module") {
        if (isModule(result.content) && result.content.progress === "not-started") {
            result.content.progress = "started";
        } else if (isLearningPath(result.content)) {
            for (const module of result.content.modules) {
                if (module.uid === newTab.module.uid && module.progress === "not-started") {
                    module.progress = "started";
                }
            }
        }
    }

    if (newTab.type === "unit") {
        if (isModule(result.content)) {
            for (const unit of newTab.module.units) {
                if (unit.uid === newTab.unit.uid && unit.progress === "not-started") {
                    unit.progress = "started";
                }
            }
        } else if (isLearningPath(result.content)) {
            for (const module of result.content.modules) {
                for (const unit of module.units) {
                    if (unit.uid === newTab.unit.uid && unit.progress === "not-started") {
                        unit.progress = "started";
                    }
                }
            }
        }
    }
}
