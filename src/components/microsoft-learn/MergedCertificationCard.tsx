import type { MergedCertificationRecord } from "../../microsoft-learn/responses";
import { IconItemCard } from "./BaseItemCard";
import { extractTags } from "./utils";

export function MergedCertificationCard({ item }: { item: MergedCertificationRecord }) {
    const title = item.title ?? item.uid;

    const tags = extractTags(item, 4, ["products", "roles", "levels", "subjects"]);
    const durationLabel = formatMinutes(item.exam_duration_in_minutes);

    return (
        <IconItemCard
            title={title}
            uid={item.uid}
            to={`/certifications/${item.uid}`}
            summary={item.summary}
            iconSrc={item.icon_url ?? ""}
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
