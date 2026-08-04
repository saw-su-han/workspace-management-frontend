// src/pages/ChangePasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../hooks/useAuth';
import { Icon } from "@iconify/react";
import { ThemeToggle } from '../Components/ThemeToggle';

type FieldErrors = {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

export const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { mutate: changePassword, isPending } = useChangePassword();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errors, setErrors] = useState<FieldErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    const passwordChecks = {
        length: newPassword.length >= 8,
        upperLower: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
        number: /\d/.test(newPassword),
        symbol: /[^A-Za-z0-9]/.test(newPassword),
    };
    const isNewPasswordStrong = Object.values(passwordChecks).every(Boolean);

    const validate = (): boolean => {
        const nextErrors: FieldErrors = {};

        if (!currentPassword) {
            nextErrors.currentPassword = "Enter your current password.";
        }
        if (!newPassword) {
            nextErrors.newPassword = "Enter a new password.";
        } else if (!isNewPasswordStrong) {
            nextErrors.newPassword = "Password doesn't meet requirements.";
        } else if (newPassword === currentPassword) {
            nextErrors.newPassword = "New password must be different from current password.";
        }
        if (!confirmPassword) {
            nextErrors.confirmPassword = "Confirm your new password.";
        } else if (confirmPassword !== newPassword) {
            nextErrors.confirmPassword = "Passwords don't match.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setServerError(null);

        if (!validate()) return;

        changePassword(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setSuccessMessage("Your password has been updated.");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setErrors({});
                },
                onError: (error: any) => {
                    setServerError(
                        error?.response?.data?.message || "Couldn't update your password. Please try again."
                    );
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 flex flex-col antialiased relative overflow-x-hidden font-sans">
            <FontFaces />

            {/* Subtle grid pattern background */}
            <div
                className="absolute inset-0 opacity-[0.3] dark:opacity-[0.12] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            />
            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-500/10 dark:bg-mint-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/10 dark:bg-teal-600/5 blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-mint-500/10 dark:bg-mint-500/5 flex items-center justify-center">
                        <Icon icon="lucide:shield-check" className="w-5 h-5 text-mint-600 dark:text-mint-400" />
                    </div>
                    <div>
                        <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight text-slate-900 dark:text-white">Workspace</h1>
                        <p className="font-mono-nav text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.25em] uppercase -mt-0.5">Account Security</p>
                    </div>
                </div>

                {/* DESKTOP NAV LINKS */}
                <div className="hidden md:flex items-center gap-2 mr-auto ml-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="font-mono-nav text-xs font-bold px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-mint-500/40 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                {/* CONTROLS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <ThemeToggle />
                </div>

                {/* MOBILE CONTROLS */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="font-mono-nav text-xs font-bold px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                    >
                        Dashboard
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                {/* CARD WRAPPER */}
                <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden space-y-6">
                    {/* Decorative top accent glow border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-mint-500 via-teal-500 to-mint-400 opacity-80" />

                    {/* Section Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
                        <div className="w-12 h-12 rounded-2xl bg-mint-500/10 dark:bg-mint-500/5 flex items-center justify-center mb-3">
                            <Icon icon="lucide:key-round" className="w-6 h-6 text-mint-600 dark:text-mint-400" />
                        </div>
                        <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                            Change Password
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Choose a strong, unique password to secure your account workspace.
                        </p>
                    </div>

                    {/* Feedback Banners */}
                    {successMessage && (
                        <div className="font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs bg-mint-500/10 text-mint-700 dark:text-mint-400 border-mint-500/20">
                            <span className="text-sm">✓</span> {successMessage}
                        </div>
                    )}

                    {serverError && (
                        <div className="font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">
                            <span className="text-sm">⚠️</span> {serverError}
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* CURRENT PASSWORD */}
                        <div className="flex flex-col gap-2">
                            <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Icon icon="lucide:lock" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                    className={`font-sans w-full rounded-2xl border bg-slate-50/80 dark:bg-slate-950/80 pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.currentPassword
                                        ? 'border-rose-500 dark:border-rose-500/80 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-mint-600 dark:hover:text-mint-400 transition-colors cursor-pointer"
                                >
                                    <Icon icon={showCurrent ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="font-mono-nav text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                                    <span>⚠️</span> {errors.currentPassword}
                                </p>
                            )}
                        </div>

                        {/* NEW PASSWORD */}
                        <div className="flex flex-col gap-2">
                            <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Icon icon="lucide:key" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    className={`font-sans w-full rounded-2xl border bg-slate-50/80 dark:bg-slate-950/80 pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.newPassword
                                        ? 'border-rose-500 dark:border-rose-500/80 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-mint-600 dark:hover:text-mint-400 transition-colors cursor-pointer"
                                >
                                    <Icon icon={showNew ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="font-mono-nav text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                                    <span>⚠️</span> {errors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="flex flex-col gap-2">
                            <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                    className={`font-sans w-full rounded-2xl border bg-slate-50/80 dark:bg-slate-950/80 pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.confirmPassword
                                        ? 'border-rose-500 dark:border-rose-500/80 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-mint-600 dark:hover:text-mint-400 transition-colors cursor-pointer"
                                >
                                    <Icon icon={showConfirm ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="font-mono-nav text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                                    <span>⚠️</span> {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* BUTTON ACTIONS */}
                        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="font-mono-nav px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="font-mono-nav px-6 py-3 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-mint-500/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span>{isPending ? 'Updating...' : 'Update Password'}</span>
                                <Icon icon="lucide:check" className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};