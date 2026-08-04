// src/pages/ChangePasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../hooks/useAuth';
import { Icon } from "@iconify/react";

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
            nextErrors.newPassword = "Password doesn't meet the requirements below.";
        } else if (newPassword === currentPassword) {
            nextErrors.newPassword = "New password must be different from your current password.";
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

    const requirementRow = (met: boolean, label: string) => (
        <li className={`flex items-center gap-2 text-xs font-mono-nav transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
            <Icon icon={met ? "lucide:check-circle-2" : "lucide:circle"} className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
        </li>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 flex flex-col antialiased relative overflow-x-hidden font-sans">
            <FontFaces />

            {/* Background accents, consistent with the dashboard */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-600/5 blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    title="Back"
                >
                    <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight text-gray-900 dark:text-white">
                        Settings &amp; Privacy
                    </h1>
                    <p className="font-mono-nav text-[9px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase -mt-0.5">Change password</p>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-lg mx-auto p-4 sm:p-6 md:p-10 relative z-10">
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3">
                        <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
                        Account Security
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
                        Change your password
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                        Choose a strong password you're not using anywhere else.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 shadow-xl shadow-black/[0.02] backdrop-blur-xl space-y-6"
                >
                    {successMessage && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                            <Icon icon="lucide:check-circle-2" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}
                    {serverError && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 text-xs font-medium">
                            <Icon icon="lucide:alert-circle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    {/* CURRENT PASSWORD */}
                    <div>
                        <label className="font-mono-nav text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 block">
                            Current password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                <Icon icon="lucide:lock" className="w-4 h-4" />
                            </div>
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                                className={`font-mono-nav w-full pl-10 pr-11 py-3 text-xs bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner focus:ring-4 focus:ring-emerald-500/10 ${errors.currentPassword ? 'border-rose-400 dark:border-rose-700' : 'border-gray-200 dark:border-gray-800 focus:border-emerald-600'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                                <Icon icon={showCurrent ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                        <label className="font-mono-nav text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 block">
                            New password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                <Icon icon="lucide:key-round" className="w-4 h-4" />
                            </div>
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                className={`font-mono-nav w-full pl-10 pr-11 py-3 text-xs bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner focus:ring-4 focus:ring-emerald-500/10 ${errors.newPassword ? 'border-rose-400 dark:border-rose-700' : 'border-gray-200 dark:border-gray-800 focus:border-emerald-600'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                                <Icon icon={showNew ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">{errors.newPassword}</p>
                        )}

                        {/* Password requirement checklist */}
                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
                            {requirementRow(passwordChecks.length, "At least 8 characters")}
                            {requirementRow(passwordChecks.upperLower, "Upper & lowercase letters")}
                            {requirementRow(passwordChecks.number, "At least one number")}
                            {requirementRow(passwordChecks.symbol, "At least one symbol")}
                        </ul>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                        <label className="font-mono-nav text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 block">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                <Icon icon="lucide:key-round" className="w-4 h-4" />
                            </div>
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                className={`font-mono-nav w-full pl-10 pr-11 py-3 text-xs bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner focus:ring-4 focus:ring-emerald-500/10 ${errors.confirmPassword ? 'border-rose-400 dark:border-rose-700' : 'border-gray-200 dark:border-gray-800 focus:border-emerald-600'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                                <Icon icon={showConfirm ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="font-mono-nav px-5 py-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="font-mono-nav inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                    <span>Updating…</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="lucide:check" className="w-4 h-4" />
                                    <span>Update password</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};