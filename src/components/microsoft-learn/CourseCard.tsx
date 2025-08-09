import type { CourseRecord } from "../../microsoft-learn/responses";
import { IconItemCard } from "./BaseItemCard";
import { extractTags } from "./utils";

export function CourseCard({ item }: { item: CourseRecord }) {
  const title = item.title ?? item.uid;
  const tags = extractTags(item, 3, ["levels", "roles", "products"]);
  const durationLabel = formatHours(item.duration_in_hours);

  return (
    <IconItemCard
      title={title}
      uid={item.uid}
      to={`/courses/${item.uid}`}
  summary={item.summary}
      iconSrc={item.icon_url ?? undefined}
      tags={tags}
      durationLabel={durationLabel}
    />
  );
}

function formatHours(hours?: number) {
  if (!hours || hours <= 0) return undefined;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
