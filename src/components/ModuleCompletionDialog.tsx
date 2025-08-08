import { Module } from "~/github/githubTypes";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "./Dialog";
import clsx from "clsx";

interface ModuleCompletionDialogProps {
    open: boolean;
    onClose: () => void;
    module: Module;
}

function ModuleCompletionDialog({ open, onClose, module }: ModuleCompletionDialogProps) {
    const totalUnits = module.units?.length || 0;
    const totalDuration = module.units?.reduce((total, unit) => total + (unit.durationInMinutes || 0), 0) || 0;

    return (
        <Dialog open={open} onClose={onClose} size="3xl" className="p-8">
            <div className="text-center">
                {/* Celebration Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                    <svg 
                        className="h-10 w-10 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                </div>

                <DialogTitle className="text-2xl font-bold text-center">
                    🎉 Module Completed!
                </DialogTitle>

                <DialogDescription className="text-center text-zinc-600 dark:text-zinc-400">
                    Congratulations! You've successfully completed the module.
                </DialogDescription>
            </div>

            <DialogBody>
                <div className="space-y-6">
                    {/* Module Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            {module.title}
                        </h3>
                        {module.summary && (
                            <p className="text-sm text-green-700 dark:text-green-300">
                                {module.summary}
                            </p>
                        )}
                    </div>

                    {/* Achievement Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totalUnits}
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                Units Completed
                            </div>
                        </div>
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {totalDuration}
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                Minutes Learned
                            </div>
                        </div>
                    </div>

                    {/* Badge/Progress Indicator */}
                    {module.badgeUid && (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full border border-yellow-300 dark:border-yellow-700">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-medium">Badge Earned!</span>
                            </div>
                        </div>
                    )}

                    {/* Motivational Message */}
                    <div className="text-center">
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            Keep up the great work! You're making excellent progress on your learning journey.
                        </p>
                    </div>
                </div>
            </DialogBody>

            <DialogActions>
                <button
                    onClick={onClose}
                    className={clsx(
                        "px-6 py-2 rounded-lg font-medium transition-colors",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    )}
                >
                    Continue Learning
                </button>
            </DialogActions>
        </Dialog>
    );
}

export default ModuleCompletionDialog;
