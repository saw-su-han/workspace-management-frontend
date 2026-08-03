import { useState, useEffect } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useResetPassword } from "../hooks/useAuth";

import { Input } from "../Components/Input";

import { resetPasswordSchema, type ResetPasswordInput } from "../schema/auth.schema";

import { ThemeToggle } from "../Components/ThemeToggle";

import { Icon } from "@iconify/react";



export const ResetPassword = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const { email = "", code = "" } = (location.state as { email?: string; code?: string }) || {};

    const resetPasswordMutation = useResetPassword();

    const [customError, setCustomError] = useState<string | null>(null);

    const [successMsg, setSuccessMsg] = useState<string | null>(null);



    // If someone lands here directly without going through Verify Code, bounce them back.

    useEffect(() => {

        if (!email || !code) {

            navigate("/forgot-password", { replace: true });

        }

    }, [email, code, navigate]);



    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({

        resolver: zodResolver(resetPasswordSchema),

        defaultValues: { email, code, newPassword: "", confirmPassword: "" },

    });



    const onSubmit = (values: ResetPasswordInput) => {

        setCustomError(null);

        resetPasswordMutation.mutate(values, {

            onSuccess: () => {

                setSuccessMsg("Password reset. Redirecting you to login...");

                setTimeout(() => navigate("/login", { replace: true }), 1500);

            },

            onError: (err: any) => {

                setCustomError(err?.response?.data?.message || "Couldn't reset password. Please try again.");

            },

        });

    };



    return (

        <div className="relative flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-gray-950 px-4 py-6 text-gray-900 dark:text-gray-50 transition-colors duration-300 overflow-x-hidden font-sans">

            <style>{`

                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

                body { font-family: 'Plus Jakarta Sans', sans-serif; }

                .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }

                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }

            `}</style>



            <div

                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"

                style={{

                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',

                    backgroundSize: '32px 32px'

                }}

            />

            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />

            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-600/5 blur-[160px] rounded-full pointer-events-none" />



            <div className="fixed top-0 left-0 right-0 w-full z-50 px-4 pt-4">

                <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-3 px-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-black/[0.02]">

                    <Link to="/" className="flex items-center gap-3 group">

                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">

                            <Icon icon="lucide:hexagon" className="w-6 h-6 animate-[spin_10s_linear_infinite]" />

                            <Icon icon="lucide:cpu" className="absolute w-3.5 h-3.5 text-white" />

                            <div className="absolute -inset-0.5 bg-emerald-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>

                        </div>

                        <span className="font-display font-bold text-xl text-gray-950 dark:text-white tracking-tight flex items-center gap-1.5">

                            Project<span className="text-emerald-600 dark:text-emerald-400">Hive</span>

                        </span>

                    </Link>

                    <ThemeToggle />

                </header>

            </div>



            <div className="relative my-auto flex flex-col items-center max-w-xl w-full z-10 pt-32 pb-24">

                <div className="relative max-w-lg text-center mb-8 space-y-3">

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">

                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />

                        Code Verified

                    </div>

                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">

                        Create New Password

                    </h1>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">

                        Set a new password for{" "}

                        <span className="font-bold text-gray-900 dark:text-white">{email}</span>.

                    </p>

                </div>



                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">

                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />



                    {customError && (

                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 text-center tracking-wide font-mono-nav">

                            ⚠️ {customError}

                        </div>

                    )}

                    {successMsg && (

                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center tracking-wide font-mono-nav">

                            ✓ {successMsg}

                        </div>

                    )}



                    <form className="space-y-4 relative z-10" onSubmit={handleSubmit(onSubmit)}>

                        {/* email + code are carried silently via defaultValues from route state */}

                        <Input

                            label="New Password"

                            type="password"

                            placeholder="Enter new password"

                            error={errors.newPassword?.message}

                            {...register("newPassword")}

                        />

                        <Input

                            label="Confirm Password"

                            type="password"

                            placeholder="Re-enter new password"

                            error={errors.confirmPassword?.message}

                            {...register("confirmPassword")}

                        />



                        <button

                            type="submit"

                            disabled={resetPasswordMutation.isPending}

                            className="font-mono-nav w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98] disabled:opacity-50 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"

                        >

                            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password →"}

                        </button>

                    </form>



                    <div className="mt-2 flex flex-col items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-5 text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10">

                        <Link to="/login" className="font-mono-nav text-[11px] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 flex items-center gap-1 transition-colors">

                            ← Back to Login

                        </Link>

                    </div>

                </div>

            </div>



            <footer className="w-full max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="flex items-center gap-2">

                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-xs font-bold shadow-sm">

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