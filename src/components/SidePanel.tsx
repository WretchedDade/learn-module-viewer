import { BookOpenIcon, DocumentTextIcon, HomeModernIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";
import { ContentDownloadResult } from "~/github/githubService";
import { isModule, LearningPath, Module, Unit } from "~/github/githubTypes";

type UnitTab = { type: "unit"; unit: Unit; module: Module };
type ModuleTab = { type: "module"; module: Module };
export type TabType = { type: "overview" } | UnitTab | ModuleTab | { type: "learning-path"; learningPath: LearningPath };

interface SidePanelProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;

    isLoading: boolean;
    result: ContentDownloadResult | null | undefined;
}

export function SidePanel({ activeTab, setActiveTab, isLoading, result }: SidePanelProps) {
    const isActive = (tabType: string, unit?: any, moduleRef?: any) => {
        if (tabType === "overview") return activeTab.type === "overview";
        if (tabType === "unit") return activeTab.type === "unit" && activeTab.unit === unit;
        // if (tabType === "learning-path") return activeTab.type === "learning-path" && activeTab.learningPath === learningPath;
        // if (tabType === "module-in-path") return activeTab.type === "module-in-path" && activeTab.moduleRef === moduleRef;
        return false;
    };

    return (
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-semibold text-white mb-4">Learn Content Viewer</h2>

                <nav className="space-y-2">
                    {/* Download & Stats Tab */}
                    <button
                        onClick={() => setActiveTab({ type: "overview" })}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${isActive("overview") ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                    >
                        <div className="flex items-center">
                            <HomeModernIcon className="w-4 h-4 mr-2" />
                            Overview
                        </div>
                    </button>

                    {result?.status === "success" && isModule(result.content) && <ModuleOptions module={result.content} activeTab={activeTab} onTabSelected={setActiveTab} />}

                    {/* Loading State */}
                    {isLoading && <div className="mt-4 px-3 py-2 text-gray-400 text-sm">Loading content...</div>}

                    {/* No Data State */}
                    {result == null && !isLoading && <div className="mt-4 px-3 py-2 text-gray-500 text-sm">Initiate the content download process to see options here.</div>}
                </nav>
            </div>
        </aside>
    );
}

interface ModuleOptionsProps {
    module: Module;

    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab) => void;
}

function ModuleOptions({ module, activeTab, onTabSelected }: ModuleOptionsProps) {
    const isUnitActive = (unit: Unit) => activeTab.type === "unit" && activeTab.unit.uid === unit.uid;
    const isModuleActive = activeTab.type === "module" && activeTab.module.uid === module.uid;

    const isExpanded = isModuleActive || (activeTab.type === "unit" && activeTab.module.uid === module.uid);

    return (
        <div>
            {/* Module header */}
            <button
                onClick={() => onTabSelected({ type: "module", module })}
                className={clsx(`w-full text-left px-2 py-2 rounded-md transition-color`, {
                    "bg-blue-600 text-white": isModuleActive,
                    "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white": !isModuleActive,
                    "rounded-b-none": isExpanded,
                })}
            >
                <div className="flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{module.title || "Untitled Module"}</div>
                        {module.summary && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{module.summary}</div>}
                    </div>
                </div>
            </button>

            {/* Units list - only show when expanded */}
            {module.units && module.units.length > 0 && isExpanded && (
                <div className="p-2 space-y-2 bg-gray-900 rounded-b-md">
                    {module.units.map((unit, index) => (
                        <button
                            key={unit.uid || index}
                            onClick={() => onTabSelected({ type: "unit", unit, module })}
                            className={`w-full text-left px-2 py-2 text-sm rounded-md transition-colors text-gray-200 hover:bg-gray-700 hover:text-white ${isUnitActive(unit) ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                        >
                            <div className="flex">
                                <DocumentTextIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate">
                                        {index + 1}. {unit.title}
                                    </div>
                                    {unit.durationInMinutes && <div className="text-xs text-gray-400 mt-1">{unit.durationInMinutes} min</div>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
