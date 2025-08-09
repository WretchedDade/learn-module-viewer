import React from "react";
import { SidebarSection, SidebarHeading } from "../catalyst/sidebar";
import { Checkbox, CheckboxField, CheckboxGroup } from "../catalyst/checkbox";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import type { TaxonomyNode } from "../../microsoft-learn/responses";
import { Label } from "../catalyst/fieldset";

export type Option = { id: string; label: string };
export type PopularityFilter = "any" | "trending" | "high";

export function FilterCheckboxSection({
    title,
    options,
    selected,
    onToggle,
    scrollable,
    defaultOpen = true,
}: {
    title: string;
    options: Option[];
    selected: string[];
    onToggle: (id: string) => void;
    scrollable?: boolean;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = React.useState(defaultOpen);
    const wrapperCls = scrollable ? "max-h-64 overflow-auto pr-1" : undefined;
    return (
        <SidebarSection>
            <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 rounded-sm hover:bg-zinc-950/5 dark:hover:bg-white/5"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <div className="mb-0 px-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</div>
                <ChevronDownIcon
                    className={clsx("h-4 w-4 text-zinc-500 transition-transform", { "-rotate-90": !open })}
                />
            </button>
            <div
                className={clsx(
                    "mt-1 ml-1 pl-3 border-l border-zinc-200/60 dark:border-white/10",
                    { hidden: !open },
                    wrapperCls
                )}
            >
                <CheckboxGroup className="text-sm">
                    {options.map((opt) => {
                        return (
                            <CheckboxField key={opt.id}>
                                <Checkbox
                                    checked={selected.includes(opt.id)}
                                    onChange={() => onToggle(opt.id)}
                                />
                                <Label>{opt.label}</Label>
                            </CheckboxField>
                        );
                    })}
                </CheckboxGroup>
            </div>
        </SidebarSection>
    );
}

export function FilterPopularitySection({
    value,
    onChange,
    defaultOpen = true,
}: {
    value: PopularityFilter;
    onChange: (v: PopularityFilter) => void;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <SidebarSection>
            <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 rounded-sm hover:bg-zinc-950/5 dark:hover:bg-white/5"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <SidebarHeading className="mb-0 px-0">Popularity</SidebarHeading>
                <ChevronDownIcon
                    className={clsx("h-4 w-4 text-zinc-500 transition-transform", { "-rotate-90": !open })}
                />
            </button>
            <div className={clsx("flex flex-col gap-2 text-sm", { hidden: !open })}>
                {[
                    { id: "any", label: "Any" },
                    { id: "trending", label: "Trending (≥ 0.5)" },
                    { id: "high", label: "High (≥ 0.7)" },
                ].map((opt) => (
                    <label key={opt.id} className="inline-flex items-center gap-2">
                        <input
                            type="radio"
                            name="popularity"
                            value={opt.id}
                            checked={value === (opt.id as PopularityFilter)}
                            onChange={() => onChange(opt.id as PopularityFilter)}
                            className="accent-blue-600"
                        />
                        {opt.label}
                    </label>
                ))}
                <p className="text-xs text-gray-500 dark:text-zinc-500">
                    Only items that include popularity metadata are affected.
                </p>
            </div>
        </SidebarSection>
    );
}

export function TaxonomyTreeSection({
    title,
    nodes,
    selected,
    onToggle,
    scrollable,
    defaultOpenNodes = "collapsed",
    labelTransform,
    labelClassName,
}: {
    title: string;
    nodes: TaxonomyNode[];
    selected: string[];
    onToggle: (id: string) => void;
    scrollable?: boolean;
    defaultOpenNodes?: "collapsed" | "expanded";
    labelTransform?: (name: string) => string;
    labelClassName?: string;
}) {
    // track collapsed state per node id; default collapsed when node has children
    const initialCollapsed = React.useMemo(() => {
        const set = new Set<string>();
        const walk = (n: TaxonomyNode) => {
            if (n.children && n.children.length > 0 && defaultOpenNodes === "collapsed") set.add(n.id);
            (n.children ?? []).forEach(walk);
        };
        nodes.forEach(walk);
        return set;
    }, [nodes, defaultOpenNodes]);
    const [collapsed, setCollapsed] = React.useState<Set<string>>(initialCollapsed);
    const toggleCollapse = (id: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const wrapperCls = scrollable ? "max-h-64 overflow-auto pr-1" : undefined;
    return (
        <SidebarSection>
            <SidebarHeading>{title}</SidebarHeading>
            <div className={wrapperCls}>
                <ul className="space-y-1">
                    {nodes.map((n) => (
                        <TaxonomyNodeRow
                            key={n.id}
                            node={n}
                            depth={0}
                            selected={selected}
                            onToggle={onToggle}
                            collapsed={collapsed}
                            onToggleCollapse={toggleCollapse}
                            labelTransform={labelTransform}
                            labelClassName={labelClassName}
                        />
                    ))}
                </ul>
            </div>
        </SidebarSection>
    );
}

function TaxonomyNodeRow({
    node,
    depth,
    selected,
    onToggle,
    collapsed,
    onToggleCollapse,
    labelTransform,
    labelClassName,
}: {
    node: TaxonomyNode;
    depth: number;
    selected: string[];
    onToggle: (id: string) => void;
    collapsed: Set<string>;
    onToggleCollapse: (id: string) => void;
    labelTransform?: (name: string) => string;
    labelClassName?: string;
}) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isCollapsed = collapsed.has(node.id);
    const displayName = labelTransform ? labelTransform(node.name) : node.name;
    return (
        <li>
            <div className="flex items-center gap-2" style={{ paddingLeft: depth * 12 }}>
                {hasChildren ? (
                    <button
                        type="button"
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                        className="p-0.5 rounded-sm hover:bg-zinc-950/5 dark:hover:bg-white/5"
                        onClick={() => onToggleCollapse(node.id)}
                    >
                        <ChevronDownIcon
                            className={clsx("h-4 w-4 text-zinc-500 transition-transform", {
                                "-rotate-90": isCollapsed,
                            })}
                        />
                    </button>
                ) : (
                    <span className="inline-block w-4" />
                )}
                <Checkbox
                    checked={selected.includes(node.id)}
                    onChange={() => onToggle(node.id)}
                    aria-label={displayName}
                />
                <span className={clsx("text-sm truncate", labelClassName)} title={displayName}>
                    {displayName}
                </span>
            </div>
            {hasChildren && !isCollapsed && (
                <ul className="mt-0.5 space-y-1">
                    {node.children!.map((c) => (
                        <TaxonomyNodeRow
                            key={c.id}
                            node={c}
                            depth={depth + 1}
                            selected={selected}
                            onToggle={onToggle}
                            collapsed={collapsed}
                            onToggleCollapse={onToggleCollapse}
                            labelTransform={labelTransform}
                            labelClassName={labelClassName}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
