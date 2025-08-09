import React, { useState, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Squares2X2Icon, AcademicCapIcon, CheckBadgeIcon, TrophyIcon, ClipboardDocumentCheckIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { ModuleCard } from "../components/microsoft-learn/ModuleCard";
import { MergedCertificationCard } from "../components/microsoft-learn/MergedCertificationCard";
import { LearningPathCard } from "../components/microsoft-learn/LearningPathCard";
import { AppliedSkillCard } from "../components/microsoft-learn/AppliedSkillCard";
import { ExamCard } from "../components/microsoft-learn/ExamCard";
import { CourseCard } from "../components/microsoft-learn/CourseCard";
import { createFileRoute } from "@tanstack/react-router";
import {
    useAppliedSkillsQuery,
    useCoursesQuery,
    useExamsQuery,
    useLearningPathsQuery,
    useMergedCertificationsQuery,
    useModulesQuery,
    useLevelsQuery,
    useRolesQuery,
    useProductsQuery,
    useSubjectsQuery,
} from "../queries/useCatalogQueries";
import type {
    ModuleRecord,
    LearningPathRecord,
    AppliedSkillRecord,
    CertificationRecord,
    MergedCertificationRecord,
    ExamRecord,
    CourseRecord,
} from "../microsoft-learn/responses";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    // Fire all hooks (React Query dedupes requests if mounted elsewhere)
    const qModules = useModulesQuery();
    const qLearningPaths = useLearningPathsQuery();
    const qAppliedSkills = useAppliedSkillsQuery();
    const qMergedCerts = useMergedCertificationsQuery();
    const qExams = useExamsQuery();
    const qCourses = useCoursesQuery();
    // Taxonomies: fetched but not displayed
    useLevelsQuery();
    useRolesQuery();
    useProductsQuery();
    useSubjectsQuery();

    const isLoading = [
        qModules,
        qLearningPaths,
        qAppliedSkills,
        qMergedCerts,
        qExams,
        qCourses,
    ].some((q) => q.isLoading);
    const hasError = [
        qModules,
        qLearningPaths,
        qAppliedSkills,
        qMergedCerts,
        qExams,
        qCourses,
    ].some((q) => q.isError);

    const [filter, setFilter] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
            <div className="max-w-7xl mx-auto p-4">
                {/* Hero */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50 p-8 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Explore Microsoft Learn</h1>
                            <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">Browse learning content, certifications, exams, and more—all in one place.</p>
                        </div>
                        <div className="w-full md:w-80">
                            <label htmlFor="global-search" className="sr-only">Search</label>
                            <input
                                id="global-search"
                                type="search"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Search by title or ID…"
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
                            />
                        </div>
                    </div>
                    {/* Category chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            { id: "modules", label: "Modules" },
                            { id: "learning-paths", label: "Learning Paths" },
                            { id: "applied-skills", label: "Applied Skills" },
                            { id: "certifications", label: "Certifications" },
                            { id: "exams", label: "Exams" },
                            { id: "courses", label: "Courses" },
                        ].map((c) => (
                            <a
                                key={c.id}
                                href={`#${c.id}`}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                {c.label}
                            </a>
                        ))}
                    </div>
                </div>
                {/* Loading summary */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500 dark:text-zinc-400">{isLoading ? "Loading…" : ""}</div>
                </div>
                {hasError && (
                    <div className="mb-4 rounded-sm border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 p-3">
                        One or more sections failed to load. Sections show their own errors below.
                    </div>
                )}

                <div className="space-y-10">
                    <Row<ModuleRecord>
                        id="modules"
                        title="Modules"
                        query={qModules}
                        filter={filter}
                        renderItem={(item) => <ModuleCard item={item} />}
                    />
                    <Row<LearningPathRecord>
                        id="learning-paths"
                        title="Learning Paths"
                        query={qLearningPaths}
                        filter={filter}
                        renderItem={(item) => <LearningPathCard item={item} />}
                    />
                    <Row<AppliedSkillRecord>
                        id="applied-skills"
                        title="Applied Skills"
                        query={qAppliedSkills}
                        filter={filter}
                        renderItem={(item) => <AppliedSkillCard item={item} />}
                    />
                    <Row<MergedCertificationRecord>
                        id="certifications"
                        title="Certifications"
                        query={qMergedCerts}
                        filter={filter}
                        renderItem={(item) => <MergedCertificationCard item={item} />}
                    />
                    <Row<ExamRecord>
                        id="exams"
                        title="Exams"
                        query={qExams}
                        filter={filter}
                        renderItem={(item) => <ExamCard item={item} />}
                    />
                    <Row<CourseRecord>
                        id="courses"
                        title="Courses"
                        query={qCourses}
                        filter={filter}
                        renderItem={(item) => <CourseCard item={item} />}
                    />
                </div>
            </div>
        </div>
    );
}

type DisplayRecord =
    | ModuleRecord
    | LearningPathRecord
    | AppliedSkillRecord
    | CertificationRecord
    | MergedCertificationRecord
    | ExamRecord
    | CourseRecord;

function Row<T extends DisplayRecord>({
    id,
    title,
    query,
    topCount,
    rows = 2,
    filter,
    renderItem,
}: {
    id: string;
    title: string;
    query: UseQueryResult<T[], Error>;
    topCount?: number;
    rows?: number;
    filter?: string;
    renderItem: (item: T) => ReactNode;
}) {
    const [showAll, setShowAll] = useState(false);
    const cols = useResponsiveColumns();
    const effectiveTopCount = topCount ?? rows * cols;
    return (
        <section id={id} className="scroll-mt-16 md:scroll-mt-20">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SectionIcon name={title} />
                    <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
                </div>
            </div>
            {query.isLoading && <div className="text-sm text-gray-500 dark:text-zinc-400">Loading…</div>}
            {query.isError && (
                <div className="text-sm text-red-600 dark:text-red-400 break-words">
                    {query.error?.message ?? "Failed to load"}
                </div>
            )}
            {query.isSuccess && (
                <>
                    {/* <div className="mb-2 flex justify-end">
                        {(query.data ?? []).length > effectiveTopCount && (
                            <button
                                type="button"
                                onClick={() => setShowAll((v) => !v)}
                                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {showAll ? "Show less" : `Show all ${(query.data ?? []).length}`}
                            </button>
                        )}
                    </div> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-stretch auto-rows-fr">
                        {selectItems(query.data ?? [], { topCount: effectiveTopCount, showAll, filter }).map((item) => (
                            <div key={item.uid} className="h-full">
                                {renderItem(item)}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

function useResponsiveColumns() {
    // Mirrors Tailwind breakpoints used in the grid classes: sm(640px)=2 cols, md(768px)=3 cols
    const [cols, setCols] = useState(1);
    React.useEffect(() => {
        const mqSm = window.matchMedia('(min-width: 640px)');
        const mqMd = window.matchMedia('(min-width: 768px)');
        const update = () => setCols(mqMd.matches ? 3 : mqSm.matches ? 2 : 1);
        update();
        mqSm.addEventListener?.('change', update);
        mqMd.addEventListener?.('change', update);
        return () => {
            mqSm.removeEventListener?.('change', update);
            mqMd.removeEventListener?.('change', update);
        };
    }, []);
    return cols;
}

function selectItems<T extends DisplayRecord>(items: T[], opts: { topCount: number; showAll: boolean; filter?: string }): T[] {
    const { topCount, showAll, filter } = opts;
    const norm = (s: string) => s.toLowerCase();
    const filtered = filter
        ? items.filter((i) => norm(i.title).includes(norm(filter)) || norm(i.uid).includes(norm(filter)))
        : items;
    if (showAll) return filtered;
    return filtered.slice(0, topCount);
}

function SectionIcon({ name }: { name: string }) {
    const cls = "h-5 w-5 text-gray-500 dark:text-zinc-400";
    switch (name) {
        case "Modules":
            return <Squares2X2Icon className={cls} />;
        case "Learning Paths":
            return <AcademicCapIcon className={cls} />;
        case "Applied Skills":
            return <ClipboardDocumentCheckIcon className={cls} />;
        case "Certifications":
            return <CheckBadgeIcon className={cls} />;
        case "Exams":
            return <TrophyIcon className={cls} />;
        case "Courses":
            return <BookOpenIcon className={cls} />;
        default:
            return null;
    }
}

// removed local ItemCard and helpers; all rows render specific per-type cards

