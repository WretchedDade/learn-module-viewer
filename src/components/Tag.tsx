import { clsx } from "clsx";
import { PropsWithChildren } from "react";

interface TagProps {
    rounded?: boolean;
    className?: string;
}

export function Tag({ children, className, rounded = false }: PropsWithChildren<TagProps>) {
    return (
        <span
            className={clsx(`capitalize px-3 py-1 text-xs font-medium border`, {
                "bg-zinc-600/20 text-zinc-700 dark:text-zinc-300 border-zinc-500/30":
                    className == null || !className.includes("bg-"),
                [className ?? ""]: className != null && className !== "",
                "rounded-full": rounded,
                "rounded-xs": !rounded,
            })}
        >
            {children}
        </span>
    );
}

interface TagsProps extends TagProps {
    keyPrefix: string;
    values: string[];
}

export function Tags({ keyPrefix, values, ...props }: TagsProps) {
    const distinctValues = Array.from(new Set(values));
    return distinctValues.map((tag) => (
        <Tag key={`${keyPrefix}-${tag}`} {...props}>
            {tag.replace("-", " ")}
        </Tag>
    ));
}
