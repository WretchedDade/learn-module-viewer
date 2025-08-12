import React, { useId, KeyboardEvent } from "react";
import { usePivotSelection } from "./PivotContext";
import clsx from "clsx";

interface PivotItemData {
    value: string;
    // children are provided via ReactMarkdown rendering pass
    children: React.ReactNode;
}

interface PivotGroupProps {
    setId: string;
    values: string[];
    items: Record<string, React.ReactNode>;
}

export const PivotGroup: React.FC<PivotGroupProps> = ({ setId, values, items }) => {
    const defaultValue = values[0];
    const { selected, setSelection } = usePivotSelection(setId, defaultValue);
    const baseId = useId();

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const idx = values.indexOf(selected);
        if (e.key === "ArrowRight") {
            const next = values[(idx + 1) % values.length];
            setSelection(setId, next);
            e.preventDefault();
        } else if (e.key === "ArrowLeft") {
            const prev = values[(idx - 1 + values.length) % values.length];
            setSelection(setId, prev);
            e.preventDefault();
        } else if (e.key === "Home") {
            setSelection(setId, values[0]);
            e.preventDefault();
        } else if (e.key === "End") {
            setSelection(setId, values[values.length - 1]);
            e.preventDefault();
        }
    };

    if (values.length <= 1) {
        return <div className="my-6">{items[values[0]]}</div>;
    }

    return (
        <div className="my-6" data-pivot-group={setId}>
            <div
                role="tablist"
                aria-label="Pivot group"
                className="inline-flex overflow-hidden rounded-md border border-zinc-950/10 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/5"
                onKeyDown={onKeyDown}
            >
                {values.map((v) => {
                    const isSelected = v === selected;
                    return (
                        <button
                            key={v}
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls={`${baseId}-panel-${v}`}
                            id={`${baseId}-tab-${v}`}
                            onClick={() => setSelection(setId, v)}
                            className={clsx(
                                "capitalize relative px-4 py-2 text-sm font-medium transition-colors outline-none",
                                "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
                                "border-r border-zinc-950/10 last:border-r-0 dark:border-white/10",
                                isSelected
                                    ? "bg-blue-600 text-white shadow-inner"
                                    : "text-zinc-700 hover:bg-zinc-950/5 active:bg-zinc-950/10 dark:text-zinc-200 dark:hover:bg-white/10 dark:active:bg-white/15"
                            )}
                        >
                            {v}
                            {isSelected && (
                                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-blue-500/60 dark:ring-blue-400/40 rounded-none" />
                            )}
                        </button>
                    );
                })}
            </div>
            <div
                role="tabpanel"
                id={`${baseId}-panel-${selected}`}
                aria-labelledby={`${baseId}-tab-${selected}`}
                className="mt-3 rounded-lg border border-zinc-950/10 bg-white/70 p-4 text-sm leading-relaxed shadow-sm dark:border-white/10 dark:bg-zinc-800/60"
            >
                {items[selected]}
            </div>
        </div>
    );
};
