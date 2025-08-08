import {
    CheckCircleIcon,
    EllipsisHorizontalCircleIcon,
    EllipsisHorizontalIcon,
    PlayCircleIcon,
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
                return <EllipsisHorizontalCircleIcon className={clsx(iconClassName, "text-gray-200")} />;
            case "active":
                return <PlayCircleIcon className={`${iconClassName} text-blue-200`} />;
            case "completed":
                return <CheckCircleIcon className={clsx(iconClassName, "text-green-200")} />;
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
                    "bg-gray-800": progress === "not-started" || progress === "started",
                    "bg-blue-600": progress === "active",
                    "bg-green-600": progress === "completed",
                    "mr-4": position === "left",
                    "ml-4": position === "right",
                },
            )}
        >
            {getIcon()}
        </div>
    );
}
