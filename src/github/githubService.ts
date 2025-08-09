import { createServerFn } from "@tanstack/react-start";
import { fileDownloader } from "./fileDownloader";
import { Content, isModule, isUnit, LearningPath, Module, Unit } from "./githubTypes";
import { pathUtilities } from "./pathUtilities";
import { utils } from "./utils";
import { yamlProcessor } from "./yamlProcessor";
import { M } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

export interface ContentDownloadRequest {
    folderPath: string;
}

export interface PerformanceResults {
    duration: number; // milliseconds
    durationFormatted: string; // human readable
}

export type ContentDownloadResult<TContent = Content> =
    | {
          status: "success";
          content: TContent;
          performance: PerformanceResults;
      }
    | {
          status: "error";
          message: string;
          performance: PerformanceResults;
      };

// New content-agnostic download function that routes to appropriate handler
export const DownloadContentFromGitHub = createServerFn()
    .validator((data: ContentDownloadRequest) => data)
    .handler(async ({ data }): Promise<ContentDownloadResult> => {
        const start = performance.now();

        fileDownloader.clearCache();

        let content: Content | null = null;
        const pathType = pathUtilities.detectPathType(data.folderPath);

        if (pathType === "learning-path-folder" || pathType === "learning-path-url") {
            const learningPathFolder =
                pathType === "learning-path-folder"
                    ? data.folderPath
                    : await pathUtilities.extractFolderPathFromLearnLearningPathUrl(data.folderPath);
            content = await downloadLearnLearningPath(learningPathFolder);
        } else if (pathType === "module-folder" || pathType === "module-url") {
            const moduleFolder =
                pathType === "module-folder"
                    ? data.folderPath
                    : await pathUtilities.extractFolderPathFromLearnModuleUrl(data.folderPath);
            content = await downloadLearnModule(moduleFolder);
        }

        const duration = performance.now() - start;

        const performanceResults: PerformanceResults = {
            duration,
            durationFormatted: utils.formatDuration(duration),
        };

        if (content == null) {
            return {
                status: "error",
                message: "No content found or could not be processed.",
                performance: performanceResults,
            };
        }

        return {
            status: "success",
            content,
            performance: performanceResults,
        };
    });

export const DownloadLearningPathFromGitHub = createServerFn()
    .validator((data: ContentDownloadRequest) => data)
    .handler(async ({ data }): Promise<ContentDownloadResult<LearningPath>> => {
        const start = performance.now();

        fileDownloader.clearCache();

        const pathType = pathUtilities.detectPathType(data.folderPath);

        const learningPathFolder =
            pathType === "learning-path-folder"
                ? data.folderPath
                : await pathUtilities.extractFolderPathFromLearnLearningPathUrl(data.folderPath);

        const content = await downloadLearnLearningPath(learningPathFolder);

        const duration = performance.now() - start;

        const performanceResults: PerformanceResults = {
            duration,
            durationFormatted: utils.formatDuration(duration),
        };

        return {
            status: "success",
            content,
            performance: performanceResults,
        };
    });

export const DownloadModuleFromGitHub = createServerFn()
    .validator((data: ContentDownloadRequest) => data)
    .handler(async ({ data }): Promise<ContentDownloadResult<Module>> => {
        const start = performance.now();

        fileDownloader.clearCache();

        const pathType = pathUtilities.detectPathType(data.folderPath);

        const moduleFolder =
            pathType === "module-folder"
                ? data.folderPath
                : await pathUtilities.extractFolderPathFromLearnModuleUrl(data.folderPath);

        const content = await downloadLearnModule(moduleFolder);

        const duration = performance.now() - start;

        const performanceResults: PerformanceResults = {
            duration,
            durationFormatted: utils.formatDuration(duration),
        };

        return {
            status: "success",
            content,
            performance: performanceResults,
        };
    });

async function downloadLearnLearningPath(learningPathFolder: string): Promise<LearningPath> {
    const items = await fileDownloader.downloadFolderContents(learningPathFolder);

    // There should only be the one index.yml
    const yamlItem = items.find((item) => item.type === "file" && item.name === "index.yml");

    if (yamlItem == null) {
        throw new Error(`Could not find index.yml for the given folder: ${learningPathFolder}`);
    }

    const learningPathYaml = await fileDownloader.downloadFile(yamlItem.download_url);
    const { learningPath, moduleUids } = yamlProcessor.processLearningPathYaml(learningPathYaml);

    const modules = await Promise.all(
        moduleUids.map(async (uid) => {
            try {
                const path = pathUtilities.createPathFromUid(uid);
                return await downloadLearnModule(path);
            } catch (error) {
                // Gracefully handle errors because sometimeis the UID isn't the folder path... 🙃
                console.error(`Error downloading module for UID ${uid}:`, error);
                return null;
            }
        }),
    );

    learningPath.modules = modules.filter((module) => module != null);

    return learningPath;
}

/**
 * Downloads and processes a Learn module from GitHub
 * @param moduleFolder - GitHub folder path of the module (e.g. "learn-pr/philanthropies/explore-ai-basics")
 * @returns The processed Module object
 */
async function downloadLearnModule(moduleFolder: string): Promise<Module> {
    const items = await fileDownloader.downloadFolderContents(moduleFolder);
    const files = items.filter((item) => item.type === "file");

    const yamlFiles = files.filter((file) => file.name.endsWith(".yml") || file.name.endsWith(".yaml"));
    const processedYaml = await Promise.all(
        yamlFiles.map((yamlFile) => yamlProcessor.processLearnYaml(yamlFile.download_url, yamlFile.path)),
    );

    const module = processedYaml.find((yaml) => yaml != null && isModule(yaml));

    if (module == null) {
        throw new Error("No module overview (index.yml) found in the specified path.");
    }

    module.units = processedYaml.filter((yaml) => yaml != null && isUnit(yaml)).sort(unitByPrefix);

    const mediaFolder = items.find((item) => item.type === "dir" && item.name.toLowerCase() === "media");

    if (mediaFolder != null) {
        const mediaItems = await fileDownloader.downloadFolderContents(mediaFolder.path);

        await Promise.all(
            mediaItems.map(async (item) => {
                const imageRef = `IMG_REF_${item.path.replace(/[^a-zA-Z0-9]/g, "_")}`;
                module.imageReferenceMap[imageRef] = await fileDownloader.downloadMedia(item.download_url, item.name);
            }),
        );
    }

    return module;
}

function unitByPrefix(a: Unit, b: Unit): number {
    // Extract numeric prefix from the unit's path or title
    const extractNumericPrefix = (name: string): number => {
        const match = name.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0; // Put files without numeric prefix at the end
    };

    const aOrder = extractNumericPrefix(a.path.split("/").pop() ?? "");
    const bOrder = extractNumericPrefix(b.path.split("/").pop() ?? "");
    return aOrder - bOrder;
}
