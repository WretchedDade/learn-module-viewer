import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DownloadLearningPathFromGitHub, DownloadModuleFromGitHub } from "~/github/githubService";
import { useLearningPathByUid, useModuleByUid } from "./useCatalogQueries";

export function useModuleContentById(moduleId: string) {
    const moduleQuery = useModuleByUid(moduleId);

    const downloadModule = useServerFn(DownloadModuleFromGitHub);

    return useQuery({
        queryKey: ["module", moduleId],
        queryFn: () => downloadModule({ data: { folderPath: moduleQuery.data!.url } }),
        refetchOnWindowFocus: false,
        enabled: moduleQuery.isSuccess,
    });
}

export function useLearningPathContentById(learningPathId: string) {
    const learningPathQuery = useLearningPathByUid(learningPathId);

    const downloadLearningPath = useServerFn(DownloadLearningPathFromGitHub);

    return useQuery({
        queryKey: ["learningPath", learningPathId],
        queryFn: () => downloadLearningPath({ data: { folderPath: learningPathQuery.data!.url } }),
        refetchOnWindowFocus: false,
        enabled: learningPathQuery.isSuccess,
    });
}
