import { LearningPath, Module } from "~/github/githubTypes";
import clsx from "clsx";
import { Tag } from "./Tag";
import { ProgressTag } from "./ProgressTag";

interface LearningPathViewProps {
    learningPath: LearningPath;
    onModuleSelected: (module: Module) => void;
}

export function LearningPathView({ learningPath, onModuleSelected }: LearningPathViewProps) {
    // Flatten and filter out undefined/empty arrays
    const allTags = [
        ...(learningPath.levels || []),
        ...(learningPath.roles || []),
        ...(learningPath.products || []),
    ].filter(Boolean);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{learningPath.title}</h1>
            {/* <img src={learningPath.iconUrl} alt={`${learningPath.title} icon`} className="w-16 h-16 mb-4" /> */}
            <p className="text-zinc-300 mb-6">{learningPath.summary}</p>

            {/* Tags Section */}
            {allTags.length > 0 && (
                <div className="mb-6">
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                                <Tag rounded key={tag} className="bg-blue-600/20 text-blue-300border-blue-500/30">
                                    {tag.replace("-", " ")}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <hr className="mt-8 my-6" />

            {/* Modules Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Modules</h2>
                {learningPath.modules.map((module, index) => (
                    <button
                        key={module.uid}
                        onClick={() => onModuleSelected(module)}
                        className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:bg-zinc-800 transition-colors w-full text-left"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                    {index + 1}
                                </span>
                                <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                            </div>
                            {module.progress && (
                                <ProgressTag progress={module.progress} />
                            )}
                        </div>

                        {module.summary && <p className="text-zinc-300 mb-4">{module.summary}</p>}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                {module.units && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        {module.units.length} units
                                    </span>
                                )}
                                {module.units && module.units.some((unit) => unit.durationInMinutes) && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        {module.units.reduce((total, unit) => total + (unit.durationInMinutes || 0), 0)}{" "}
                                        min
                                    </span>
                                )}
                            </div>

                            {(module.levels || module.roles || module.products) && (
                                <div className="flex flex-wrap gap-1">
                                    {[...(module.levels || []), ...(module.roles || []), ...(module.products || [])]
                                        .slice(0, 3)
                                        .map((tag) => (
                                            <Tag key={tag}>{tag}</Tag>
                                        ))}
                                    {[...(module.levels || []), ...(module.roles || []), ...(module.products || [])]
                                        .length > 3 && (
                                        <Tag>
                                            +
                                            {[
                                                ...(module.levels || []),
                                                ...(module.roles || []),
                                                ...(module.products || []),
                                            ].length - 3}{" "}
                                            more
                                        </Tag>
                                    )}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
