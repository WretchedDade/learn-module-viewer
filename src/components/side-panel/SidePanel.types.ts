import { Unit } from "~/github/githubTypes";

export type LearningPathTab = { type: "learningPath"; learningPathId: string };

export type UnitTab = { type: "unit"; unit: Unit; moduleId: string; learningPathId?: string };
export type ModuleTab = { type: "module"; moduleId: string; learningPathId?: string };

export type TabType = UnitTab | ModuleTab | LearningPathTab | { type: "overview" } | { type: "error" };