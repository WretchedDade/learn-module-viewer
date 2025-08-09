import { createFileRoute } from "@tanstack/react-router";
import { useAppliedSkillByUid } from "../queries/useCatalogQueries";

export const Route = createFileRoute("/applied-skills/$uid")({
  component: AppliedSkillDetail,
});

function AppliedSkillDetail() {
  const { uid } = Route.useParams();
  const q = useAppliedSkillByUid(uid);
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">Applied Skill: {uid}</h1>
      {q.isLoading && <div>Loading…</div>}
      {q.isError && <div className="text-red-600 dark:text-red-400">{q.error?.message}</div>}
      {q.isSuccess && (
        <pre className="whitespace-pre-wrap break-words text-sm bg-gray-100 dark:bg-zinc-800 p-3 rounded">{JSON.stringify(q.data ?? null, null, 2)}</pre>
      )}
    </div>
  );
}
