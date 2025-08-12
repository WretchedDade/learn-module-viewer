import { useCallback, useState } from "react";
import { Progress } from "~/github/githubTypes";

export type ProgressMap = Record<string, Progress>;

export function useProgressManagement() {
    const [state, setState] = useState<ProgressMap>({});

    const start = useCallback(
        (id: string) => {
            setState((prev) => ({
                ...prev,
                [id]: "started",
            }));
        },
        [setState],
    );

    const complete = useCallback(
        (id: string) => {
            setState((prev) => ({
                ...prev,
                [id]: "completed",
            }));
        },
        [setState],
    );

    return { state, start, complete };
}
