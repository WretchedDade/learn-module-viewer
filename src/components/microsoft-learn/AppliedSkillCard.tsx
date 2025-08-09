import type { AppliedSkillRecord } from "../../microsoft-learn/responses";
import { ItemCard } from "./BaseItemCard";
import { extractTags } from "./utils";

export function AppliedSkillCard({ item }: { item: AppliedSkillRecord }) {
    const title = item.title ?? item.uid;
    const tags = extractTags(item);

    return (
        <ItemCard
            title={title}
            uid={item.uid}
            to={`/applied-skills/${item.uid}`}
            summary={item.summary}
            tags={tags}
        />
    );
}
