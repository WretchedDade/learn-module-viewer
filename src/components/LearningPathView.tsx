import { LearningPath, Module } from "~/github/githubTypes";
import { ProgressTag } from "./ProgressTag";
import { Tag, Tags } from "./Tag";
import { useLearningPathContentById } from "~/queries/useContentById";
import { Skeleton } from "./SkeletonLoading";
import { ErrorDisplay } from "./ErrorDisplay";
import { useLearningPathByUid, useModulesByUid } from "~/queries/useCatalogQueries";
import { DownloadLearningPathFromGitHub } from "~/github/githubService";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ModuleRecord } from "~/microsoft-learn/responses";
import { learnApi } from "~/queries/learnApi";
import { ProgressMap } from "~/hooks/useProgressManagement";

interface LearningPathViewProps {
    learningPathId: string;
    progress: ProgressMap;
    onModuleSelected: (moduleId: string) => void;
}

export function LearningPathView({ learningPathId, onModuleSelected, progress }: LearningPathViewProps) {
    const learningPathMetaQuery = useLearningPathByUid(learningPathId);

    const downloadLearningPath = useServerFn(DownloadLearningPathFromGitHub);

    const learningPathQuery = useQuery({
        queryKey: ["learningPath", learningPathId],
        queryFn: () => downloadLearningPath({ data: { folderPath: learningPathMetaQuery.data!.url } }),
        enabled: learningPathMetaQuery.isSuccess,
    });

    const modulesQuery = useQuery<ModuleRecord[], Error>({
        queryKey: ["catalog", "learningPaths", "uid", learningPathId, "modules"],
        queryFn: async () => {
            const uids = learningPathMetaQuery.data?.modules ?? [];
            const response = await learnApi.fetchCatalog((b) => b.types("modules").uids(...uids));

            return learningPathMetaQuery.data!.modules.map((moduleId) => {
                return response.modules?.find((module) => module.uid === moduleId);
            }).filter(Boolean) as ModuleRecord[];
        },
        enabled: learningPathMetaQuery.isSuccess,
    });

    if (learningPathQuery.isLoading || modulesQuery.isLoading) {
        return <LearningPathViewSkeleton />;
    }

    if (!learningPathQuery.isSuccess) {
        return <ErrorDisplay error={learningPathQuery.error as Error} />;
    }

    if (!modulesQuery.isSuccess) {
        return <ErrorDisplay error={modulesQuery.error as Error} />;
    }

    const learningPath = learningPathQuery.data as LearningPath;

    // Flatten and filter out undefined/empty arrays
    const allTags = Array.from(
        new Set(
            [...(learningPath?.levels || []), ...(learningPath?.roles || []), ...(learningPath?.products || [])].filter(
                Boolean,
            ),
        ),
    );

    return (
        <div className="p-4">
            <div className="flex gap-4 mb-4 items-center">
                {learningPath?.iconUrl && (
                    <img
                        src={`https://learn.microsoft.com/en-us/${learningPath.iconUrl}`}
                        alt={`${learningPath.title ?? "Learning path"} icon`}
                        className="w-16 h-16"
                    />
                )}
                <h1 className="text-2xl font-bold mb-2">{learningPath?.title}</h1>
            </div>
            {learningPath?.summary && <p className="text-zinc-700 dark:text-zinc-300 mb-6">{learningPath.summary}</p>}

            {/* Tags Section */}
            {allTags.length > 0 && (
                <div className="mb-6">
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                            <Tags
                                rounded
                                keyPrefix="LPV"
                                values={allTags}
                                className="bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            />
                        </div>
                    </div>
                </div>
            )}

            <hr className="mt-8 my-6" />

            {/* Modules Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold dark:text-white mb-4">Modules</h2>
                {modulesQuery.data.map((module, index) => (
                    <button
                        key={`LPV-Module-${module.uid!}`}
                        onClick={() => onModuleSelected(module.uid)}
                        className="bg-zinc-200 dark:bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-colors w-full text-left"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-blue-300 dark:bg-blue-600 dark:text-white text-sm font-semibold rounded-full">
                                    {index + 1}
                                </span>
                                <h3 className="text-lg font-semibold dark:text-white">{module.title}</h3>
                            </div>
                            <ProgressTag progress={progress[module.uid!] ?? "not-started"} />
                        </div>

                        {module.summary && <p className="text-zinc-700 dark:text-zinc-300 mb-4">{module.summary}</p>}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                {module.units && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        {module.units.length} units
                                    </span>
                                )}
                                {module.duration_in_minutes && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        {module.duration_in_minutes} min
                                    </span>
                                )}
                            </div>

                            {(module.levels || module.roles || module.products) && (
                                <div className="flex flex-wrap gap-1">
                                    {[...(module.levels || []), ...(module.roles || []), ...(module.products || [])]
                                        .slice(0, 3)
                                        .map((tag) => (
                                            <Tag key={`LPV-Module-${module.uid!}-${tag}`}>{tag}</Tag>
                                        ))}
                                    {[...(module.levels || []), ...(module.roles || []), ...(module.products || [])]
                                        .length > 3 && (
                                        <Tag>
                                            +
                                            {[
                                                ...(module.levels || []),
                                                ...(module.roles || []),
                                                ...(module.products || []),
                                            ].length - 3}{" "}
                                            more
                                        </Tag>
                                    )}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function LearningPathViewSkeleton() {
    return (
        <div className="p-4">
            {/* Header skeleton */}
            <div className="flex gap-4 mb-4 items-center">
                <Skeleton className="w-16 h-16 rounded" />
                <Skeleton className="h-8 w-2/3" />
            </div>

            {/* Summary skeleton */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />

            {/* Tags skeleton */}
            <div className="mb-6">
                <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={`LPV-Tag-Skeleton-${i}`} className="h-6 w-20 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            <hr className="mt-8 my-6" />

            {/* Modules list skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={`LPV-Module-Skeleton-${index}`}
                        className="bg-zinc-200 dark:bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 w-full"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="h-5 w-56" />
                            </div>
                        </div>

                        <Skeleton className="h-4 w-11/12 mb-4" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {Array.from({ length: 3 }).map((_, t) => (
                                    <Skeleton
                                        key={`LPV-Module-Skeleton-${index}-Tag-Skeleton-${t}`}
                                        className="h-5 w-16 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
