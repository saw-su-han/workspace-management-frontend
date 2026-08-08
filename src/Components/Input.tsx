// src/Components/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                <label className="font-mono-nav text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                    {label}
                </label>
                <input
                    ref={ref}
                    {...props}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:border-mint-500 dark:focus:border-mint-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-mint-500/20 disabled:opacity-50 shadow-sm"
                />
                {error && (
                    <span className="font-mono-nav text-[10px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";