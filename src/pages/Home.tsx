// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-[#DCEAF5] dark:bg-[#051C2E] px-4 py-16 transition-colors duration-300 overflow-hidden">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Chart-paper depth lines, matching the dashboard */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(14,58,92,0.035) 0px, rgba(14,58,92,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A9DC7]/[0.08] dark:bg-[#4A9DC7]/[0.08] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2E6F95]/[0.06] dark:bg-[#2E6F95]/[0.06] blur-[160px] rounded-full pointer-events-none" />

            {/* Introduction Hero Section */}
            <div className="relative max-w-2xl text-center mb-16">
                <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] opacity-70" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="#2E6F95" strokeWidth="0.75" strokeDasharray="0.5 7" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" fill="#2E6F95" />
                    </svg>
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#0E3A5C] to-[#4A9DC7] shadow-lg shadow-teal-500/20 ring-1 ring-[#2E6F95]/30">
                        <span className="font-display text-xl font-semibold text-white">≈</span>
                    </div>
                </div>

                <p className="font-mono-nav text-[10px] font-medium text-[#0E3A5C]/50 dark:text-[#4A9DC7]/60 tracking-[0.3em] uppercase mb-4">
                    Control Deck · Access Point
                </p>

                <h1 className="font-display font-semibold text-4xl leading-[1.1] tracking-tight text-[#0E3A5C] dark:text-[#E6F1F8] sm:text-5xl">
                    Where engineering teams <br />
                    <span className="italic text-[#1E5F87] dark:text-[#4A9DC7]">collaborate fluently.</span>
                </h1>
                <p className="mt-5 text-base text-[#0E3A5C]/50 dark:text-[#E6F1F8]/40 max-w-md mx-auto font-medium">
                    A premium operational environment designed to coordinate structures, build timelines, and track systemic project pipelines.
                </p>
            </div>

            {/* Dynamic Path Selectors */}
            <div className="relative grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">

                {/* Path A: Access Existing Space */}
                <div className="group relative border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/70 dark:bg-[#0A2E4A]/40 backdrop-blur-md p-8 rounded-xl shadow-sm hover:border-[#4A9DC7]/60 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    {/* ticket notch detail, consistent with workspace cards */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                    <div>
                        <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#1E5F87] dark:text-[#4A9DC7] uppercase mb-3">
                            Returning Members
                        </div>
                        <h2 className="font-display font-semibold text-xl text-[#0E3A5C] dark:text-[#E6F1F8] mb-2">
                            Enter Workspace
                        </h2>
                        <p className="text-[#0E3A5C]/50 dark:text-[#E6F1F8]/40 text-sm font-medium leading-relaxed mb-8">
                            Authenticate your account keys to log directly back into your team's custom channels, ongoing task logs, and active operational boards.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="font-mono-nav inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-[#0E3A5C] dark:bg-[#4A9DC7] text-[#DCEAF5] dark:text-[#051C2E] hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 text-xs font-bold uppercase tracking-wide shadow-md transition-all cursor-pointer text-center"
                    >
                        Sign In to Workspace
                    </Link>
                </div>

                {/* Path B: Deploy New Architecture */}
                <div className="group relative border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/70 dark:bg-[#0A2E4A]/40 backdrop-blur-md p-8 rounded-xl shadow-sm hover:border-[#4A9DC7]/60 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                    <div>
                        <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#0E3A5C]/60 dark:text-[#E6F1F8]/50 uppercase mb-3">
                            New Environments
                        </div>
                        <h2 className="font-display font-semibold text-xl text-[#0E3A5C] dark:text-[#E6F1F8] mb-2">
                            Create New Space
                        </h2>
                        <p className="text-[#0E3A5C]/50 dark:text-[#E6F1F8]/40 text-sm font-medium leading-relaxed mb-8">
                            Provision an isolated workspace layer for your organization. Upload brand symbols, initialize directories, and deploy collaboration units.
                        </p>
                    </div>
                    <Link
                        to="/register"
                        className="font-mono-nav inline-flex items-center justify-center w-full py-3 px-4 rounded-lg border border-[#0E3A5C]/25 dark:border-[#4A9DC7]/30 text-[#0E3A5C] dark:text-[#E6F1F8] hover:bg-[#0E3A5C]/5 dark:hover:bg-[#4A9DC7]/10 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer text-center"
                    >
                        Register Workspace
                    </Link>
                </div>

            </div>

            {/* Footer readout, matches bearing-tag style from dashboard cards */}
            <span className="relative mt-16 font-mono-nav text-[9px] font-medium tracking-[0.25em] text-[#0E3A5C]/35 dark:text-[#4A9DC7]/35 uppercase select-none">
                Secure Corporate Provisioning · v1.0.0
            </span>
        </div>
    );
};