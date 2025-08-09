import type { LearningPathRecord } from "../../microsoft-learn/responses";
import { BannerItemCard, IconItemCard } from "./BaseItemCard";
import { extractTags } from "./utils";

export function LearningPathCard({
    item,
    variant = "banner",
}: {
    item: LearningPathRecord;
    variant?: "banner" | "icon";
}) {
    const title = item.title ?? item.uid;

    const tags = extractTags(item);
    const durationLabel = formatMinutes(item.duration_in_minutes);

    if (variant === "icon") {
        return (
            <IconItemCard
                title={title}
                uid={item.uid}
                to={`/learning-paths/${item.uid}`}
                summary={item.summary}
                iconSrc={item.icon_url ?? undefined}
                tags={tags}
                durationLabel={durationLabel}
            />
        );
    }

    return (
        <BannerItemCard
            title={title}
            uid={item.uid}
            to={`/learning-paths/${item.uid}`}
            summary={item.summary}
            bannerSrc={item.social_image_url ?? ""}
            tags={tags}
            durationLabel={durationLabel}
        />
    );
}

function formatMinutes(mins?: number) {
    if (!mins || mins <= 0) return undefined;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}
