import {
    BookOpenIcon,
    DocumentTextIcon,
    HomeModernIcon,
    AcademicCapIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    MinusCircleIcon,
    EllipsisHorizontalIcon,
    PlayIcon,
} from "@heroicons/react/24/solid";
import { EllipsisHorizontalCircleIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

import { clsx } from "clsx";
import { ContentDownloadResult } from "~/github/githubService";
import { isLearningPath, isModule, LearningPath, Module, Unit } from "~/github/githubTypes";
import { ProgressIcon } from "./ProgressIcon";
import { SidePanelHeaderSkeleton, LearningPathSkeleton, ModuleSkeleton } from "./SkeletonLoading";
import { ThemeToggleButton } from "./ThemeToggle";

type LearningPathTab = { type: "learningPath"; learningPath: LearningPath };

type UnitTab = { type: "unit"; unit: Unit; module: Module; learningPath?: LearningPath };
type ModuleTab = { type: "module"; module: Module; learningPath?: LearningPath };

export type TabType = UnitTab | ModuleTab | LearningPathTab | { type: "overview" } | { type: "error" };

interface SidePanelProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;

    onExperienceReset: () => void;

    isLoading: boolean;
    result: ContentDownloadResult | null | undefined;
}

export function SidePanel({ activeTab, setActiveTab, onExperienceReset, isLoading, result }: SidePanelProps) {
    const getTitle = () => {
        if (activeTab.type === "learningPath") {
            return activeTab.learningPath.title || "Learning Path";
        } else if (activeTab.type === "module") {
            return activeTab.learningPath?.title ?? activeTab.module.title ?? "Module";
        } else if (activeTab.type === "unit") {
            return activeTab.learningPath?.title ?? activeTab.module.title ?? "Module";
        }

        return "Learn Player";
    };

    return (
        <aside className="w-80 bg-zinc-200 border-zinc-200 dark:bg-zinc-800 border-r dark:border-zinc-700 overflow-y-auto h-full p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 flex items-baseline justify-between">
                {isLoading ? (
                    <SidePanelHeaderSkeleton />
                ) : (
                    <>
                        {getTitle()}
                        {result?.status === "success" && (
                            <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-300 dark:bg-zinc-900 px-2 py-1 rounded-md">
                                {isLearningPath(result.content) ? "Learning Path" : "Module"}
                            </span>
                        )}
                    </>
                )}
            </h2>

            <nav className="flex flex-col space-y-2 grow mt-4 gap-8">
                {/* Loading State */}
                {isLoading && (
                    <div className="grow">
                        <LearningPathSkeleton />
                    </div>
                )}

                {result?.status === "success" && !isLoading && (
                    <>
                        <div className="grow">
                            {isModule(result.content) && (
                                <ModuleOptions
                                    module={result.content}
                                    activeTab={activeTab}
                                    onTabSelected={setActiveTab}
                                />
                            )}

                            {isLearningPath(result.content) && (
                                <LearningPathOptions
                                    learningPath={result.content}
                                    activeTab={activeTab}
                                    onTabSelected={setActiveTab}
                                />
                            )}
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <button
                                onClick={onExperienceReset}
                                className="w-full text-left px-3 py-2 rounded-md hover:text-white active:text-white hover:bg-blue-500 active:bg-blue-600 dark:active:bg-blue-400 transition-colors"
                            >
                                <div className="flex items-center">
                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                    Reset Experience
                                </div>
                            </button>
                            <ThemeToggleButton />
                        </div>
                    </>
                )}

                {/* No Data State */}
                {result == null && !isLoading && (
                    <div className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm grow">
                        Learning path, modules, and units will appear here once you load them from Microsoft Learn or
                        GitHub.
                    </div>
                )}

                {isLoading ||
                    (result?.status !== "success" && (
                        <div className="flex justify-end items-center">
                            <ThemeToggleButton />
                        </div>
                    ))}
            </nav>
        </aside>
    );
}

interface LearningPathOptionsProps {
    learningPath: LearningPath;
    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab | LearningPathTab) => void;
}
function LearningPathOptions({ learningPath, activeTab, onTabSelected }: LearningPathOptionsProps) {
    const isLearningPathActive = activeTab.type === "learningPath" && activeTab.learningPath.uid === learningPath.uid;

    return (
        <div className="space-y-4">
            {/* Learning Path header - display only since onTabSelected doesn't support learningPath type */}
            <button
                onClick={() => onTabSelected({ type: "learningPath", learningPath })}
                className={clsx("w-full text-left p-2 dark:text-zinc-200 rounded-md transition-colors", {
                    "dark:bg-blue-600 bg-blue-300 text-zinc-900": isLearningPathActive,
                    "dark:hover:bg-zinc-700 text-zinc-900 hover:bg-blue-300": !isLearningPathActive,
                })}
            >
                Overview
            </button>

            {/* Modules list - only show when expanded */}
            {learningPath.modules && learningPath.modules.length > 0 && (
                <>
                    {learningPath.modules.map((module, index) => (
                        <ModuleOptions
                            key={module.uid || index}
                            module={module}
                            learningPath={learningPath}
                            activeTab={activeTab}
                            onTabSelected={onTabSelected}
                        />
                    ))}
                </>
            )}
        </div>
    );
}
interface ModuleOptionsProps {
    module: Module;
    learningPath?: LearningPath;

    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab) => void;
}

function ModuleOptions({ module, learningPath, activeTab, onTabSelected }: ModuleOptionsProps) {
    const isUnitActive = (unit: Unit) => activeTab.type === "unit" && activeTab.unit.uid === unit.uid;
    const isModuleActive = activeTab.type === "module" && activeTab.module.uid === module.uid;

    const isChildUnitActive = activeTab.type === "unit" && activeTab.module.uid === module.uid;
    const isExpanded = isModuleActive || (activeTab.type === "unit" && activeTab.module.uid === module.uid);

    return (
        <div>
            {/* Module header */}
            <button
                onClick={() => onTabSelected({ type: "module", module, learningPath })}
                className={clsx(
                    "w-full text-left px-4 py-2 transition-colors rounded-md bg-zinc-300 text-zinc-800 hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:hover:text-white",
                    {
                        "rounded-b-none": isExpanded,
                    },
                )}
            >
                <div className="flex">
                    <ProgressIcon
                        className="mt-1"
                        progress={isModuleActive || isChildUnitActive ? "active" : module.progress}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{module.title || "Untitled Module"}</div>
                        {module.summary && (
                            <div className="text-xs text-zinc-700 dark:text-zinc-400 mt-1 line-clamp-2">{module.summary}</div>
                        )}
                    </div>
                </div>
            </button>

            {/* Units list - only show when expanded */}
            {module.units && module.units.length > 0 && isExpanded && (
                <div className="p-2 space-y-2 bg-zinc-100 dark:bg-zinc-900 rounded-b-md">
                    {module.units.map((unit, index) => (
                        <button
                            title={unit.title}
                            key={unit.uid || index}
                            onClick={() => onTabSelected({ type: "unit", unit, module, learningPath })}
                            className="w-full text-left pl-3 pr-2 py-2 text-sm rounded-md transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                            <div className="flex items-center">
                                <ProgressIcon progress={isUnitActive(unit) ? "active" : unit.progress} />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate">
                                        {index + 1}. {unit.title}
                                    </div>
                                    {unit.durationInMinutes && (
                                        <div className="text-xs text-zinc-800 dark:text-zinc-400 mt-1">
                                            {unit.durationInMinutes} min
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
