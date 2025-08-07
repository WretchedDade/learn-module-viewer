import { createServerFn } from "@tanstack/react-start";

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

    // Content arrays
    units: Unit[];
    markdownFiles: Markdown[];
    images: Image[];
    codeFiles: CodeFile[];

    // Quick lookup maps
    imagesByPath: Record<string, string>; // path -> dataUrl
    imageReferenceMap: Record<string, string>; // imageRef -> dataUrl (for enhanced images)
    unitsByUid: Record<string, Unit>; // uid -> unit
    markdownByPath: Record<string, Markdown>; // path -> markdown
    codeFilesByPath: Record<string, CodeFile>; // path -> code file

    // Performance metrics
    performance?: {
        duration: number; // milliseconds
        durationFormatted: string; // human readable
    };
}

export interface Unit {
    yaml: UnitYaml;
    markdownContent?: string;
}

export interface Markdown {
    path: string;
    name: string;
    content: string;
}

export interface Image {
    path: string;
    name: string;
    dataUrl: string;
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