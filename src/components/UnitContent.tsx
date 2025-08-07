import { Unit } from "~/github/githubTypes";
import { MarkdownContent } from "./MarkdownContent";

interface UnitContentProps {
    unit: Unit;
    imageReferenceMap?: Record<string, string>;
}

export function UnitContent({ unit, imageReferenceMap }: UnitContentProps) {
    return (
        <div className="space-y-6">
            {/* Unit Header */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {unit.yaml.title}
                </h1>
                
                {unit.yaml.durationInMinutes && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        🕒 {unit.yaml.durationInMinutes} minutes
                    </div>
                )}
            </div>

            {/* Unit Content - Full Markdown Rendered */}
            {unit.markdownContent && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <MarkdownContent 
                        content={unit.markdownContent} 
                        images={imageReferenceMap}
                        showFullContent={true}
                        expandedDisplay={true}
                    />
                </div>
            )}

            {/* Unit Metadata */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-white">
                    Unit Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    {unit.yaml.uid && (
                        <div>
                            <span className="font-medium text-gray-400">UID:</span>
                            <div className="text-gray-300 font-mono text-xs mt-1">
                                {unit.yaml.uid}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <span className="font-medium text-gray-400">Path:</span>
                        <div className="text-gray-300 font-mono text-xs mt-1">
                            {unit.path}
                        </div>
                    </div>

                    {unit.yaml.durationInMinutes && (
                        <div>
                            <span className="font-medium text-gray-400">Duration:</span>
                            <div className="text-gray-300 mt-1">
                                {unit.yaml.durationInMinutes} minutes
                            </div>
                        </div>
                    )}

                    {unit.yaml.metadata && (
                        <div>
                            <span className="font-medium text-gray-400">Metadata Properties:</span>
                            <div className="text-gray-300 text-xs mt-1">
                                {Object.keys(unit.yaml.metadata).length} total
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Detailed Metadata */}
                {unit.yaml.metadata && Object.keys(unit.yaml.metadata).length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-md font-medium text-blue-400 mb-3">
                            Complete Metadata
                        </h4>
                        <div className="p-4 bg-gray-900 rounded border border-gray-600">
                            <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(unit.yaml.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
