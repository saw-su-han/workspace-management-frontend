import React, { useState, useEffect } from "react";

export const ThemeToggle: React.FC = () => {
    const storageKey = "theme_preference";

    const [isDark, setIsDark] = useState(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved !== null) {
                return saved === "dark";
            }
        } catch { }
        return document.body.classList.contains("dark");
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, isDark ? "dark" : "light");
        } catch { }

        if (isDark) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 shadow-md shadow-slate-950/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:border-mint-500/40 dark:hover:border-mint-400/40 cursor-pointer group overflow-hidden"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-mint-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-7.072 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 text-mint-600 group-hover:-rotate-12 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
            )}
        </button>
    );
};