import yaml from "js-yaml";
import { fileDownloader } from "./fileDownloader";
import { LearningPath, LearningPathYaml, Module, ModuleYaml, Unit, UnitYaml } from "./githubTypes";
import { markdownProcessor } from "./markdownProcessor";
import { pathUtilities } from "./pathUtilities";
import { githubRegex } from "./regex";

async function processLearnYaml(downloadUrl: string, path: string): Promise<Unit | Module | null> {
    const yamlContent = await fileDownloader.downloadFile(downloadUrl);

    if (yamlContent.startsWith("### YamlMime:ModuleUnit")) {
        return await processUnitYaml(path, yamlContent);
    } else if (yamlContent.startsWith("### YamlMime:Module")) {
        return processModuleYaml(path, yamlContent);
    } else return null;
}

function processModuleYaml(path: string, yamlContent: string): Module {
    const parsed = yaml.load(yamlContent) as ModuleYaml;

    return {
        title: parsed.title,
        summary: parsed.summary,
        abstract: parsed.abstract,
        iconUrl: parsed.iconUrl,
        levels: parsed.levels,
        roles: parsed.roles,
        products: parsed.products,
        prerequisites: parsed.prerequisites,
        badgeUid: parsed.badge?.uid,
        uid: parsed.uid,

        units: [],
        imageReferenceMap: {},
    };
}

async function processUnitYaml(path: string, yamlContent: string): Promise<Unit> {
    const unitYaml = yaml.load(yamlContent) as UnitYaml;

    const unit: Unit = {
        path: path,

        uid: unitYaml.uid,
        title: unitYaml.title,
        metadata: unitYaml.metadata,
        durationInMinutes: unitYaml.durationInMinutes,
        content: unitYaml.content,
    };

    // Look for include tags in the content property to find the markdown file
    if (unitYaml.content) {
        const includeMatch = unitYaml.content.match(githubRegex.include);

        if (includeMatch) {
            // Resolve the relative path from the YAML file's directory using our helper function
            const fullMarkdownPath = pathUtilities.resolveRelativePath(`./${includeMatch[1]}`, path);
            unit.markdownContent = await markdownProcessor.downloadLearnMarkdown(fullMarkdownPath);
        } else {
            console.warn("No include tag found in unit content:", unitYaml.title);
        }
    }

    return unit;
}

function processLearningPathYaml(yamlContent: string): { learningPath: LearningPath; moduleUids: string[] } {
    const learningPathYaml = yaml.load(yamlContent) as LearningPathYaml;

    const learningPath: LearningPath = {
        uid: learningPathYaml.uid,
        title: learningPathYaml.title,
        summary: learningPathYaml.summary,
        iconUrl: learningPathYaml.iconUrl,
        levels: learningPathYaml.levels,
        roles: learningPathYaml.roles,
        products: learningPathYaml.products,
        modules: [],
    };

    return { learningPath, moduleUids: learningPathYaml.modules };
}

export const yamlProcessor = {
    processLearnYaml,
    processLearningPathYaml,
};
