import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "../catalyst/badge";
// No Avatar: render raw icons directly
import clsx from "clsx";

type BaseProps = {
    title: string;
    uid: string;
    url?: string; // external URL (unused for navigation)
    to?: string; // internal route path to navigate to
    summary?: string;
    tags?: string[];
    footer?: React.ReactNode;
    className?: string;
    // Optional preformatted duration label, e.g. "1h 30m"
    durationLabel?: string;
};

function CardFrame({
    children,
    className,
    to,
    ariaLabel,
}: {
    children: React.ReactNode;
    className?: string;
    to?: string;
    ariaLabel?: string;
}) {
    return (
        <div
            className={
                (className ? className + " " : "") +
                [
                    // container & base
                    "group relative h-full flex flex-col overflow-hidden rounded-md border bg-white dark:bg-zinc-800",
                    // border & ring
                    "border-gray-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500/40",
                    // motion/hover effects
                    "transition-transform duration-200 ease-out shadow",
                    "hover:bg-gray-50 dark:hover:bg-zinc-800/80",
                    "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg",
                ].join(" ")
            }
        >
            {/* subtle glow overlay on hover */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
                <div className="absolute -inset-1 rounded-[12px] bg-gradient-to-tr from-blue-500/0 via-blue-500/10 to-purple-500/0 blur-[8px]" />
            </div>
            {to ? (
                <Link
                    preload="viewport"
                    to={to}
                    className="absolute inset-0 z-10 focus:outline-none"
                    aria-label={ariaLabel}
                    // prevent inner interactive elements from being blocked (none present currently)
                />
            ) : null}
            {children}
        </div>
    );
}

function CardBody({
    title,
    summary,
    tags,
    footer,
    beforeTitle,
}: Omit<BaseProps, "uid"> & { beforeTitle?: React.ReactNode; showDurationRow?: boolean }) {
    const showSummary = typeof summary === "string" && summary.trim().length > 0 && !isLikelyHtml(summary);
    return (
        <div className="p-3 flex flex-col flex-1">
            <div className="flex gap-3">
                {beforeTitle}
                <div className="font-medium text-sm break-words line-clamp-2 h-10" title={title}>
                    {title}
                </div>
            </div>
            <div className="mt-2 grow">
                {showSummary && (
                    <div className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-3" title={summary}>
                        {summary}
                    </div>
                )}
            </div>
            {tags && tags.length > 0 && (
                <div className={clsx("mt-4 flex flex-wrap gap-1.5 items-start")}>
                    {tags.map((t) => (
                        <Badge key={t} color="zinc" className="capitalize">
                            {t.replaceAll("-", " ")}
                        </Badge>
                    ))}
                </div>
            )}
            {footer != null && <div className={clsx("flex items-center gap-2 mt-6")}>{footer}</div>}
        </div>
    );
}

// BannerItemCard: large banner at the top
export function BannerItemCard({
    title,
    uid,
    url,
    to,
    summary,
    tags,
    footer,
    className,
    bannerSrc,
    bannerAlt,
    durationLabel,
}: BaseProps & { bannerSrc?: string; bannerAlt?: string }) {
    const [fail, setFail] = useState(false);
    const showImg = !!bannerSrc && !fail;
    const initials = getInitials(title);
    return (
        <CardFrame className={className} to={to} ariaLabel={title}>
            <div className="relative w-full aspect-641/321 bg-gray-100 dark:bg-zinc-700">
                {!showImg && (
                    <div className="absolute inset-0 grid place-items-center text-gray-600 dark:text-zinc-200 text-lg font-semibold">
                        {initials}
                    </div>
                )}
                {showImg && (
                    <img
                        src={bannerSrc}
                        alt={bannerAlt ?? title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        onError={() => setFail(true)}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                )}
                {durationLabel && (
                    <div className="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
                        {durationLabel}
                    </div>
                )}
            </div>
            <CardBody
                title={title}
                summary={summary}
                tags={tags}
                footer={footer}
                // Hide the duration row since we overlay it on the banner
                showDurationRow={false}
            />
        </CardFrame>
    );
}

// IconItemCard: small icon/initials to the left of the title
export function IconItemCard({
    title,
    url,
    to,
    summary,
    tags,
    footer,
    className,
    iconSrc,
    initials,
    durationLabel,
}: BaseProps & { iconSrc?: string; initials?: string }) {
    const [fail, setFail] = useState(false);
    const showImg = !!iconSrc && !fail;
    const initialsText = initials || getInitials(title);
    const thumb = showImg ? (
        <img
            src={iconSrc}
            alt=""
            className="size-12 object-contain transition-transform duration-300 ease-out group-hover:scale-110"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFail(true)}
        />
    ) : null;
    return (
        <CardFrame className={className} to={to} ariaLabel={title}>
            <CardBody
                title={title}
                summary={summary}
                tags={tags}
                footer={<LeftFooter durationLabel={durationLabel}>{footer}</LeftFooter>}
                beforeTitle={thumb}
            />
        </CardFrame>
    );
}

// ItemCard: simple text-only card
export function ItemCard({ title, uid, url, to, summary, tags, footer, className, durationLabel }: BaseProps) {
    return (
        <CardFrame className={className} to={to} ariaLabel={title}>
            <CardBody
                title={title}
                summary={summary}
                tags={tags}
                footer={<LeftFooter durationLabel={durationLabel}>{footer}</LeftFooter>}
                durationLabel={durationLabel}
                showDurationRow={false}
            />
        </CardFrame>
    );
}

function getInitials(text: string, max = 2): string {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    return words
        .slice(0, max)
        .map((w) => w[0]!.toUpperCase())
        .join("");
}

function isLikelyHtml(text: string): boolean {
    // Simple detection: any HTML tag or entities that imply markup
    if (/[<][a-z!/]/i.test(text)) return true; // starts like <p>, <div>, <!-- etc.
    if (/(<\/?\w+[^>]*>)/.test(text)) return true; // generic tag pattern
    if (/&[a-zA-Z#0-9]+;/.test(text) && /<[^>]+>/.test(text)) return true; // entities with tags
    return false;
}

function LeftFooter({ durationLabel, children }: { durationLabel?: string; children?: React.ReactNode }) {
    if (durationLabel == null && children == null) return null;

    return (
        <div className="flex items-center gap-2">
            {durationLabel && (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-700/60 dark:text-zinc-200 px-2 py-0.5 text-[11px] font-medium">
                    {durationLabel}
                </span>
            )}
            {children}
        </div>
    );
}
