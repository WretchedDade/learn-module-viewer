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
                "bg-yellow-600/20 text-yellow-300 border-yellow-500/30": progress === "active",
                "bg-blue-600/20 text-blue-300 border-blue-500/30": progress === "started",
                "bg-gray-600/20 text-gray-300 border-gray-500/30": progress === "not-started",
            })}
        >
            {progress.replace("-", " ")}
        </Tag>
    );
}
