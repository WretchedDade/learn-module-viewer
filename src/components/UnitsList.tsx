import { UnitYaml } from "~/github/githubTypes";
import { MarkdownContent } from "./MarkdownContent";

interface Unit {
    yaml: UnitYaml;
    markdownContent?: string;
}

interface UnitsListProps {
    units: Unit[];
    imageReferenceMap?: Record<string, string>; // imageRef -> data URL
}

export function UnitsList({ units, imageReferenceMap }: UnitsListProps) {
    if (units.length === 0) return null;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">
                Units ({units.length})
            </h2>
            <div className="space-y-4">
                {units.map((unit, index) => (
                    <div
                        key={unit.yaml.uid || index}
                        className="border border-gray-600 bg-gray-750 rounded p-4"
                    >
                        <h3 className="text-lg font-medium mb-2 text-gray-100">
                            {unit.yaml.title}
                        </h3>
                        {unit.yaml.durationInMinutes && (
                            <div className="text-sm text-gray-400 mb-2">
                                Duration: {unit.yaml.durationInMinutes} minutes
                            </div>
                        )}
                        {unit.markdownContent && (
                            <MarkdownContent content={unit.markdownContent} images={imageReferenceMap} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
