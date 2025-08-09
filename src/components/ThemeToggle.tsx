import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "~/contexts/ThemeContext";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="theme-select" className="text-sm font-medium">
                Theme:
            </label>
            <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </select>
        </div>
    );
}

export function ThemeToggleButton() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    const getIcon = () => {
        switch (theme) {
            case "light":
                return SunIcon;
            case "dark":
                return MoonIcon;
            case "system":
                return ComputerDesktopIcon;
        }
    };

    const Icon = getIcon();

    return (
        <button
            onClick={toggleTheme}
            className="border p-2 rounded-lg dark:text-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:text-white dark:hover:bg-zinc-900/75 dark:hover:border-zinc-600 dark:active:bg-zinc-900/50 dark:active:border-zinc-500"
            title={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
        >
            {<Icon className="w-6 h-6" />}
        </button>
    );
}
