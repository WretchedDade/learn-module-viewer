import { LearningPathRecord } from "~/microsoft-learn/responses";
import { LearningPathOptions } from "./LearningPathOptions";
import { TabType } from "./SidePanel.types";
import { SidePanel, SidePanelHeader } from "./SidePanel";
import { ProgressMap } from "~/hooks/useProgressManagement";

interface LearningPathSidePanelProps {
    progress: ProgressMap;
    learningPath: LearningPathRecord;
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

export function LearningPathSidePanel({ learningPath, activeTab, setActiveTab, progress }: LearningPathSidePanelProps) {
    return (
        <SidePanel header={<SidePanelHeader title={learningPath.title} type="Learning Path" />} >
            <LearningPathOptions learningPath={learningPath} activeTab={activeTab} onTabSelected={setActiveTab} progress={progress} />
        </SidePanel>
    );
}
