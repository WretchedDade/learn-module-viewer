import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Module, Unit } from "~/github/githubTypes";
import { Markdown } from "./markdown/Markdown";
import { useModuleByUid } from "~/queries/useCatalogQueries";
import { useState } from "react";
import { ProgressMap } from "~/hooks/useProgressManagement";

export interface UnitViewProps {
    unit: Unit;
    module: Module;

    progress: ProgressMap;

    onUnitSelected: (unit: Unit) => void;
    onUnitCompleted: (nextUnit: Unit) => void;
    onModuleCompleted: (module: Module) => void;
}

export function UnitView({ unit, module, onUnitSelected, onUnitCompleted, onModuleCompleted, progress }: UnitViewProps) {
    const [showRaw, setShowRaw] = useState(false);
    const positionInModule = module.units.findIndex((u) => u.uid === unit.uid);

    const firstIncompleteUnit = module.units.filter((u) => u.progress !== "completed")[0];

    const nextUnit =
        positionInModule >= 0 && positionInModule < module.units.length - 1 ? module.units[positionInModule + 1] : null;

    const previousUnit = positionInModule > 0 ? module.units[positionInModule - 1] : null;

    const allOtherUnitsCompleted = module.units.every((u) => progress[u.uid] === "completed" || u.uid === unit.uid);

    return (
        <div className="p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold flex-1 break-words">{unit.title}</h1>
                {unit.markdownContent && (
                    <button
                        type="button"
                        onClick={() => setShowRaw((v) => !v)}
                        className="text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 px-3 py-1 rounded-md font-medium tracking-wide uppercase"
                        aria-pressed={showRaw}
                    >
                        {showRaw ? "Rendered" : "Raw"}
                    </button>
                )}
            </div>

            <p className="text-zinc-500 text-sm mb-4">{unit.durationInMinutes} minutes</p>

            {unit.markdownContent != null && !showRaw && (
                <div className="prose prose-lg max-w-none">
                    <Markdown content={unit.markdownContent} images={module.imageReferenceMap} />
                </div>
            )}

            {unit.markdownContent != null && showRaw && (
                <div className="mb-4 border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden">
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                        <span>Raw Markdown</span>
                        <span className="opacity-70">{unit.markdownContent.split(/\r?\n/).length} lines</span>
                    </div>
                    <pre className="m-0 p-3 overflow-auto text-sm leading-relaxed whitespace-pre-wrap font-mono bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 max-h-[60vh]">
                        {unit.markdownContent}
                    </pre>
                </div>
            )}

            {unit.markdownContent == null && (
                <div className="bg-yellow-200 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">No Content Available</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                This unit doesn't have any markdown content to display.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <hr className="my-6" />

            {nextUnit != null && (
                <>
                    <h2 className="text-xl font-bold mb-2 flex items-center">Next Unit: {nextUnit.title}</h2>
                    <div className="flex items-center mt-4 gap-4">
                        {previousUnit != null && <PreviousButton onClick={() => onUnitSelected(previousUnit)} />}
                        <NextButton onClick={() => onUnitCompleted(nextUnit)}>Next</NextButton>
                    </div>
                </>
            )}

            {nextUnit == null && !allOtherUnitsCompleted && (
                <>
                    <h2 className="text-xl font-bold mb-2 flex items-center">Module incomplete:</h2>

                    <div className="flex items-center mt-4 gap-4">
                        {previousUnit != null && <PreviousButton onClick={() => onUnitSelected(previousUnit)} />}
                        <NextButton onClick={() => onUnitCompleted(firstIncompleteUnit)}>Go back to finish</NextButton>
                    </div>
                </>
            )}

            {nextUnit == null && allOtherUnitsCompleted && (
                <>
                    <h2 className="text-xl font-bold mb-2 flex items-center">All units complete:</h2>

                    <div className="flex items-center mt-4 gap-4">
                        {previousUnit != null && <PreviousButton onClick={() => onUnitSelected(previousUnit)} />}
                        <NextButton onClick={() => onModuleCompleted(module)} hideIcon>
                            Complete Module
                        </NextButton>
                    </div>
                </>
            )}
        </div>
    );
}

function PreviousButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-zinc-300 dark:bg-zinc-700 dark:text-white px-4 py-2 rounded-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors flex items-center"
        >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            <span>Previous</span>
        </button>
    );
}

function NextButton({
    children,
    onClick,
    hideIcon = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    hideIcon?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className="bg-blue-300 dark:bg-blue-600 dark:text-white px-4 py-2 rounded-sm dark:hover:bg-blue-700 hover:bg-blue-400 transition-colors flex items-center"
        >
            <span>{children}</span>
            {!hideIcon && <ChevronRightIcon className="w-5 h-5 ml-2" />}
        </button>
    );
}
