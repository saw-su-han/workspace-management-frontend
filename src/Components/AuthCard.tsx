// src/Components/AuthCard.tsx
import React from "react";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
    return (
        <div className="relative flex min-h-screen w-screen items-center justify-center bg-[#DCEAF5] dark:bg-[#051C2E] px-4 py-12 transition-colors duration-300 overflow-hidden font-sans">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Chart-paper depth grid lines */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(14,58,92,0.035) 0px, rgba(14,58,92,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />

            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A9DC7]/[0.08] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2E6F95]/[0.06] blur-[160px] rounded-full pointer-events-none" />

            {/* Card Container */}
            <div className="group relative w-full max-w-[440px] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/75 dark:bg-[#0A2E4A]/50 p-8 sm:p-10 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 z-10 overflow-hidden">

                {/* Ticket Notch Details matching Home page cards */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                <div className="mb-8 text-center">
                    {/* Spinning Compass Ring Header */}
                    <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="#2E6F95" strokeWidth="0.75" strokeDasharray="0.5 7" />
                            <path d="M50 8 L54 46 L50 50 L46 46 Z" fill="#2E6F95" />
                        </svg>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#0E3A5C] to-[#4A9DC7] shadow-md ring-1 ring-[#2E6F95]/30">
                            <span className="font-display text-lg font-semibold text-white">≈</span>
                        </div>
                    </div>

                    <h1 className="font-display font-semibold text-2xl text-[#0E3A5C] dark:text-[#E6F1F8]">
                        {title}
                    </h1>
                    <p className="mt-1 font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#1E5F87] dark:text-[#4A9DC7] uppercase">
                        {subtitle}
                    </p>
                </div>

                {children}
            </div>

            {/* Bottom Tagline */}
            <span className="absolute bottom-6 font-mono-nav text-[9px] font-medium tracking-[0.25em] text-[#0E3A5C]/35 dark:text-[#4A9DC7]/35 uppercase select-none">
                Secure Operational Deck · Provisioning Unit
            </span>
        </div>
    );
};