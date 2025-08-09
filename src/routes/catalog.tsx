import React from "react";
import { z } from "zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type {
    AppliedSkillRecord,
    CourseRecord,
    ExamRecord,
    LearningPathRecord,
    MergedCertificationRecord,
    ModuleRecord,
    TaxonomyNode,
} from "../microsoft-learn/responses";
import {
    useAppliedSkillsQuery,
    useCoursesQuery,
    useExamsQuery,
    useLearningPathsQuery,
    useMergedCertificationsQuery,
    useModulesQuery,
    useLevelsQuery,
    useProductsQuery,
    useRolesQuery,
    useSubjectsQuery,
} from "../queries/useCatalogQueries";
import { SidebarLayout } from "../components/catalyst/sidebar-layout";
import { Sidebar, SidebarBody, SidebarHeader, SidebarDivider } from "../components/catalyst/sidebar";
import { Button } from "../components/catalyst/button";
import { ModuleCard } from "../components/microsoft-learn/ModuleCard";
import { LearningPathCard } from "../components/microsoft-learn/LearningPathCard";
import { AppliedSkillCard } from "../components/microsoft-learn/AppliedSkillCard";
import { MergedCertificationCard } from "../components/microsoft-learn/MergedCertificationCard";
import { ExamCard } from "../components/microsoft-learn/ExamCard";
import { CourseCard } from "../components/microsoft-learn/CourseCard";
import {
    FilterCheckboxSection,
    FilterPopularitySection,
    TaxonomyTreeSection,
    type Option,
    type PopularityFilter,
} from "../components/catalog/FilterSections";

type Kind = "module" | "learningPath" | "appliedSkill" | "cert" | "exam" | "course";

type CatalogItem =
    | (ModuleRecord & { kind: "module" })
    | (LearningPathRecord & { kind: "learningPath" })
    | (AppliedSkillRecord & { kind: "appliedSkill" })
    | (MergedCertificationRecord & { kind: "cert" })
    | (ExamRecord & { kind: "exam" })
    | (CourseRecord & { kind: "course" });

const TYPE_OPTIONS: Option[] = [
    { id: "module", label: "Modules" },
    { id: "learningPath", label: "Learning Paths" },
    { id: "appliedSkill", label: "Applied Skills" },
    { id: "cert", label: "Certifications" },
    { id: "exam", label: "Exams" },
    { id: "course", label: "Courses" },
];

// Zod schema to validate & normalize search params
const arrayParam = z.preprocess((v) => {
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    if (typeof v === "string")
        return v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    return [] as string[];
}, z.array(z.string()));

const searchSchema = z.object({
    types: arrayParam,
    levels: arrayParam,
    subjects: arrayParam,
    roles: arrayParam,
    products: arrayParam,
    pop: z.enum(["any", "trending", "high"]).catch("any").default("any"),
});

export const Route = createFileRoute("/catalog")({
    validateSearch: searchSchema,
    component: CatalogPage,
});

function CatalogPage() {
    const navigate = useNavigate({ from: "/catalog" });
    const search = Route.useSearch();

    // Queries for all six item types
    const qModules = useModulesQuery();
    const qLPs = useLearningPathsQuery();
    const qSkills = useAppliedSkillsQuery();
    const qCerts = useMergedCertificationsQuery();
    const qExams = useExamsQuery();
    const qCourses = useCoursesQuery();
    // Taxonomies for filters
    const qLevels = useLevelsQuery();
    const qRoles = useRolesQuery();
    const qProducts = useProductsQuery();
    const qSubjects = useSubjectsQuery();

    const isLoading = [qModules, qLPs, qSkills, qCerts, qExams, qCourses].some((q) => q.isLoading);
    const hasError = [qModules, qLPs, qSkills, qCerts, qExams, qCourses].some((q) => q.isError);

    const allItems: CatalogItem[] = [
        ...(qModules.data ?? []).map((x) => ({ ...x, kind: "module" as const })),
        ...(qLPs.data ?? []).map((x) => ({ ...x, kind: "learningPath" as const })),
        ...(qSkills.data ?? []).map((x) => ({ ...x, kind: "appliedSkill" as const })),
        ...(qCerts.data ?? []).map((x) => ({ ...x, kind: "cert" as const })),
        ...(qExams.data ?? []).map((x) => ({ ...x, kind: "exam" as const })),
        ...(qCourses.data ?? []).map((x) => ({ ...x, kind: "course" as const })),
    ];

    // Build descendant maps for taxonomy filters so selecting a parent includes its descendants
    const levelsMap = React.useMemo(() => buildDescendantMap(qLevels.data ?? []), [qLevels.data]);
    const rolesMap = React.useMemo(() => buildDescendantMap(qRoles.data ?? []), [qRoles.data]);
    const productsMap = React.useMemo(() => buildDescendantMap(qProducts.data ?? []), [qProducts.data]);
    const subjectsMap = React.useMemo(() => buildDescendantMap(qSubjects.data ?? []), [qSubjects.data]);

    const filtered = allItems.filter((item) =>
        matchesFilters(item, search, { levelsMap, rolesMap, productsMap, subjectsMap }),
    );

    // Sorting: put higher popularity first when pop != any, else by title
    const sorted = [...filtered].sort((a, b) => {
        if (search.pop !== "any") {
            const ap = (a as any).popularity ?? -1;
            const bp = (b as any).popularity ?? -1;
            if (bp !== ap) return bp - ap;
        }
        const at = (a.title ?? "").toLowerCase();
        const bt = (b.title ?? "").toLowerCase();
        return at.localeCompare(bt);
    });

    const countsByKind = countBy(sorted, (x) => x.kind);

    const toggleArrayParam = (key: keyof typeof search, value: string) => {
        const curr = new Set((search as any)[key] as string[]);
        if (curr.has(value)) curr.delete(value);
        else curr.add(value);
        const next = Array.from(curr);
        navigate({ search: (s) => ({ ...s, [key]: next }) });
    };

    const clearAll = () =>
        navigate({
            search: () => ({
                types: [],
                levels: [],
                subjects: [],
                roles: [],
                products: [],
                pop: "any" as PopularityFilter,
            }),
        });

    return (
        <SidebarLayout
            navbar={<div className="py-3 px-2 text-base font-medium">Catalog</div>}
            sidebar={
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Filters</div>
                            <Button color="zinc" onClick={clearAll}>
                                Clear
                            </Button>
                        </div>
                    </SidebarHeader>
                    <SidebarBody>
                        <FilterCheckboxSection
                            title="Type"
                            options={TYPE_OPTIONS}
                            selected={search.types}
                            onToggle={(id) => toggleArrayParam("types", id)}
                        />

                        <SidebarDivider />

                        <TaxonomyTreeSection
                            title="Level"
                            nodes={qLevels.data ?? []}
                            selected={search.levels}
                            onToggle={(id) => toggleArrayParam("levels", id)}
                        />

                        <SidebarDivider />

                        <TaxonomyTreeSection
                            title="Subject"
                            nodes={qSubjects.data ?? []}
                            selected={search.subjects}
                            onToggle={(id) => toggleArrayParam("subjects", id)}
                            scrollable
                            labelTransform={(name) => name.replaceAll("-", " ")}
                            labelClassName="capitalize"
                        />

                        <SidebarDivider />

                        <TaxonomyTreeSection
                            title="Role"
                            nodes={qRoles.data ?? []}
                            selected={search.roles}
                            onToggle={(id) => toggleArrayParam("roles", id)}
                            scrollable
                        />

                        <SidebarDivider />

                        <TaxonomyTreeSection
                            title="Product"
                            nodes={qProducts.data ?? []}
                            selected={search.products}
                            onToggle={(id) => toggleArrayParam("products", id)}
                            scrollable
                        />

                        <SidebarDivider />

                        <FilterPopularitySection
                            value={search.pop}
                            onChange={(v) => navigate({ search: (s) => ({ ...s, pop: v }) })}
                        />
                    </SidebarBody>
                </Sidebar>
            }
        >
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-zinc-400">
                    {isLoading ? "Loading…" : `${sorted.length.toLocaleString()} items`}
                    {hasError ? " • Some sections failed to load" : ""}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500">
                    {Object.entries(countsByKind)
                        .map(([k, v]) => `${labelForKind(k as Kind)}: ${v}`)
                        .join(" • ")}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-stretch auto-rows-fr">
                {sorted.map((item) => (
                    <div key={item.uid} className="h-full">
                        {renderCard(item)}
                    </div>
                ))}
            </div>
        </SidebarLayout>
    );
}

function matchesFilters(
    item: CatalogItem,
    f: {
        types: string[];
        levels: string[];
        subjects: string[];
        roles: string[];
        products: string[];
        pop: PopularityFilter;
    },
    maps: { levelsMap: DescendantMap; rolesMap: DescendantMap; productsMap: DescendantMap; subjectsMap: DescendantMap },
): boolean {
    // Type filter
    if (f.types.length && !f.types.includes(item.kind)) return false;

    // Taxonomy helpers (coerce missing to [])
    const levels = ((item as any).levels as string[] | undefined) ?? [];
    const subjects = ((item as any).subjects as string[] | undefined) ?? [];
    const roles = ((item as any).roles as string[] | undefined) ?? [];
    const products = ((item as any).products as string[] | undefined) ?? [];

    const selLevels = expandSelected(f.levels, maps.levelsMap);
    const selSubjects = expandSelected(f.subjects, maps.subjectsMap);
    const selRoles = expandSelected(f.roles, maps.rolesMap);
    const selProducts = expandSelected(f.products, maps.productsMap);

    if (selLevels.length && !overlap(levels, selLevels)) return false;
    if (selSubjects.length && !overlap(subjects, selSubjects)) return false;
    if (selRoles.length && !overlap(roles, selRoles)) return false;
    if (selProducts.length && !overlap(products, selProducts)) return false;

    // Popularity
    if (f.pop !== "any") {
        const p = (item as any).popularity as number | undefined;
        const threshold = f.pop === "high" ? 0.7 : 0.5;
        if (p == null || p < threshold) return false;
    }

    return true;
}

function renderCard(item: CatalogItem) {
    switch (item.kind) {
        case "module":
            return <ModuleCard item={item} variant="icon" />;
        case "learningPath":
            return <LearningPathCard item={item} variant="icon" />;
        case "appliedSkill":
            return <AppliedSkillCard item={item} />;
        case "cert":
            return <MergedCertificationCard item={item} />;
        case "exam":
            return <ExamCard item={item} />;
        case "course":
            return <CourseCard item={item} />;
        default:
            return null;
    }
}

type DescendantMap = Map<string, Set<string>>;

function buildDescendantMap(nodes: TaxonomyNode[]): DescendantMap {
    const map: DescendantMap = new Map();
    const visit = (n: TaxonomyNode): Set<string> => {
        const set = new Set<string>([n.id]);
        (n.children ?? []).forEach((c) => {
            const childSet = visit(c);
            childSet.forEach((id) => set.add(id));
        });
        map.set(n.id, set);
        return set;
    };
    nodes.forEach(visit);
    return map;
}

function expandSelected(selected: string[], map: DescendantMap): string[] {
    if (!selected.length) return [];
    const out = new Set<string>();
    selected.forEach((id) => {
        const set = map.get(id);
        if (set) {
            set.forEach((x) => out.add(x));
        } else {
            out.add(id);
        }
    });
    return Array.from(out);
}

function overlap(a: string[], b: string[]) {
    if (!a.length || !b.length) return false;
    const set = new Set(a);
    return b.some((x) => set.has(x));
}

function countBy<T, K extends string | number | symbol>(arr: T[], keyFn: (x: T) => K): Record<K, number> {
    return arr.reduce(
        (acc, x) => {
            const k = keyFn(x);
            (acc as any)[k] = ((acc as any)[k] ?? 0) + 1;
            return acc;
        },
        {} as Record<K, number>,
    );
}

function labelForKind(k: Kind): string {
    switch (k) {
        case "module":
            return "Modules";
        case "learningPath":
            return "Learning Paths";
        case "appliedSkill":
            return "Applied Skills";
        case "cert":
            return "Certifications";
        case "exam":
            return "Exams";
        case "course":
            return "Courses";
    }
}
