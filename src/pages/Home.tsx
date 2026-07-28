import { Link } from "react-router-dom";
import { ThemeToggle } from "../Components/ThemeToggle";

export const Home = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-gray-950 px-4 py-6 text-gray-900 dark:text-gray-50 transition-colors duration-300 overflow-x-hidden font-sans">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Subtle grid pattern background */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-600/5 blur-[160px] rounded-full pointer-events-none" />

            {/* TOP NAVIGATION BAR */}
            <header className="relative w-full max-w-6xl flex items-center justify-between py-3.5 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm z-30 mb-8">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/20">
                        <span className="font-display text-sm font-bold text-white">≈</span>
                    </div>
                    <span className="font-display font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">ProjectHive</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 font-mono-nav text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
                    <a href="#architecture" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Architecture</a>
                    <a href="#security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Security</a>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="font-mono-nav text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="font-mono-nav rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        Register Workspace
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="relative flex flex-col items-center max-w-5xl w-full z-10 py-6 space-y-24">

                {/* HERO SECTION */}
                <div className="relative max-w-3xl text-center space-y-6 pt-4">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 animate-pulse" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25">
                            <span className="font-display text-xl font-bold text-white">≈</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Next-Gen Engineering Control Deck
                    </div>

                    <h1 className="font-display font-extrabold text-4xl leading-[1.12] tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                        Where engineering teams <br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">collaborate fluently.</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
                        A premium operational environment designed to coordinate structures, build timelines, and track systemic project pipelines in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto font-mono-nav rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] text-center"
                        >
                            Get Started Free →
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto font-mono-nav rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all text-center"
                        >
                            Sign In to Account
                        </Link>
                    </div>
                </div>

                {/* LIVE METRICS / STATS BAR */}
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl">
                    <div className="space-y-1 text-center md:text-left p-2">
                        <p className="font-mono-nav text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">99.99%</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Uptime Reliability</p>
                    </div>
                    <div className="space-y-1 text-center md:text-left p-2">
                        <p className="font-mono-nav text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 12ms</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Global Response Time</p>
                    </div>
                    <div className="space-y-1 text-center md:text-left p-2">
                        <p className="font-mono-nav text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">50K+</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Workspaces</p>
                    </div>
                    <div className="space-y-1 text-center md:text-left p-2">
                        <p className="font-mono-nav text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">256-bit</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Encrypted Pipelines</p>
                    </div>
                </div>

                {/* CORE FEATURES GRID */}
                <div id="features" className="w-full space-y-12">
                    <div className="text-center space-y-3">
                        <span className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">
                            Platform Architecture
                        </span>
                        <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
                            Engineered for high-velocity teams
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                            Everything you need to scale enterprise workflows securely across distributed time zones.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl shadow-sm hover:border-emerald-500/50 transition-all space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                                01
                            </div>
                            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Multi-Tenant Isolation</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Safely segregate organization structures with isolated environments, granular permission matrices, and custom workspace branding.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl shadow-sm hover:border-emerald-500/50 transition-all space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                                02
                            </div>
                            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Real-Time Sync Pipelines</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Monitor task allocations, communication logs, and continuous deployment triggers instantly without refreshing your dashboard.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl shadow-sm hover:border-emerald-500/50 transition-all space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                                03
                            </div>
                            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Role-Based Authorizations</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                Assign explicit ownership, administrative access, or standard membership tiers to ensure absolute security across all endpoints.
                            </p>
                        </div>
                    </div>
                </div>

                {/* INFORMATION CARDS (Member & Provisioning Details) */}
                <div id="architecture" className="relative grid w-full grid-cols-1 gap-6 sm:grid-cols-2">

                    {/* Info Card A: Returning Members Overview */}
                    <div className="group relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase mb-3">
                                Member Information
                            </div>
                            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
                                Existing Workspaces
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed mb-6">
                                Returning users can access ongoing project boards, active communication logs, task assignees, and real-time team notifications via secure profile authentication.
                            </p>
                        </div>

                        {/* Information Badge */}
                        <div className="font-mono-nav flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            <span>Access Mode</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Encrypted Credentials</span>
                        </div>
                    </div>

                    {/* Info Card B: Deploy Architecture Overview */}
                    <div className="group relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase mb-3">
                                Provisioning Information
                            </div>
                            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
                                Workspace Provisioning
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed mb-6">
                                Organization leads can deploy isolated team environments, upload custom brand assets, invite collaborators with specific roles, and assign tasks across channels.
                            </p>
                        </div>

                        {/* Information Badge */}
                        <div className="font-mono-nav flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            <span>Deployment</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Multi-Tenant Setup</span>
                        </div>
                    </div>

                </div>

                {/* SECURITY CALLOUT BANNER */}
                <div id="security" className="w-full rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-500/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="space-y-3 relative z-10 max-w-xl text-center md:text-left">
                        <span className="font-mono-nav text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-200">
                            Enterprise Security
                        </span>
                        <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                            Ready to secure your corporate workflow?
                        </h2>
                        <p className="text-emerald-100/80 text-xs sm:text-sm font-medium leading-relaxed">
                            Deploy your team workspace today with absolute data sovereignty, continuous logging, and robust administrative control panels.
                        </p>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                        <Link
                            to="/register"
                            className="font-mono-nav inline-flex items-center justify-center rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 px-6 py-4 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg active:scale-[0.98]"
                        >
                            Register Workspace →
                        </Link>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-6xl border-t border-gray-200 dark:border-gray-800 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left z-10">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">≈</div>
                    <span className="font-display font-bold text-sm text-gray-900 dark:text-white">ProjectHive</span>
                </div>
                <div className="font-mono-nav text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Secure Corporate Provisioning · v1.0.0
                </div>
            </footer>
        </div>
    );
};