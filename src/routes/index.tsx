import React, { useState, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
    Squares2X2Icon,
    AcademicCapIcon,
    CheckBadgeIcon,
    TrophyIcon,
    ClipboardDocumentCheckIcon,
    BookOpenIcon,
} from "@heroicons/react/24/outline";
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

    const isLoading = [qModules, qLearningPaths, qAppliedSkills, qMergedCerts, qExams, qCourses].some(
        (q) => q.isLoading,
    );
    const hasError = [qModules, qLearningPaths, qAppliedSkills, qMergedCerts, qExams, qCourses].some((q) => q.isError);

    const [filter, setFilter] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 scroll-smooth">
            <div className="max-w-7xl mx-auto p-4">
                {/* Hero */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50 p-8 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                                Explore Microsoft Learn
                            </h1>
                            <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                                Browse learning content, certifications, exams, and more—all in one place.
                            </p>
                        </div>
                        <div className="w-full md:w-80">
                            <label htmlFor="global-search" className="sr-only">
                                Search
                            </label>
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
                                key={`CategoryChip-${c.id}`}
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

                <div className="space-y-36">
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
    // Pagination replaces previous show-all toggle. Page size adapts to responsive column count.
    const [page, setPage] = useState(0);
    const cols = useResponsiveColumns();
    const pageSize = topCount ?? rows * cols; // if topCount provided, treat as explicit page size
    // Reset to first page if filter or layout-driven pageSize changes
    React.useEffect(() => {
        setPage(0);
    }, [filter, pageSize]);
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
                    {(() => {
                        const allItems = query.data ?? [];
                        const { paged, totalPages, totalFiltered } = selectItems(allItems, { page, pageSize, filter });
                        // Clamp or reset page when dependencies change
                        if (page > 0 && page > totalPages - 1) {
                            // Defer state update to next tick to avoid render loop
                            queueMicrotask(() => setPage(totalPages - 1));
                        }
                        return (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-stretch auto-rows-fr">
                                    {paged.map((item) => (
                                        <div key={item.uid} className="h-full">
                                            {renderItem(item)}
                                        </div>
                                    ))}
                                </div>
                                {totalFiltered > pageSize && (
                                    <nav
                                        className="mt-4 flex flex-col items-center gap-2 sticky bottom-0 bg-gray-50/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 py-2 rounded-t"
                                        aria-label={`${title} pagination`}
                                    >
                                        <div className="text-[11px] text-gray-600 dark:text-zinc-400">
                                            Showing {page * pageSize + 1}–{page * pageSize + paged.length} of{" "}
                                            {totalFiltered}
                                        </div>
                                        <ul className="inline-flex items-stretch rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => setPage(0)}
                                                    disabled={page === 0}
                                                    className="px-3 py-1.5 text-xs font-medium border-r border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                                    aria-label="First page"
                                                >
                                                    «
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                                    disabled={page === 0}
                                                    className="px-3 py-1.5 text-xs font-medium border-r border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                                    aria-label="Previous page"
                                                >
                                                    Prev
                                                </button>
                                            </li>
                                            <li>
                                                <span className="px-3 py-1.5 text-xs font-medium tabular-nums border-r border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-900/40">
                                                    {Math.min(page + 1, totalPages)} / {totalPages}
                                                </span>
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                                    disabled={page >= totalPages - 1}
                                                    className="px-3 py-1.5 text-xs font-medium border-r border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                                    aria-label="Next page"
                                                >
                                                    Next
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => setPage(totalPages - 1)}
                                                    disabled={page >= totalPages - 1}
                                                    className="px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                                    aria-label="Last page"
                                                >
                                                    »
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </>
                        );
                    })()}
                </>
            )}
        </section>
    );
}

function useResponsiveColumns() {
    // Mirrors Tailwind breakpoints used in the grid classes: sm(640px)=2 cols, md(768px)=3 cols
    const [cols, setCols] = useState(1);
    React.useEffect(() => {
        const mqSm = window.matchMedia("(min-width: 640px)");
        const mqMd = window.matchMedia("(min-width: 768px)");
        const update = () => setCols(mqMd.matches ? 4 : mqSm.matches ? 2 : 1);
        update();
        mqSm.addEventListener?.("change", update);
        mqMd.addEventListener?.("change", update);
        return () => {
            mqSm.removeEventListener?.("change", update);
            mqMd.removeEventListener?.("change", update);
        };
    }, []);
    return cols;
}

function selectItems<T extends DisplayRecord>(
    items: T[],
    opts: { page: number; pageSize: number; filter?: string },
): { paged: T[]; totalPages: number; totalFiltered: number } {
    const { page, pageSize, filter } = opts;
    const norm = (s: string) => s.toLowerCase();
    const filtered = filter
        ? items.filter((i) => norm(i.title).includes(norm(filter)) || norm(i.uid).includes(norm(filter)))
        : items;
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const start = page * pageSize;
    const paged = filtered.slice(start, start + pageSize);
    return { paged, totalPages, totalFiltered };
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
