import { clsx } from "clsx";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={clsx(
                "animate-pulse bg-gray-600 rounded",
                className
            )}
        />
    );
}

export function ModuleSkeleton() {
    return (
        <div className="">
            {/* Module header skeleton */}
            <div className="w-full px-4 py-2 bg-gray-700 rounded-t-md">
                <div className="flex">
                    {/* Progress icon skeleton */}
                    <div className="mt-1 mr-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        {/* Module title skeleton */}
                        <Skeleton className="h-4 w-3/4" />
                        {/* Module summary skeleton */}
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            </div>
            
            {/* Units skeleton */}
            <div className="p-2 space-y-2 bg-gray-900 rounded-b-md">
                {Array.from({ length: 3 }).map((_, index) => (
                    <UnitSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}

export function UnitSkeleton() {
    return (
        <div className="w-full pl-3 pr-2 py-2 text-sm rounded-md bg-gray-800">
            <div className="flex items-center">
                {/* Progress icon skeleton */}
                <div className="mr-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    {/* Unit title skeleton */}
                    <Skeleton className="h-3 w-4/5" />
                    {/* Duration skeleton */}
                    <Skeleton className="h-2 w-12" />
                </div>
            </div>
        </div>
    );
}

export function LearningPathSkeleton() {
    return (
        <div className="space-y-4">
            {/* Learning path overview skeleton */}
            <div className="w-full p-2 bg-gray-700 rounded-md">
                <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Multiple modules skeleton */}
            {Array.from({ length: 2 }).map((_, index) => (
                <ModuleSkeleton key={index} />
            ))}
        </div>
    );
}

export function SidePanelHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16 rounded-md ml-2" />
        </div>
    );
}
