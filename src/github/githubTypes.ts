export interface YamlMetadata {
    title: string;
    description: string;
    "ms.date": string;
    author: string;
    "ms.author": string;
    manager: string;
    "ms.custom": string;
    "ms.topic": string;
    "ms.service": string;
}

export interface ModuleYaml {
    uid: string;
    metadata: Partial<YamlMetadata>;
    title: string;
    summary: string;
    abstract: string;
    iconUrl: string;
    levels: string[];
    roles: string[];
    products: string[];
    prerequisites: string;
    units: string[];
    badge: {
        uid: string;
    };
}

export interface UnitYaml {
    uid: string;
    title: string;
    metadata: Partial<YamlMetadata>;
    durationInMinutes: number;
    content: string;
}

export interface Folder {
    name: string;
    path: string;
}

export interface GithubContentItem {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: "file" | "dir";
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export interface Module {
    // Module metadata (flattened from ModuleYaml)
    title?: string;
    summary?: string;
    abstract?: string;
    iconUrl?: string;
    levels?: string[];
    roles?: string[];
    products?: string[];
    prerequisites?: string;
    badgeUid?: string;
    uid?: string;

    // Content arrays and maps
    units: Unit[];
    imageReferenceMap: Record<string, string>; // imageRef -> dataUrl (for enhanced images)
}

export interface Unit {
    path: string;

    // Unit metadata (flattened from UnitYaml)
    uid: string;
    title: string;
    metadata: Partial<YamlMetadata>;
    durationInMinutes: number;
    content: string;

    markdownContent?: string;
}

export interface CodeFile {
    path: string;
    name: string;
    content: string;
    language?: string;
    sourceMarkdownPath?: string; // Track which markdown file referenced this
}

export interface CodeDirective {
    language: string;
    source: string;
    highlight?: string;
    range?: string;
    id?: string;
}

// Learning Path Types
export interface LearningPathYaml {
    uid: string;
    trophy?: {
        uid: string;
    };
    metadata: Partial<YamlMetadata>;
    title: string;
    summary: string;
    iconUrl: string;
    levels: string[];
    roles: string[];
    products: string[];
    modules: string[]; // References to module UIDs
}

export interface LearningPath {
    // Learning path metadata (flattened from LearningPathYaml)
    title?: string;
    summary?: string;
    abstract?: string;
    iconUrl?: string;
    levels?: string[];
    roles?: string[];
    products?: string[];
    prerequisites?: string;
    uid?: string;

    // Content arrays
    modules: Module[];
}

// Type guards
export function isUnit(content: Unit | Module | LearningPath): content is Unit {
    return !isModule(content) && !isLearningPath(content);
}

export function isModule(content: Unit | Module | LearningPath): content is Module {
    return "units" in content;
}

export function isLearningPath(content: Unit | Module | LearningPath): content is LearningPath {
    return "modules" in content;
}

// Content union type
export type Content = Module | LearningPath;
