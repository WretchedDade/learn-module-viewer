import { Progress, Unit } from "~/github/githubTypes";
import { ProgressIcon } from "../ProgressIcon";
import { TabType, UnitTab } from "./SidePanel.types";

interface UnitOptionProps {
    unit: Unit;
    moduleId: string;
    learningPathId?: string;

    ordinal: number;
    progress: Progress;

    activeTab: TabType;
    onTabSelected: (tab: UnitTab) => void;
}

export function UnitOption({ ordinal, unit, moduleId, learningPathId, activeTab, onTabSelected, progress }: UnitOptionProps) {
    const isActive = activeTab.type === "unit" && activeTab.unit.uid === unit.uid;

    return (
        <button
            title={unit.title}
            onClick={() => onTabSelected({ type: "unit", unit: unit, moduleId, learningPathId })}
            className="w-full text-left pl-3 pr-2 py-2 text-sm rounded-md transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
        >
            <div className="flex items-center">
                <ProgressIcon progress={isActive ? "active" : progress  } />
                <div className="min-w-0 flex-1">
                    <div className="truncate">
                        {ordinal}. {unit.title}
                    </div>
                    {unit.durationInMinutes && (
                        <div className="text-xs text-zinc-800 dark:text-zinc-400 mt-1">
                            {unit.durationInMinutes} min
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}