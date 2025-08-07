import { BookOpenIcon, DocumentTextIcon, HomeModernIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";
import { ContentDownloadResult } from "~/github/githubService";
import { isLearningPath, isModule, LearningPath, Module, Unit } from "~/github/githubTypes";

type OverviewTab = { type: "overview" };
type UnitTab = { type: "unit"; unit: Unit; module: Module; learningPath?: LearningPath };
type ModuleTab = { type: "module"; module: Module; learningPath?: LearningPath };
type LearningPathTab = { type: "learningPath"; learningPath: LearningPath };
export type TabType = OverviewTab | UnitTab | ModuleTab | LearningPathTab;

interface SidePanelProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;

    isLoading: boolean;
    result: ContentDownloadResult | null | undefined;
}

export function SidePanel({ activeTab, setActiveTab, isLoading, result }: SidePanelProps) {
    return (
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-semibold text-white mb-4">Learn Content Viewer</h2>

                <nav className="space-y-2">
                    {/* Download & Stats Tab */}
                    <button
                        onClick={() => setActiveTab({ type: "overview" })}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab.type === "overview" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                    >
                        <div className="flex items-center">
                            <HomeModernIcon className="w-4 h-4 mr-2" />
                            Overview
                        </div>
                    </button>

                    {result?.status === "success" && isModule(result.content) && (
                        <ModuleOptions module={result.content} activeTab={activeTab} onTabSelected={setActiveTab} />
                    )}

                    {result?.status === "success" && isLearningPath(result.content) && (
                        <LearningPathOptions
                            learningPath={result.content}
                            activeTab={activeTab}
                            onTabSelected={setActiveTab}
                        />
                    )}

                    {/* Loading State */}
                    {isLoading && <div className="mt-4 px-3 py-2 text-gray-400 text-sm">Loading content...</div>}

                    {/* No Data State */}
                    {result == null && !isLoading && (
                        <div className="mt-4 px-3 py-2 text-gray-500 text-sm">
                            Initiate the content download process to see options here.
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
}

interface LearningPathOptionsProps {
    learningPath: LearningPath;
    activeTab: TabType;
    onTabSelected: (newTab: UnitTab | ModuleTab | LearningPathTab) => void;
}
function LearningPathOptions({ learningPath, activeTab, onTabSelected }: LearningPathOptionsProps) {
    const isUnitActive = (unit: Unit) => activeTab.type === "unit" && activeTab.unit.uid === unit.uid;
    const isLearningPathActive = activeTab.type === "learningPath" && activeTab.learningPath.uid === learningPath.uid;

    const isExpanded =
        isLearningPathActive ||
        (activeTab.type === "module" && activeTab.learningPath?.uid === learningPath.uid) ||
        (activeTab.type === "unit" && activeTab.learningPath?.uid === learningPath.uid);

    return (
        <div className="border border-gray-500 rounded-md overflow-hidden">
            {/* Learning Path header - display only since onTabSelected doesn't support learningPath type */}
            <button
                onClick={() => onTabSelected({ type: "learningPath", learningPath })}
                className={clsx(`w-full text-left p-2 bg-gray-700 text-gray-200`, {
                    "rounded-b-none": isExpanded,
                })}
            >
                <div className="flex items-center">
                    <AcademicCapIcon
                        className={clsx("w-4 h-4 mr-2 flex-shrink-0", {
                            "text-blue-500": isLearningPathActive,
                        })}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{learningPath.title || "Untitled Learning Path"}</div>
                        {learningPath.summary && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{learningPath.summary}</div>
                        )}
                    </div>
                </div>
            </button>

            {/* Modules list - only show when expanded */}
            {learningPath.modules && learningPath.modules.length > 0 && isExpanded && (
                <div className="bg-gray-900 rounded-b-md">
                    {learningPath.modules.map((module, index) => (
                        <ModuleOptions
                            key={module.uid || index}
                            module={module}
                            learningPath={learningPath}
                            activeTab={activeTab}
                            onTabSelected={onTabSelected}
                        />
                    ))}
                </div>
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

    const underLearningPath = learningPath != null;
    const isExpanded = isModuleActive || (activeTab.type === "unit" && activeTab.module.uid === module.uid);

    return (
        <div>
            {/* Module header */}
            <button
                onClick={() => onTabSelected({ type: "module", module, learningPath })}
                className={clsx(`w-full text-left px-4 py-2 transition-color`, {
                    "bg-gray-800": underLearningPath,
                    "rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white": !underLearningPath,
                    "rounded-b-none": isExpanded,
                })}
            >
                <div className="flex items-center">
                    <BookOpenIcon
                        className={clsx("w-4 h-4 mr-2 flex-shrink-0", {
                            "text-blue-500": isModuleActive,
                        })}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{module.title || "Untitled Module"}</div>
                        {module.summary && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{module.summary}</div>
                        )}
                    </div>
                </div>
            </button>

            {/* Units list - only show when expanded */}
            {module.units && module.units.length > 0 && isExpanded && (
                <div className="p-2 space-y-2 bg-gray-900 rounded-b-md">
                    {module.units.map((unit, index) => (
                        <button
                            key={unit.uid || index}
                            onClick={() => onTabSelected({ type: "unit", unit, module, learningPath })}
                            className={clsx(`w-full text-left px-2 py-2 text-sm rounded-md transition-colors text-gray-200 hover:bg-gray-700 hover:text-white`, {
                                "bg-blue-600 text-white": isUnitActive(unit),
                                "text-gray-300": !isUnitActive(unit),
                            })}
                        >
                            <div className="flex">
                                <DocumentTextIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate">
                                        {index + 1}. {unit.title}
                                    </div>
                                    {unit.durationInMinutes && (
                                        <div className="text-xs text-gray-400 mt-1">{unit.durationInMinutes} min</div>
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
