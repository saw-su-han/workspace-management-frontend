// src/Components/AuthCard.tsx
import React from "react";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-tr from-[#eef3f8] via-[#f4f7fa] to-[#e7eff7] dark:from-[#080d17] dark:via-[#0b121f] dark:to-[#0f192b] px-4 py-12 selection:bg-sky-500/20 selection:text-sky-800 dark:selection:text-sky-200">
            <div className="w-full max-w-[430px] border border-white dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-10 rounded-2xl shadow-[0_24px_50px_-12px_rgba(148,163,184,0.25)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-lg garments animate-ocean">
                <div className="mb-8 text-center">
                    {/* Elegant Ocean Icon Ring */}
                    <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-sans text-lg font-bold shadow-sm shadow-sky-100 dark:shadow-none">
                        ≈
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    <p className="mt-1 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        {subtitle}
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
};