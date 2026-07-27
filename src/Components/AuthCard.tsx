import React from "react";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    headerNav?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, headerNav }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-mint-50 dark:bg-mint-950 px-4 py-12 transition-colors duration-300 overflow-hidden font-sans">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Header Navigation Slot */}
            {headerNav && (
                <div className="absolute top-0 left-0 right-0 z-30 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    {headerNav}
                </div>
            )}

            {/* Chart-paper depth grid lines */}
            <div
                className="absolute inset-0 opacity-40 dark:opacity-25 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(3, 48, 39, 0.05) 0px, rgba(3, 48, 39, 0.05) 1px, transparent 1px, transparent 32px)',
                }}
            />

            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-300/20 dark:bg-mint-500/10 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-400/15 dark:bg-mint-600/10 blur-[160px] rounded-full pointer-events-none" />

            {/* Card Container - Centered Vertically & Horizontally */}
            <div className="group relative w-full max-w-[440px] border border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-900/40 p-8 sm:p-10 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 z-10 overflow-hidden my-auto">

                {/* Ticket Notch Details matching Home page cards */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />

                <div className="mb-8 text-center">
                    {/* Spinning Compass Ring Header */}
                    <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-700 dark:text-mint-400" strokeWidth="0.75" strokeDasharray="0.5 7" />
                            <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-mint-700 dark:fill-mint-400" />
                        </svg>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-mint-900 to-mint-600 shadow-md ring-1 ring-mint-700/30">
                            <span className="font-display text-lg font-semibold text-mint-50">≈</span>
                        </div>
                    </div>

                    <h1 className="font-display font-semibold text-2xl text-mint-900 dark:text-mint-50">
                        {title}
                    </h1>
                    <p className="mt-1 font-mono-nav text-[10px] font-bold tracking-[0.2em] text-mint-700 dark:text-mint-400 uppercase">
                        {subtitle}
                    </p>
                </div>

                {children}
            </div>

            {/* Bottom Tagline */}
            <span className="relative z-10 font-mono-nav text-[9px] font-medium tracking-[0.25em] text-mint-900/40 dark:text-mint-400/40 uppercase select-none mt-auto pt-6">
                Secure Operational Deck · Provisioning Unit
            </span>
        </div>
    );
};