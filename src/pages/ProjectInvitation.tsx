// src/pages/InviteMemberPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInviteUser, useWorkspaceInfo } from '../hooks/useAuth';

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

export function InviteMember() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const wId = Number(workspaceId);

    const { data: workspaceInfo, isLoading: loadingInfo } = useWorkspaceInfo(wId);
    const inviteMutation = useInviteUser(wId);

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setFeedbackMsg({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        setFeedbackMsg(null);

        inviteMutation.mutate(
            { email, role },
            {
                onSuccess: () => {
                    setFeedbackMsg({ type: 'success', text: `Invitation sent to ${email}!` });
                    setEmail('');
                    setRole('MEMBER');
                },
                onError: (err: any) => {
                    setFeedbackMsg({
                        type: 'error',
                        text: err?.response?.data?.message || 'Failed to send invitation.',
                    });
                },
            }
        );
    };

    if (loadingInfo) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-gray-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.04)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-emerald-600 dark:fill-emerald-400" />
                    </svg>
                    <div className="relative inline-flex rounded-full h-9 w-9 bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30 items-center justify-center">
                        <span className="text-white text-sm font-bold">≈</span>
                    </div>
                </div>
                <div className="space-y-1 text-center relative px-4">
                    <p className="font-display text-base font-bold tracking-tight text-gray-900 dark:text-white">Resolving workspace</p>
                    <p className="font-mono-nav text-[10px] text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-[0.25em]">Please wait…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col transition-colors duration-300 antialiased overflow-x-hidden font-sans">
            <FontFaces />

            {/* Subtle grid pattern background */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            />
            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 dark:bg-emerald-600/5 blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER / NAVIGATION BAR */}
            <header className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
                <div className="flex items-center gap-3.5">
                    {workspaceInfo?.workspaceLogo ? (
                        <img
                            src={workspaceInfo.workspaceLogo}
                            alt="Workspace Logo"
                            className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-600/40"
                        />
                    ) : (
                        <div className="relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30">
                            <span className="text-sm text-white font-bold">
                                {workspaceInfo?.workspaceName?.charAt(0).toUpperCase() || 'W'}
                            </span>
                        </div>
                    )}
                    <div>
                        <h2 className="font-display font-extrabold text-sm md:text-base text-gray-900 dark:text-white tracking-tight">
                            {workspaceInfo?.workspaceName || 'Workspace'}
                        </h2>
                        <p className="font-mono-nav text-[9px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase -mt-0.5">
                            Workspace Context Environment
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-2 font-mono-nav text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => navigate(`/workspaces/${wId}`)}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 transition-all cursor-pointer"
                    >
                        Overview
                    </button>
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Invite Member
                    </span>
                </nav>
            </header>

            {/* MAIN FORM CARD */}
            <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 relative z-10">
                <div className="relative rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 md:p-8 shadow-lg backdrop-blur-xl overflow-hidden space-y-6">
                    {/* Ticket Notches */}
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800" />
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800" />

                    <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h1 className="font-display font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                            Invite Team Member
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Send an invitation email to join{' '}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {workspaceInfo?.workspaceName}
                            </span>
                        </p>
                    </div>

                    {feedbackMsg && (
                        <div
                            className={`font-mono-nav p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${feedbackMsg.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                }`}
                        >
                            <span>{feedbackMsg.type === 'success' ? '✓' : '⚠️'}</span> {feedbackMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono-nav text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="teammate@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="font-sans w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono-nav text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Assign Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['MEMBER', 'ADMIN'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`font-mono-nav p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${role === r
                                            ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                                            : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs'
                                            }`}
                                    >
                                        <span className="text-xs font-bold tracking-wide">{r}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="font-mono-nav px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="font-mono-nav px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                            >
                                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation ✉️'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}