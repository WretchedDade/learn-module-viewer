import clsx from "clsx";
import { Progress } from "~/github/githubTypes";
import { Tag } from "./Tag";

interface ProgressTagProps {
    progress: Progress;
    className?: string;
}

export function ProgressTag({ progress, className }: ProgressTagProps) {
    return (
        <Tag
            rounded
            className={clsx(className,{
                "bg-green-600/20 text-green-300 border-green-500/30": progress === "completed",
                "bg-blue-600/20 text-blue-300 border-blue-500/30": progress === "started",
                "bg-zinc-600/20 text-zinc-300 border-zinc-500/30": progress === "not-started",
            })}
        >
            {progress.replace("-", " ")}
        </Tag>
    );
}
