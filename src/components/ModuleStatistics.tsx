import { UnitYaml, CodeFile } from "~/github/githubTypes";

interface Unit {
    yaml: UnitYaml;
    markdownContent?: string;
}

interface Image {
    path: string;
    name: string;
    dataUrl: string;
}

interface Markdown {
    path: string;
    name: string;
    content: string;
}

interface ModuleStatisticsProps {
    units: Unit[];
    images: Image[];
    markdownFiles: Markdown[];
    codeFiles: CodeFile[];
    performance?: {
        duration: number;
        durationFormatted: string;
    };
}

export function ModuleStatistics({ units, images, markdownFiles, codeFiles, performance }: ModuleStatisticsProps) {
    const totalMinutes = units.reduce(
        (total, unit) => total + (unit.yaml.durationInMinutes || 0),
        0
    );

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 text-white">
                Module Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {units.length}
                    </div>
                    <div className="text-gray-400">Units</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {images.length}
                    </div>
                    <div className="text-gray-400">Images</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        {markdownFiles.length}
                    </div>
                    <div className="text-gray-400">Markdown Files</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                        {codeFiles.length}
                    </div>
                    <div className="text-gray-400">Code Files</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                        {totalMinutes}
                    </div>
                    <div className="text-gray-400">Total Minutes</div>
                </div>
                {performance && (
                    <div className="text-center">
                        <div className="text-2xl font-bold text-rose-400">
                            {performance.durationFormatted}
                        </div>
                        <div className="text-gray-400">Load Time</div>
                    </div>
                )}
            </div>
        </div>
    );
}
