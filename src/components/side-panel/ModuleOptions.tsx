import clsx from "clsx";
import { UnitTab, ModuleTab, TabType } from "./SidePanel.types";
import { Module } from "~/github/githubTypes";
import { UnitOption } from "./UnitOption";
import { ProgressIcon } from "../ProgressIcon";
import { useScrollReset } from "~/hooks/useScrollReset";
import { ProgressMap } from "~/hooks/useProgressManagement";

export interface ModuleOptionsProps {
    module: Module;
    learningPathId?: string;

    progress: ProgressMap;

    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab) => void;
}

export function ModuleOptions({ module, learningPathId, activeTab, onTabSelected, progress }: ModuleOptionsProps) {
    const isModuleActive = activeTab.type === "module" && activeTab.moduleId === module.uid;
    const isChildUnitActive = activeTab.type === "unit" && activeTab.moduleId === module.uid;

    const isExpanded = isModuleActive || isChildUnitActive;

    return (
        <div>
            <button
                onClick={() => {
                    onTabSelected({ type: "module", moduleId: module.uid!, learningPathId });
                }}
                className={clsx(
                    "w-full text-left px-4 py-2 transition-colors rounded-md bg-zinc-300 text-zinc-800 hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:hover:text-white",
                    { "rounded-b-none": isExpanded },
                )}
            >
                <div className="flex">
                    <ProgressIcon className="mt-1" progress={isModuleActive ? "active" : progress[module.uid!] ?? "not-started"} />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{module.title}</div>
                        {module.summary && (
                            <div className="text-xs text-zinc-700 dark:text-zinc-400 mt-1 line-clamp-2">
                                {module.summary}
                            </div>
                        )}
                    </div>
                </div>
            </button>

            {module.units.length > 0 && isExpanded && (
                <div className="p-2 space-y-2 bg-zinc-100 dark:bg-zinc-900 rounded-b-md">
                    {module.units.map((unit, index) => (
                        <UnitOption
                            key={`UnitOption-${unit.uid}`}
                            ordinal={index + 1}
                            unit={unit}
                            moduleId={module.uid!}
                            learningPathId={learningPathId}
                            activeTab={activeTab}
                            onTabSelected={onTabSelected}
                            progress={progress[unit.uid] ?? "not-started"}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
