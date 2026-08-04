import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useVerifyEmail } from "../hooks/useAuth";
import { ThemeToggle } from "../Components/ThemeToggle";
import { Icon } from "@iconify/react";

export const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const verifyMutation = useVerifyEmail();

    // email passed from Register page via navigate state
    const emailFromState = (location.state as { email?: string } | null)?.email ?? "";
    const [email] = useState(emailFromState);
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect back to register if someone lands here without an email (e.g. refresh)
    useEffect(() => {
        if (!emailFromState) {
            navigate("/register");
        }
    }, [emailFromState, navigate]);

    useEffect(() => {
        if (verifyMutation.isSuccess) {
            const timer = setTimeout(() => navigate("/login"), 1500);
            return () => clearTimeout(timer);
        }
    }, [verifyMutation.isSuccess, navigate]);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return; // digits only, max 1 char

        const next = [...code];
        next[index] = value;
        setCode(next);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        const next = Array(6).fill("");
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setCode(next);
        inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;
        verifyMutation.mutate({ email, code: fullCode });
    };

    const handleResend = () => {
        // Wire this to your resend-code endpoint / mutation if you have one
        console.log("Resend code for", email);
    };

    const isComplete = code.every((d) => d !== "");

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
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-500/10 dark:bg-mint-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-600/10 dark:bg-mint-600/5 blur-[160px] rounded-full pointer-events-none" />

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

                    <nav className="hidden md:flex items-center gap-1.5 font-code text-xs font-medium bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {['Workflow', 'Features', 'Architecture', 'Security'].map(item => (
                            <Link key={item} to={`/#${item.toLowerCase()}`} className="px-4 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:text-mint-600 dark:hover:text-mint-400 transition-all">
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login" className="font-code text-xs font-bold uppercase tracking-wider bg-gray-950 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-950 px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]">
                            Sign In
                        </Link>
                    </div>

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

                {isMobileMenuOpen && (
                    <div className="md:hidden w-full max-w-7xl mx-auto mt-2 border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 space-y-2 shadow-2xl rounded-2xl">
                        <div className="flex flex-col gap-1.5">
                            {['Workflow', 'Features', 'Architecture', 'Security'].map(item => (
                                <Link
                                    key={item}
                                    to={`/#${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-code w-full py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold uppercase tracking-wider"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="font-code w-full mt-2 py-3 px-4 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-xs font-bold uppercase tracking-wider text-center shadow-md"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="relative my-auto flex flex-col items-center max-w-md w-full z-10 pt-32 pb-24">

                <div className="relative max-w-lg text-center mb-8 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-500/10 dark:bg-mint-950/60 border border-mint-500/20 font-mono-nav text-[10px] font-bold text-mint-600 dark:text-mint-400 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-mint-500 animate-ping" />
                        Identity Confirmation
                    </div>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
                        Verify Your Email
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Enter the 6-digit code sent to{" "}
                        <span className="font-bold text-gray-900 dark:text-gray-100">{email || "your email"}</span>
                    </p>
                </div>

                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-mint-500/5 rounded-full blur-2xl pointer-events-none" />

                    {verifyMutation.isSuccess && (
                        <div className="rounded-xl bg-mint-500/10 border border-mint-500/20 p-3 text-xs font-semibold text-mint-700 dark:text-mint-400 text-center tracking-wide font-mono-nav">
                            Email verified! Redirecting to login...
                        </div>
                    )}
                    {verifyMutation.isError && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 text-center tracking-wide font-mono-nav">
                            {(verifyMutation.error as any).response?.data?.message || "Invalid or expired code"}
                        </div>
                    )}

                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputsRef.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    className="w-full aspect-square text-center text-xl font-bold font-mono-nav rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={!isComplete || verifyMutation.isPending || verifyMutation.isSuccess}
                            className="font-mono-nav w-full rounded-xl bg-mint-600 hover:bg-mint-500 text-white active:scale-[0.98] disabled:opacity-50 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-mint-600/20 cursor-pointer"
                        >
                            {verifyMutation.isPending ? "Verifying..." : "Verify Email →"}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-5 text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10">
                        <span>
                            Didn't get a code?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-mint-600 dark:text-mint-400 font-bold underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                Resend code
                            </button>
                        </span>
                        <Link to="/register" className="font-mono-nav text-[11px] text-gray-400 hover:text-mint-600 dark:text-gray-500 dark:hover:text-mint-400 flex items-center gap-1 transition-colors mt-1">
                            ← Back to Registration
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
                <div className="font-code text-xs text-gray-500">
                    Secure Corporate Provisioning · v1.3.0
                </div>
            </footer>
        </div>
    );
};