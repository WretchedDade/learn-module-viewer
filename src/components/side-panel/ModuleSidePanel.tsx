import { Module } from "~/github/githubTypes";
import { ModuleOptions } from "./ModuleOptions";
import { TabType } from "./SidePanel.types";
import { SidePanel, SidePanelHeader } from "./SidePanel";
import { ProgressMap } from "~/hooks/useProgressManagement";

interface ModuleSidePanelProps {
    progress: ProgressMap;
    module: Module;
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

export function ModuleSidePanel({ module, activeTab, setActiveTab, progress }: ModuleSidePanelProps) {
    return (
        <SidePanel header={<SidePanelHeader title={module.title!} type="Module" />}>
            <ModuleOptions module={module} activeTab={activeTab} onTabSelected={setActiveTab} progress={progress} />
        </SidePanel>
    );
}
