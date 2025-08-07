import { useState } from "react";
import { Module, Unit } from "~/github/githubTypes";
import { ModuleForm } from "./ModuleForm";
import { ModuleOverview } from "./ModuleOverview";
import { ModuleStatistics } from "./ModuleStatistics";
import { SidePanel } from "./SidePanel";
import { UnitContent } from "./UnitContent";

interface ModuleViewerProps {
    folderPath: string | undefined;
    setFolderPath: (path: string) => void;
    onLoadModule: () => void;
    isLoading: boolean;
    moduleData: Module | null;
}

export type TabType = 
    | { type: 'download' }
    | { type: 'overview' }
    | { type: 'unit'; unit: Unit };

export function ModuleViewer({ 
    folderPath, 
    setFolderPath, 
    onLoadModule, 
    isLoading, 
    moduleData 
}: ModuleViewerProps) {
    const [activeTab, setActiveTab] = useState<TabType>({ type: 'download' });

    const renderContent = () => {
        if (activeTab.type === 'download') {
            return (
                <div className="space-y-6">
                    <ModuleForm
                        folderPath={folderPath}
                        setFolderPath={setFolderPath}
                        onLoadModule={onLoadModule}
                        isLoading={isLoading}
                    />
                    
                    {moduleData && (
                        <>
                            <ModuleOverview
                                title={moduleData.title}
                                summary={moduleData.summary}
                                abstract={moduleData.abstract}
                                levels={moduleData.levels}
                                roles={moduleData.roles}
                                products={moduleData.products}
                            />
                            
                            <ModuleStatistics
                                units={moduleData.units}
                                images={moduleData.images}
                                markdownFiles={moduleData.markdownFiles}
                                codeFiles={moduleData.codeFiles}
                                performance={moduleData.performance}
                            />
                        </>
                    )}
                </div>
            );
        }

        if (activeTab.type === 'overview' && moduleData) {
            return (
                <div className="space-y-6">
                    <ModuleOverview
                        title={moduleData.title}
                        summary={moduleData.summary}
                        abstract={moduleData.abstract}
                        levels={moduleData.levels}
                        roles={moduleData.roles}
                        products={moduleData.products}
                    />
                </div>
            );
        }

        if (activeTab.type === 'unit' && moduleData) {
            return (
                <UnitContent 
                    unit={activeTab.unit} 
                    imageReferenceMap={moduleData.imageReferenceMap} 
                />
            );
        }

        return null;
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <SidePanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                moduleData={moduleData}
                isLoading={isLoading}
            />
            
            <main className="flex-1 overflow-auto">
                <div className="p-6 mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
