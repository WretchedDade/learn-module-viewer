import {
    CheckCircleIcon,
    EllipsisHorizontalCircleIcon, PlayCircleIcon
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Progress } from "~/github/githubTypes";

interface ProgressIconProps {
    className?: string;

    size?: number;
    position?: "left" | "right";
    progress: Progress | "active";
}

export function ProgressIcon({ className, progress, size = 6, position = "left" }: ProgressIconProps) {
    const iconClassName = "w-6 h-6";

    const getIcon = () => {
        switch (progress) {
            case "not-started":
                return <div />;
            case "started":
                return <EllipsisHorizontalCircleIcon className={clsx(iconClassName, "text-zinc-700 dark:text-zinc-200")} />;
            case "active":
                return <PlayCircleIcon className={`${iconClassName} text-blue-700 dark:text-blue-200`} />;
            case "completed":
                return <CheckCircleIcon className={clsx(iconClassName, "text-green-700 dark:text-green-200")} />;
            default:
                return null;
        }
    };

    return (
        <div
            className={clsx(
                className,
                `w-${size} h-${size} rounded-full flex items-center justify-center overflow-hidden`,
                {
                    "bg-zinc-200 dark:bg-zinc-800": progress === "not-started" || progress === "started",
                    "dark:bg-blue-600": progress === "active",
                    "dark:bg-green-600": progress === "completed",
                    "mr-4": position === "left",
                    "ml-4": position === "right",
                },
            )}
        >
            {getIcon()}
        </div>
    );
}
