import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useInviteUser, useWorkspaceInfo } from '../hooks/useAuth';
import { AsideNav } from '../Components/Asidenav';
import { ThemeToggle } from '../Components/ThemeToggle';

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
            <div className="flex min-h-screen w-full bg-slate-50 dark:bg-gray-950 font-sans">
                <AsideNav workspaceId={wId} />
                <div className="flex-1 flex h-screen flex-col items-center justify-center gap-6 transition-colors duration-300 relative overflow-hidden">
                    <FontFaces />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.04)_0%,_transparent_60%)]" />

                    <div className="relative flex h-24 w-24 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-30 dark:opacity-50" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-500" strokeWidth="1" strokeDasharray="2 6" />
                            <path d="M50 4 L56 46 L50 52 L44 46 Z" className="fill-emerald-500" />
                        </svg>
                        <div className="relative inline-flex rounded-2xl h-12 w-12 bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/20 items-center justify-center">
                            <span className="text-white text-base font-black">✦</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 text-center relative px-4">
                        <p className="font-display text-sm font-bold tracking-tight text-gray-800 dark:text-gray-100">Resolving workspace</p>
                        <p className="font-mono-nav text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Synchronizing data…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-50/60 dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={wId} />
            <div className="relative flex-1 bg-transparent text-gray-900 dark:text-gray-50 flex flex-col transition-colors duration-300 antialiased overflow-x-hidden">
                <FontFaces />

                {/* Subtle grid pattern background */}
                <div
                    className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.2) 1px, transparent 0)',
                        backgroundSize: '36px 36px'
                    }}
                />
                {/* Atmospheric Background Glows */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-teal-600/10 dark:bg-teal-600/5 blur-[180px] rounded-full pointer-events-none" />

                {/* HEADER / NAVIGATION BAR */}
                <header className="h-18 md:h-20 border-b border-slate-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                        {workspaceInfo?.workspaceLogo ? (
                            <img
                                src={workspaceInfo.workspaceLogo}
                                alt="Workspace Logo"
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-sm flex-shrink-0"
                            />
                        ) : (
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 flex-shrink-0">
                                <span className="text-sm text-white font-extrabold">
                                    {workspaceInfo?.workspaceName?.charAt(0).toUpperCase() || 'W'}
                                </span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="font-display font-extrabold text-sm md:text-base text-gray-900 dark:text-white tracking-tight truncate">
                                {workspaceInfo?.workspaceName || 'Workspace'}
                            </h2>
                            <p className="font-mono-nav text-[9px] font-semibold text-slate-400 dark:text-gray-500 tracking-[0.2em] uppercase -mt-0.5">
                                Context Environment
                            </p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2.5 font-mono-nav text-xs font-bold">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="hidden sm:flex px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900/80 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-800 hover:border-emerald-500/50 shadow-sm transition-all cursor-pointer items-center gap-1.5"
                        >
                            <Icon icon="solar:folder-bold-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Overview
                        </button>
                        <span className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                            <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
                            <span className="hidden xs:inline">Invite Member</span>
                        </span>
                    </nav>
                </header>

                {/* MAIN FORM CARD */}
                <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 relative z-10 flex flex-col justify-center">
                    <div className="relative rounded-3xl bg-white/90 dark:bg-gray-900/70 border border-slate-200/80 dark:border-gray-800 p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl overflow-hidden space-y-6">

                        {/* Decorative top accent glow border */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-80" />

                        {/* Ticket Notches */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 shadow-inner" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 shadow-inner" />

                        <div className="border-b border-slate-100 dark:border-gray-800/80 pb-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center mb-3">
                                <Icon icon="solar:letter-unread-bold-duotone" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight">
                                Invite Team Member
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                Send a secure invitation email to join{' '}
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {workspaceInfo?.workspaceName}
                                </span>
                            </p>
                        </div>

                        {feedbackMsg && (
                            <div
                                className={`font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-sm ${feedbackMsg.type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                                    }`}
                            >
                                <span className="text-sm">{feedbackMsg.type === 'success' ? '✓' : '⚠️'}</span> {feedbackMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Icon icon="solar:mailbox-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="teammate@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="font-sans w-full rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900/80 px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Icon icon="solar:shield-user-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Assign Permission Role
                                </label>
                                <div className="grid grid-cols-2 gap-3.5">
                                    {(['MEMBER', 'ADMIN'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`font-mono-nav p-4 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${role === r
                                                ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-emerald-500/5'
                                                : 'border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900/80 text-slate-500 dark:text-gray-400 hover:border-emerald-500/40'
                                                }`}
                                        >
                                            <Icon icon={r === 'ADMIN' ? 'solar:verified-check-bold-duotone' : 'solar:user-bold-duotone'} className="w-4 h-4" />
                                            <span className="text-xs font-extrabold tracking-wider">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100 dark:border-gray-800/80 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/workspaces/${wId}`)}
                                    className="font-mono-nav px-4.5 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteMutation.isPending}
                                    className="font-mono-nav px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <span>{inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}</span>
                                    <Icon icon="solar:plain-2-bold-duotone" className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}