import { Module } from "~/github/githubTypes";

interface ModuleViewProps {
    module: Module;
}

export function ModuleView({ module }: ModuleViewProps) {
    const totalDuration = module.units?.reduce((total, unit) => total + (unit.durationInMinutes || 0), 0) || 0;

    return (
        <div className="p-6 space-y-8 bg-gray-800 rounded-3xl">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                    {/* {module.iconUrl && (
                        <img 
                            src={module.iconUrl} 
                            alt={`${module.title} icon`}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                    )} */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-gray-200 mb-2">
                            {module.title || "Untitled Module"}
                        </h1>
                        {module.summary && (
                            <p className="text-lg text-gray-400 leading-relaxed">
                                {module.summary}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Module Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Abstract */}
                    {module.abstract && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-3">Abstract</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {module.abstract}
                            </p>
                        </div>
                    )}

                    {/* Prerequisites */}
                    {module.prerequisites && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-3">Prerequisites</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {module.prerequisites}
                            </p>
                        </div>
                    )}

                    {/* Module Stats */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-3">Module Information</h2>
                        <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-400">Total Units:</span>
                                <span className="text-gray-200">{module.units?.length || 0}</span>
                            </div>
                            {totalDuration > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400">Estimated Duration:</span>
                                    <span className="text-gray-200">{totalDuration} minutes</span>
                                </div>
                            )}
                            {module.uid && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400">Module ID:</span>
                                    <span className="text-gray-200 font-mono text-sm">{module.uid}</span>
                                </div>
                            )}
                            {module.badgeUid && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-400">Badge:</span>
                                    <span className="text-gray-200 font-mono text-sm">{module.badgeUid}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Levels */}
                    {module.levels && module.levels.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-3">Skill Levels</h2>
                            <div className="flex flex-wrap gap-2">
                                {module.levels.map((level, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                        {level}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Roles */}
                    {module.roles && module.roles.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-3">Target Roles</h2>
                            <div className="flex flex-wrap gap-2">
                                {module.roles.map((role, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    {module.products && module.products.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-200 mb-3">Products Covered</h2>
                            <div className="flex flex-wrap gap-2">
                                {module.products.map((product, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                    >
                                        {product}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Units Section */}
            {module.units && module.units.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-4">Units</h2>
                    <div className="space-y-3">
                        {module.units.map((unit, index) => (
                            <div 
                                key={unit.uid || index}
                                className="bg-gray-900 border border-gray-500 rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-200 mb-1">
                                            {index + 1}. {unit.title}
                                        </h3>
                                        {unit.metadata?.description && (
                                            <p className="text-gray-400 text-sm">
                                                {unit.metadata.description}
                                            </p>
                                        )}
                                    </div>
                                    {unit.durationInMinutes && (
                                        <span className="ml-4 px-2 py-1 bg-gray-800 text-gray-200 text-xs rounded-md font-medium flex-shrink-0">
                                            {unit.durationInMinutes} min
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
