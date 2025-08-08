import { Module, Unit } from "~/github/githubTypes";
import { Tag } from "./Tag";
import { ProgressIcon } from "./ProgressIcon";
import { ProgressTag } from "./ProgressTag";

interface ModuleViewProps {
    module: Module;
    onUnitSelected: (unit: Unit) => void;
}

export function ModuleView({ module, onUnitSelected }: ModuleViewProps) {
    const allTags = [...(module.levels || []), ...(module.roles || []), ...(module.products || [])].filter(Boolean);

    const totalDuration = module.units?.reduce((total, unit) => total + (unit.durationInMinutes || 0), 0) || 0;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2 flex items-center">{module.title}</h1>
            <p className="text-zinc-500 text-sm mb-4">{totalDuration} minutes</p>
            {/* <img src={learningPath.iconUrl} alt={`${learningPath.title} icon`} className="w-16 h-16 mb-4" /> */}
            <p className="text-zinc-300 mb-6">{module.summary}</p>

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

            <h2 className="text-xl font-bold mb-2">Learning Objectives</h2>
            <p className="text-zinc-400 leading-relaxed">{module.abstract}</p>

            <h2 className="text-xl font-bold mb-2 mt-6">Prerequisites</h2>
            <p className="text-zinc-400 leading-relaxed">{module.prerequisites}</p>

            {/* Units Section */}
            {module.units && module.units.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-zinc-200 mb-4">Units</h2>
                    <div className="space-y-4">
                        {module.units.map((unit, index) => (
                            <button
                                key={unit.uid || index}
                                onClick={() => onUnitSelected(unit)}
                                className="w-full text-left px-4 py-2 border-l-4 border-zinc-500 hover:border-blue-600 text-zinc-200 hover:text-blue-400 transition-colors"
                            >
                                <div className="flex items-center">
                                    <h3 className="text-lg font-medium mb-1">
                                        {index + 1}. {unit.title}
                                    </h3>

                                    <ProgressTag className="ml-4" progress={unit.progress} />
                                </div>
                                {unit.durationInMinutes && (
                                    <span className=" text-zinc-300 text-xs rounded-md font-medium flex-shrink-0">
                                        {unit.durationInMinutes} min
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

