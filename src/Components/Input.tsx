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
                <label className="font-mono-nav text-[11px] font-bold tracking-wider uppercase text-[#0E3A5C]/70 dark:text-[#E6F1F8]/70">
                    {label}
                </label>
                <input
                    ref={ref}
                    {...props}
                    className="w-full rounded-lg border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 bg-white/60 dark:bg-[#051C2E]/60 px-3.5 py-2.5 text-sm text-[#0E3A5C] dark:text-[#E6F1F8] placeholder-[#0E3A5C]/35 dark:placeholder-[#4A9DC7]/30 transition-all focus:border-[#4A9DC7] focus:bg-white dark:focus:bg-[#051C2E] focus:outline-none focus:ring-2 focus:ring-[#4A9DC7]/20 disabled:opacity-50"
                />
                {error && (
                    <span className="font-mono-nav text-[10px] font-semibold text-red-600 dark:text-red-400">
                        ⚠️ {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";