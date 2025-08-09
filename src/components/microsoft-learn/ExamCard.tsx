import type { ExamRecord } from "../../microsoft-learn/responses";
import { IconItemCard } from "./BaseItemCard";
import { extractTags } from "./utils";

export function ExamCard({ item }: { item: ExamRecord }) {
    const title = item.title ?? item.uid;
    const tags = extractTags(item, 4, ["levels", "roles", "products"]);

    return (
        <IconItemCard
            title={title}
            uid={item.uid}
            to={`/exams/${item.uid}`}
            summary={item.subtitle ?? undefined}
            iconSrc={item.icon_url ?? undefined}
            tags={tags}
        />
    );
}
