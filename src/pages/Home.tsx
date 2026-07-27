import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../Components/ThemeToggle";

export const Home = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-mint-50 dark:bg-mint-950 px-4 py-6 text-mint-900 dark:text-mint-50 transition-colors duration-300 overflow-x-hidden font-sans">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Chart-paper depth lines */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(3,48,39,0.05) 0px, rgba(3,48,39,0.05) 1px, transparent 1px, transparent 32px)',
                }}
            />

            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-300/20 dark:bg-mint-500/10 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-400/15 dark:bg-mint-600/10 blur-[160px] rounded-full pointer-events-none" />

            {/* TOP NAVIGATION BAR */}
            <header className="relative w-full max-w-5xl flex items-center justify-between py-3 px-4 rounded-xl border border-mint-900/10 dark:border-mint-300/15 bg-white/60 dark:bg-mint-900/30 backdrop-blur-md z-30 mb-8">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-mint-900 to-mint-600 dark:from-mint-600 dark:to-mint-400 shadow-md">
                        <span className="font-display text-sm font-semibold text-mint-50 dark:text-mint-950">≈</span>
                    </div>
                    <span className="font-display font-bold text-lg text-mint-900 dark:text-mint-50">ProjectHive</span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    <Link
                        to="/login"
                        className="font-mono-nav text-xs font-semibold text-mint-900/70 dark:text-mint-100/70 hover:text-mint-900 dark:hover:text-mint-300 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="font-mono-nav rounded-lg bg-mint-900 dark:bg-mint-400 text-mint-50 dark:text-mint-950 px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:opacity-90"
                    >
                        Register Workspace
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="relative my-auto flex flex-col items-center max-w-3xl w-full z-10 py-6">

                {/* Introduction Hero Section */}
                <div className="relative max-w-2xl text-center mb-12">
                    <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-700 dark:text-mint-400" strokeWidth="0.75" strokeDasharray="0.5 7" />
                            <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-mint-700 dark:fill-mint-400" />
                        </svg>
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-mint-900 to-mint-600 shadow-lg shadow-mint-500/20 ring-1 ring-mint-700/30">
                            <span className="font-display text-xl font-semibold text-mint-50">≈</span>
                        </div>
                    </div>

                    <p className="font-mono-nav text-[10px] font-medium text-mint-800/60 dark:text-mint-300/70 tracking-[0.3em] uppercase mb-3">
                        Control Deck · Overview
                    </p>

                    <h1 className="font-display font-semibold text-4xl leading-[1.1] tracking-tight text-mint-900 dark:text-mint-50 sm:text-5xl">
                        Where engineering teams <br />
                        <span className="italic text-mint-700 dark:text-mint-300">collaborate fluently.</span>
                    </h1>
                    <p className="mt-4 text-sm sm:text-base text-mint-900/60 dark:text-mint-100/60 max-w-md mx-auto font-medium leading-relaxed">
                        A premium operational environment designed to coordinate structures, build timelines, and track systemic project pipelines.
                    </p>
                </div>

                {/* Information Cards (No Action Buttons) */}
                <div className="relative grid w-full grid-cols-1 gap-6 sm:grid-cols-2">

                    {/* Info Card A: Returning Members Overview */}
                    <div className="group relative border border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-900/40 backdrop-blur-md p-8 rounded-xl shadow-sm hover:border-mint-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />

                        <div>
                            <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-mint-700 dark:text-mint-300 uppercase mb-3">
                                Member Information
                            </div>
                            <h2 className="font-display font-semibold text-xl text-mint-900 dark:text-mint-50 mb-2">
                                Existing Workspaces
                            </h2>
                            <p className="text-mint-900/60 dark:text-mint-100/50 text-xs font-medium leading-relaxed mb-6">
                                Returning users can access ongoing project boards, active communication logs, task assignees, and real-time team notifications via secure profile authentication.
                            </p>
                        </div>

                        {/* Read-only Information Badge */}
                        <div className="font-mono-nav flex items-center justify-between w-full py-2.5 px-3.5 rounded-lg bg-mint-900/5 dark:bg-mint-300/10 border border-mint-900/10 dark:border-mint-300/15 text-[11px] font-semibold text-mint-900 dark:text-mint-200">
                            <span>Access Mode</span>
                            <span className="text-mint-700 dark:text-mint-300 font-bold">Encrypted Credentials</span>
                        </div>
                    </div>

                    {/* Info Card B: Deploy Architecture Overview */}
                    <div className="group relative border border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-900/40 backdrop-blur-md p-8 rounded-xl shadow-sm hover:border-mint-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-mint-50 dark:bg-mint-950 border border-mint-900/10 dark:border-mint-300/15" />

                        <div>
                            <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-mint-800/60 dark:text-mint-200/50 uppercase mb-3">
                                Provisioning Information
                            </div>
                            <h2 className="font-display font-semibold text-xl text-mint-900 dark:text-mint-50 mb-2">
                                Workspace Provisioning
                            </h2>
                            <p className="text-mint-900/60 dark:text-mint-100/50 text-xs font-medium leading-relaxed mb-6">
                                Organization leads can deploy isolated team environments, upload custom brand assets, invite collaborators with specific roles, and assign tasks across channels.
                            </p>
                        </div>

                        {/* Read-only Information Badge */}
                        <div className="font-mono-nav flex items-center justify-between w-full py-2.5 px-3.5 rounded-lg bg-mint-900/5 dark:bg-mint-300/10 border border-mint-900/10 dark:border-mint-300/15 text-[11px] font-semibold text-mint-900 dark:text-mint-200">
                            <span>Deployment</span>
                            <span className="text-mint-700 dark:text-mint-300 font-bold">Multi-Tenant Setup</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer readout */}
            <span className="relative font-mono-nav text-[9px] font-medium tracking-[0.25em] text-mint-900/40 dark:text-mint-400/40 uppercase select-none my-4">
                Secure Corporate Provisioning · v1.0.0
            </span>
        </div>
    );
};