import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../hooks/useAuth";
import { FileField } from "../Components/FileField";
import { Input } from "../Components/Input";
import { registerSchema, type RegisterInput } from "../schema/auth.schema";
import { ThemeToggle } from "../Components/ThemeToggle";

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

export const Register = () => {
    const [avatar, setAvatar] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const registerMutation = useRegister();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", workspaceName: "" } as any,
    });

    const onSubmit = (values: any) => {
        const data = new FormData();
        data.append("name", values.name || "");
        data.append("email", values.email || "");
        data.append("password", values.password || "");

        if (values.workspaceName && values.workspaceName.trim() !== "") {
            data.append("workspaceName", values.workspaceName.trim());
        }

        if (avatar) data.append("avatar", avatar);
        if (logo) data.append("logo", logo);

        registerMutation.mutate(data);
    };

    const onValidationError = (formErrors: any) => {
        console.error("🚨 Form validation blocked submission:", formErrors);
    };

    useEffect(() => {
        if (registerMutation.isSuccess) {
            const timer = setTimeout(() => navigate("/login"), 2000);
            return () => clearTimeout(timer);
        }
    }, [registerMutation.isSuccess, navigate]);

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

            {/* TOP NAVIGATION BAR */}
            <header className="relative w-full max-w-5xl flex items-center justify-between py-3.5 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm z-30 mb-8">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/20">
                        <span className="font-display text-sm font-bold text-white">≈</span>
                    </div>
                    <span className="font-display font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                        ProjectHive
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/"
                        className="font-mono-nav text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        to="/login"
                        className="font-mono-nav rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        Sign In
                    </Link>
                    <ThemeToggle />
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
                <div className="md:hidden w-full max-w-5xl border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3 shadow-xl z-30 mb-6 rounded-2xl">
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="font-mono-nav w-full py-2.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold uppercase tracking-wider"
                        >
                            Home
                        </Link>
                        <Link
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="font-mono-nav w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider text-center shadow-md shadow-emerald-500/20"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA MATCHING HOME & LOGIN ARCHITECTURE */}
            <div className="relative my-auto flex flex-col items-center max-w-xl w-full z-10 py-6">

                {/* Hero / Header Intro */}
                <div className="relative max-w-lg text-center mb-8 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Workspace Provisioning Portal
                    </div>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
                        Establish Your Team Workspace
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Configure organizational credentials, upload brand assets, and launch your pipelines.
                    </p>
                </div>

                {/* Styled Register Card Container */}
                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                    {registerMutation.isSuccess && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 text-center tracking-wide font-mono-nav">
                            Workspace created! Redirecting to login...
                        </div>
                    )}
                    {registerMutation.isError && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 text-center tracking-wide font-mono-nav">
                            {(registerMutation.error as any).response?.data?.message || "Registration failed"}
                        </div>
                    )}

                    <form className="space-y-4 relative z-10" onSubmit={handleSubmit(onSubmit, onValidationError)}>
                        <Input label="Your Name" type="text" placeholder="Alex Carter" error={errors.name?.message} {...register("name")} />
                        <Input label="Work Email" type="email" placeholder="alex@company.com" error={errors.email?.message} {...register("email")} />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 8 chars, 1 uppercase, 1 number"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <Input label="Workspace Name" type="text" placeholder="Acme Labs" error={errors.workspaceName?.message} {...register("workspaceName")} />

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <FileField label="User Avatar" onChange={setAvatar} />
                            <FileField label="Brand Logo" onChange={setLogo} />
                        </div>

                        <button
                            type="submit"
                            disabled={registerMutation.isPending || registerMutation.isSuccess}
                            className="font-mono-nav w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98] disabled:opacity-50 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                        >
                            {registerMutation.isPending ? "Creating Space..." : "Register Workspace →"}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-5 text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10">
                        <span>
                            Have an active account?{" "}
                            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold underline underline-offset-4 hover:opacity-80 transition-opacity">
                                Log in
                            </Link>
                        </span>
                        <Link to="/" className="font-mono-nav text-[11px] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 flex items-center gap-1 transition-colors mt-1">
                            ← Return to Home Overview
                        </Link>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <span className="relative font-mono-nav text-[9px] font-semibold tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase select-none my-4">
                Secure Corporate Provisioning · v1.0.0
            </span>
        </div>
    );
};