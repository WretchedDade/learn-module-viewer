import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Module } from "~/github/githubTypes";
import { TabType } from "./ModuleViewer";

interface SidePanelProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    moduleData: Module | null;
    isLoading: boolean;
}

export function SidePanel({ activeTab, setActiveTab, moduleData, isLoading }: SidePanelProps) {
    const [unitsExpanded, setUnitsExpanded] = useState(true);

    const isActive = (tabType: string, unit?: any) => {
        if (tabType === 'download') return activeTab.type === 'download';
        if (tabType === 'overview') return activeTab.type === 'overview';
        if (tabType === 'unit') return activeTab.type === 'unit' && activeTab.unit === unit;
        return false;
    };

    return (
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-semibold text-white mb-4">Module Navigation</h2>
                
                <nav className="space-y-2">
                    {/* Download & Stats Tab */}
                    <button
                        onClick={() => setActiveTab({ type: 'download' })}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            isActive('download')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        📥 Download & Stats
                    </button>

                    {/* Module Overview Tab */}
                    {moduleData && (
                        <button
                            onClick={() => setActiveTab({ type: 'overview' })}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                isActive('overview')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            📋 Module Overview
                        </button>
                    )}

                    {/* Units Section */}
                    {moduleData && moduleData.units.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setUnitsExpanded(!unitsExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            >
                                <span className="flex items-center">
                                    📚 Units ({moduleData.units.length})
                                </span>
                                {unitsExpanded ? (
                                    <ChevronDownIcon className="w-4 h-4" />
                                ) : (
                                    <ChevronRightIcon className="w-4 h-4" />
                                )}
                            </button>
                            
                            {unitsExpanded && (
                                <div className="ml-4 mt-2 space-y-1">
                                    {moduleData.units.map((unit, index) => (
                                        <button
                                            key={unit.yaml.uid || index}
                                            onClick={() => setActiveTab({ type: 'unit', unit })}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                                isActive('unit', unit)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        >
                                            <div className="truncate">
                                                {index + 1}. {unit.yaml.title}
                                            </div>
                                            {unit.yaml.durationInMinutes && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {unit.yaml.durationInMinutes} min
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-4 px-3 py-2 text-gray-400 text-sm">
                            Loading module...
                        </div>
                    )}

                    {/* No Data State */}
                    {!moduleData && !isLoading && (
                        <div className="mt-4 px-3 py-2 text-gray-500 text-sm">
                            Load a module to see navigation options
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
}
