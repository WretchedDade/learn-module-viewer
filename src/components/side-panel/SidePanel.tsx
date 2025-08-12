import React, { PropsWithChildren } from "react";

interface SidePanelProps {
    header: React.ReactNode;
}

export function SidePanel({ header, children }: PropsWithChildren<SidePanelProps>) {
    return (
        <aside className="w-80 bg-zinc-200 border-zinc-200 dark:bg-zinc-800 border-r dark:border-zinc-700 overflow-y-auto h-full p-4 flex flex-col">
            {header}

            <nav className="flex flex-col space-y-2 grow mt-4 gap-8">
                <div className="grow">{children}</div>
            </nav>
        </aside>
    );
}

interface SidePanelHeaderProps {
    title: string;
    type: string;
}

export function SidePanelHeader({ title, type }: SidePanelHeaderProps) {
    return (
        <h2
            className="w-full text-xl font-semibold text-zinc-700 dark:text-zinc-200 flex items-center"
            title={title}
        >
            <span className="block w-full truncate">{title}</span>
        </h2>
    );
}
