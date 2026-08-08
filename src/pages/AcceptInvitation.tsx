import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAcceptInvitation } from "../hooks/useAuth";
import { ThemeToggle } from "../Components/ThemeToggle";
import { Icon } from "@iconify/react";

export function AcceptInvitation() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useAcceptInvitation(token);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!data) return;

        if (!data.success && data.redirect === "/signup") {
            navigate(`/signup-invitation/${token}?email=${encodeURIComponent(data.email || "")}`);
        } else if (data.success) {
            navigate("/login");
        }
    }, [data, token, navigate]);

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
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-600/5 blur-[160px] rounded-full pointer-events-none" />

            {/* TOP NAVIGATION BAR - FIXED */}
            <div className="fixed top-0 left-0 right-0 w-full z-50 px-4 pt-4">
                <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-3 px-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-black/[0.02]">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint-600 to-teal-700 text-white shadow-lg shadow-mint-600/20 transition-transform group-hover:scale-105">
                            <Icon icon="lucide:hexagon" className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                            <Icon icon="lucide:cpu" className="absolute w-3.5 h-3.5 text-white" />
                            <div className="absolute -inset-0.5 bg-mint-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                        </div>
                        <span className="font-display font-bold text-xl text-gray-950 dark:text-white tracking-tight flex items-center gap-1.5">
                            Project<span className="text-mint-600 dark:text-mint-400">Hive</span>
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <nav className="hidden md:flex items-center gap-1.5 font-mono-nav text-xs font-medium bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {['Workflow', 'Features', 'Architecture', 'Security'].map(item => (
                            <Link key={item} to={`/#${item.toLowerCase()}`} className="px-4 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:text-mint-600 dark:hover:text-mint-400 transition-all">
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login" className="font-mono-nav rounded-xl bg-mint-600 hover:bg-mint-500 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98]">
                            Log In
                        </Link>
                    </div>

                    {/* MOBILE NAV TOGGLE */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </header>

                {/* MOBILE DROPDOWN MENU */}
                {isMobileMenuOpen && (
                    <div className="md:hidden w-full max-w-7xl mx-auto mt-2 border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 space-y-3 shadow-2xl rounded-2xl">
                        <div className="flex flex-col gap-1.5">
                            {['Workflow', 'Features', 'Architecture', 'Security'].map(item => (
                                <Link
                                    key={item}
                                    to={`/#${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-mono-nav w-full py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold uppercase tracking-wider"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="font-mono-nav w-full mt-2 py-3 px-4 rounded-xl bg-mint-600 hover:bg-mint-500 text-white text-xs font-bold uppercase tracking-wider text-center shadow-md block"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative my-auto flex flex-col items-center max-w-xl w-full z-10 pt-32 pb-24">

                {/* Hero / Header Intro */}
                <div className="relative max-w-lg text-center mb-8 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-500/10 dark:bg-mint-950/60 border border-mint-500/20 font-mono-nav text-[10px] font-bold text-mint-600 dark:text-mint-400 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-mint-500 animate-ping" />
                        Secure Authentication Gateway
                    </div>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
                        {isError ? "Invitation Link Invalid" : "Verifying Your Invitation"}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {isError
                            ? "We couldn't confirm this invitation link."
                            : "Hang tight while we confirm your workspace access."}
                    </p>
                </div>

                {/* Styled Status Card Container */}
                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-mint-500/5 rounded-full blur-2xl pointer-events-none" />

                    {isLoading && (
                        <div className="flex flex-col items-center gap-4 py-6 relative z-10">
                            <div className="w-10 h-10 rounded-full border-2 border-mint-500/20 border-t-mint-500 animate-spin" />
                            <span className="font-mono-nav text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                                Verifying...
                            </span>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center gap-3 py-2 text-center relative z-10">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xl">
                                ✕
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium max-w-xs">
                                {(error as any)?.response?.data?.message || "This invitation link is invalid or has expired."}
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <div className="flex flex-col items-center gap-4 py-6 relative z-10">
                            <div className="w-10 h-10 rounded-full border-2 border-mint-500/20 border-t-mint-500 animate-spin" />
                            <span className="font-mono-nav text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                                Redirecting...
                            </span>
                        </div>
                    )}

                    <div className="mt-2 flex flex-col items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-5 text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10">
                        <Link to="/" className="font-mono-nav text-[11px] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 flex items-center gap-1 transition-colors">
                            ← Return to Home Overview
                        </Link>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <footer className="w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-mint-600 to-teal-700 text-white text-xs font-bold shadow-sm">
                        <Icon icon="lucide:hexagon" className="w-4 h-4" />
                    </div>
                    <span className="font-display font-bold text-sm text-gray-900 dark:text-white">ProjectHive</span>
                </div>
                <div className="font-mono-nav text-xs text-gray-500">
                    Secure Corporate Provisioning · v1.3.0
                </div>
            </footer>
        </div>
    );
}