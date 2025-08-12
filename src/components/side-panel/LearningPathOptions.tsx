import clsx from "clsx";
import { LearningPathRecord } from "~/microsoft-learn/responses";
import { ModuleOptions, ModuleOptionsProps } from "./ModuleOptions";
import { TabType, UnitTab, ModuleTab, LearningPathTab } from "./SidePanel.types";
import { useModuleContentById } from "~/queries/useContentById";
import { ModuleSkeleton } from "../SkeletonLoading";
import { ProgressMap } from "~/hooks/useProgressManagement";

interface LearningPathOptionsProps {
    progress: ProgressMap;
    learningPath: LearningPathRecord;
    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab | LearningPathTab) => void;
}

export function LearningPathOptions({ learningPath, activeTab, onTabSelected, progress }: LearningPathOptionsProps) {
    const isLearningPathActive = activeTab.type === "learningPath" && activeTab.learningPathId === learningPath.uid;

    return (
        <div className="space-y-4">
            <button
                onClick={() => onTabSelected({ type: "learningPath", learningPathId: learningPath.uid })}
                className={clsx("w-full text-left p-2 dark:text-zinc-200 rounded-md transition-colors", {
                    "dark:bg-blue-600 bg-blue-300 text-zinc-900": isLearningPathActive,
                    "dark:hover:bg-zinc-700 text-zinc-900 hover:bg-blue-300": !isLearningPathActive,
                })}
            >
                Overview
            </button>

            {learningPath.modules.map((moduleId, index) => (
                <ModuleOptionsWithFetching
                    key={`ModuleOptionsWithFetching-${moduleId}`}
                    moduleId={moduleId}
                    activeTab={activeTab}
                    onTabSelected={onTabSelected}
                    progress={progress}
                />
            ))}
        </div>
    );
}
interface ModuleOptionsWithFetchingProps extends Omit<ModuleOptionsProps, "module"> {
    moduleId: string;
}

function ModuleOptionsWithFetching({ moduleId, ...props }: ModuleOptionsWithFetchingProps) {
    const moduleQuery = useModuleContentById(moduleId);

    if (moduleQuery.isLoading) {
        return <ModuleSkeleton showUnits={false} />;
    }

    if (!moduleQuery.isSuccess) {
        return <div>Module not found</div>;
    }

    return <ModuleOptions module={moduleQuery.data} {...props} />;
}
