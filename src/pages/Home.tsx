// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-[#eef3f8] via-[#f4f7fa] to-[#e7eff7] dark:from-[#080d17] dark:via-[#0b121f] dark:to-[#0f192b] px-4 py-16 transition-colors duration-200">

            {/* Introduction Hero Section */}
            <div className="max-w-2xl text-center mb-16 animate-ocean">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-sans text-2xl font-bold shadow-sm shadow-sky-100 dark:shadow-none">
                    ≈
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    Where engineering teams <br />
                    <span className="text-sky-600 dark:text-sky-400">collaborate fluently.</span>
                </h1>
                <p className="mt-4 text-base text-slate-400 dark:text-slate-500 max-w-md mx-auto font-medium">
                    A premium operational environment designed to coordinate structures, build timelines, and track systemic project pipelines.
                </p>
            </div>

            {/* Dynamic Path Selectors */}
            <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 animate-ocean">

                {/* Path A: Access Existing Space */}
                <div className="group relative border border-white dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 p-8 rounded-2xl shadow-[0_20px_40px_-15px_rgba(148,163,184,0.15)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-sky-500/30 dark:hover:border-sky-400/20">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-2">
                            Returning Members
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Enter Workspace
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Authenticate your account keys to log directly back into your team's custom channels, ongoing task logs, and active operational boards.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-sm font-semibold tracking-wide shadow-md shadow-sky-600/10 transition-all cursor-pointer text-center"
                    >
                        Sign In to Workspace
                    </Link>
                </div>

                {/* Path B: Deploy New Architecture */}
                <div className="group relative border border-white dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 p-8 rounded-2xl shadow-[0_20px_40px_-15px_rgba(148,163,184,0.15)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-sky-500/30 dark:hover:border-sky-400/20">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                            New Environments
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Create New Space
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Provision an isolated workspace layer for your organization. Upload brand symbols, initialize directories, and deploy collaboration units.
                        </p>
                    </div>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100 text-sm font-semibold tracking-wide transition-all cursor-pointer text-center shadow-sm"
                    >
                        Register Workspace
                    </Link>
                </div>

            </div>

            {/* Premium Tiny Footer Accent */}
            <span className="mt-16 text-[10px] font-bold tracking-widest text-slate-300 dark:text-slate-700 uppercase select-none">
                Secure Corporate Provisioning v1.0.0
            </span>
        </div>
    );
};