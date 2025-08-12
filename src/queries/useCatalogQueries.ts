import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { learnApi } from "./learnApi";
import type {
    ModuleRecord,
    LearningPathRecord,
    AppliedSkillRecord,
    CertificationRecord,
    MergedCertificationRecord,
    ExamRecord,
    CourseRecord,
    TaxonomyNode,
    UnitRecord,
} from "../microsoft-learn/responses";

// Non-taxonomy content types
export function useModulesQuery() {
    return useQuery<ModuleRecord[], Error>({
        queryKey: ["catalog", "modules"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("modules"));
            return d.modules ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useLearningPathsQuery() {
    return useQuery<LearningPathRecord[], Error>({
        queryKey: ["catalog", "learningPaths"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("learningPaths"));
            return d.learningPaths ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useAppliedSkillsQuery() {
    return useQuery<AppliedSkillRecord[], Error>({
        queryKey: ["catalog", "appliedSkills"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("appliedSkills"));
            return d.appliedSkills ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useCertificationsQuery() {
    return useQuery<CertificationRecord[], Error>({
        queryKey: ["catalog", "certifications"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("certifications"));
            return d.certifications ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useMergedCertificationsQuery() {
    return useQuery<MergedCertificationRecord[], Error>({
        queryKey: ["catalog", "mergedCertifications"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("mergedCertifications"));
            const items = d.mergedCertifications ?? [];
            const now = new Date().toISOString();
            return items.filter((c) => {
                const notPastRetirement = c.retirement_date == null || c.retirement_date > now;
                const retiredBySummary = isRetiredBySummary(c.summary);
                return notPastRetirement && !retiredBySummary;
            });
        },
        refetchOnWindowFocus: false,
    });
}

function isRetiredBySummary(summary?: string): boolean {
    if (!summary) return false;
    // Strip HTML tags and normalize whitespace
    const text = summary.replace(/<[^>]*>/g, " ").toLowerCase();
    const s = text.replace(/\s+/g, " ").trim();
    if (!s) return false;
    // Common patterns we observed
    if (s.includes("this certification has been retired")) return true;
    if (s.includes("this certification is retired")) return true;
    // Generic fallback: warnings that mention retired
    if (s.startsWith("warning") && s.includes("retired")) return true;
    return false;
}

export function useExamsQuery() {
    return useQuery<ExamRecord[], Error>({
        queryKey: ["catalog", "exams"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("exams"));
            return d.exams ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useCoursesQuery() {
    return useQuery<CourseRecord[], Error>({
        queryKey: ["catalog", "courses"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("courses"));
            return d.courses ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

// Taxonomies (we fetch, but don’t display here)
export function useLevelsQuery() {
    return useQuery<TaxonomyNode[], Error>({
        queryKey: ["catalog", "levels"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("levels"));
            return d.levels ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useRolesQuery() {
    return useQuery<TaxonomyNode[], Error>({
        queryKey: ["catalog", "roles"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("roles"));
            return d.roles ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useProductsQuery() {
    return useQuery<TaxonomyNode[], Error>({
        queryKey: ["catalog", "products"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("products"));
            return d.products ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

export function useSubjectsQuery() {
    return useQuery<TaxonomyNode[], Error>({
        queryKey: ["catalog", "subjects"],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("subjects"));
            return d.subjects ?? [];
        },
        refetchOnWindowFocus: false,
    });
}

// Detail-by-UID queries
export function useUnitByUid(uid: string) {
    return useQuery<UnitRecord | undefined, Error>({
        queryKey: ["catalog", "units", "uid", uid],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("units").uids(uid));
            return d.units?.[0];
        },
        enabled: !!uid,
        refetchOnWindowFocus: false,
    });
}

export function getModuleByUidOptions(uid: string) {
    return queryOptions<ModuleRecord, Error>({
        queryKey: ["module", uid],
        queryFn: async () => {
            const response = await learnApi.fetchCatalog((b) => b.types("modules").uids(uid));
            const module = response.modules?.[0];

            if (module == null) {
                throw new Error(`Module with UID ${uid} not found`);
            }

            return module;
        },
    });
}

// Detail-by-UID queries
export function useModuleByUid(uid: string) {
    return useQuery(getModuleByUidOptions(uid));
}

// Details-by-UID queries
export function useModulesByUid(uids: string[]) {
    return useQuery<ModuleRecord[], Error>({
        queryKey: ["catalog", "modules", "uid", ...uids],
        queryFn: async () => {
            const response = await learnApi.fetchCatalog((b) => b.types("modules").uids(...uids));
            return response.modules ?? [];
        },
    });
}

export function getLearningPathByUidOptions(uid: string) {
    return queryOptions<LearningPathRecord, Error>({
        queryKey: ["catalog", "learningPaths", "uid", uid],
        queryFn: async () => {
            const response = await learnApi.fetchCatalog((b) => b.types("learningPaths").uids(uid));
            const learningPath = response.learningPaths?.[0];

            if (!learningPath) {
                throw new Error(`Learning Path with UID ${uid} not found`);
            }

            return learningPath;
        },
        enabled: !!uid,
    });
}

export function useLearningPathByUid(uid: string) {
    return useSuspenseQuery(getLearningPathByUidOptions(uid));
}

export function useAppliedSkillByUid(uid: string) {
    return useQuery<AppliedSkillRecord | undefined, Error>({
        queryKey: ["catalog", "appliedSkills", "uid", uid],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("appliedSkills").uids(uid));
            return d.appliedSkills?.[0];
        },
        enabled: !!uid,
        refetchOnWindowFocus: false,
    });
}

export function useMergedCertificationByUid(uid: string) {
    return useQuery<MergedCertificationRecord | undefined, Error>({
        queryKey: ["catalog", "mergedCertifications", "uid", uid],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("mergedCertifications").uids(uid));
            return d.mergedCertifications?.[0];
        },
        enabled: !!uid,
        refetchOnWindowFocus: false,
    });
}

export function useExamByUid(uid: string) {
    return useQuery<ExamRecord | undefined, Error>({
        queryKey: ["catalog", "exams", "uid", uid],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("exams").uids(uid));
            return d.exams?.[0];
        },
        enabled: !!uid,
        refetchOnWindowFocus: false,
    });
}

export function useCourseByUid(uid: string) {
    return useQuery<CourseRecord | undefined, Error>({
        queryKey: ["catalog", "courses", "uid", uid],
        queryFn: async () => {
            const d = await learnApi.fetchCatalog((b) => b.types("courses").uids(uid));
            return d.courses?.[0];
        },
        enabled: !!uid,
        refetchOnWindowFocus: false,
    });
}
