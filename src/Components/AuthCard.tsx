import React from "react";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    headerNav?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, headerNav }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#080d17] px-4 py-10 transition-colors duration-300 overflow-x-hidden font-sans">
            {/* Header Navigation Slot */}
            {headerNav && (
                <div className="absolute top-0 left-0 right-0 z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
                    {headerNav}
                </div>
            )}

            {/* Grid Pattern Backdrop */}
            <div
                className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(11, 244, 200, 0.25) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Atmospheric Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-mint-500/10 dark:bg-mint-500/15 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />

            {/* Card Container */}
            <div className="group relative w-full max-w-[440px] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0f172a]/70 p-7 sm:p-10 rounded-3xl shadow-2xl shadow-slate-950/10 backdrop-blur-2xl transition-all duration-300 z-10 overflow-hidden my-auto glow-border">
                <div className="mb-8 text-center">
                    {/* Brand Icon Header */}
                    <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-mint-500 to-teal-400 blur-md opacity-50 animate-pulse"></div>
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-mint-600 via-teal-500 to-emerald-400 shadow-xl shadow-mint-500/30 text-slate-950 font-black text-xl">
                            ≈
                        </div>
                    </div>

                    <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    <p className="mt-1.5 font-mono-nav text-[11px] font-bold tracking-widest text-mint-600 dark:text-mint-400 uppercase">
                        {subtitle}
                    </p>
                </div>

                {children}
            </div>

            {/* Bottom Tagline */}
            <span className="relative z-10 font-mono-nav text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase select-none mt-auto pt-6">
                Workspace Identity Console · Node Auth
            </span>
        </div>
    );
};