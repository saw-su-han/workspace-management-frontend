// src/pages/InviteMemberPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInviteUser, useWorkspaceInfo } from '../hooks/useAuth';

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
            <div className="relative flex h-screen flex-col items-center justify-center bg-[#DCEAF5] dark:bg-[#051C2E] text-[#0E3A5C] dark:text-[#E6F1F8] transition-colors duration-300 font-sans overflow-hidden">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                    .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
                `}</style>
                <div className="w-10 h-10 rounded-full border-2 border-[#1E5F87] dark:border-[#4A9DC7] border-t-transparent animate-spin mb-3" />
                <span className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#0E3A5C]/60 dark:text-[#4A9DC7]/70 uppercase animate-pulse">
                    Resolving Workspace Metrics...
                </span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#DCEAF5] dark:bg-[#051C2E] text-[#0E3A5C] dark:text-[#E6F1F8] flex flex-col transition-colors duration-300 font-sans overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Background Chart Paper Grid & Atmosphere */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(14,58,92,0.035) 0px, rgba(14,58,92,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A9DC7]/[0.08] blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER / NAVIGATION BAR */}
            <header className="border-b border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/75 dark:bg-[#0A2E4A]/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
                <div className="flex items-center gap-3">
                    {workspaceInfo?.workspaceLogo ? (
                        <img
                            src={workspaceInfo.workspaceLogo}
                            alt="Workspace Logo"
                            className="w-8 h-8 rounded-lg object-cover border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0E3A5C] dark:bg-[#4A9DC7] text-white dark:text-[#051C2E] font-bold text-xs flex items-center justify-center">
                            {workspaceInfo?.workspaceName?.charAt(0).toUpperCase() || 'W'}
                        </div>
                    )}
                    <div>
                        <h2 className="font-display font-semibold text-sm text-[#0E3A5C] dark:text-[#E6F1F8]">
                            {workspaceInfo?.workspaceName || 'Workspace'}
                        </h2>
                        <p className="font-mono-nav text-[9px] uppercase tracking-wider text-[#1E5F87] dark:text-[#4A9DC7]">
                            Workspace Context Environment
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-2 font-mono-nav text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => navigate(`/workspaces/${wId}`)}
                        className="px-3.5 py-1.5 rounded-lg text-[#0E3A5C]/60 dark:text-[#E6F1F8]/60 hover:text-[#0E3A5C] dark:hover:text-[#E6F1F8] transition-colors cursor-pointer"
                    >
                        Overview
                    </button>
                    <span className="px-3 py-1.5 rounded-lg bg-[#0E3A5C]/10 dark:bg-[#4A9DC7]/20 text-[#1E5F87] dark:text-[#4A9DC7]">
                        Invite Member
                    </span>
                </nav>
            </header>

            {/* MAIN FORM CARD */}
            <main className="flex-1 max-w-xl w-full mx-auto p-6 md:p-8 relative z-10">
                <div className="relative border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/75 dark:bg-[#0A2E4A]/50 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden space-y-6">
                    {/* Ticket Notches */}
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                    <div className="border-b border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15 pb-4">
                        <h1 className="font-display font-semibold text-xl text-[#0E3A5C] dark:text-[#E6F1F8]">
                            Invite Team Member
                        </h1>
                        <p className="text-xs text-[#0E3A5C]/60 dark:text-[#E6F1F8]/60 mt-0.5">
                            Send an invitation email to join{' '}
                            <span className="font-bold text-[#1E5F87] dark:text-[#4A9DC7]">
                                {workspaceInfo?.workspaceName}
                            </span>
                        </p>
                    </div>

                    {feedbackMsg && (
                        <div
                            className={`font-mono-nav p-3 rounded-xl border text-xs font-semibold ${feedbackMsg.type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                }`}
                        >
                            {feedbackMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-[#1E5F87] dark:text-[#4A9DC7]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="teammate@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#051C2E] border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 rounded-lg text-xs text-[#0E3A5C] dark:text-[#E6F1F8] outline-none focus:border-[#4A9DC7] transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-[#1E5F87] dark:text-[#4A9DC7]">
                                Assign Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['MEMBER', 'ADMIN'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`font-mono-nav p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${role === r
                                                ? 'border-[#4A9DC7] bg-white dark:bg-[#051C2E] text-[#1E5F87] dark:text-[#4A9DC7] font-bold shadow-sm'
                                                : 'border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 bg-white/40 dark:bg-[#051C2E]/30 text-[#0E3A5C]/60 dark:text-[#E6F1F8]/60 text-xs'
                                            }`}
                                    >
                                        <span className="text-xs font-bold tracking-wide">{r}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="font-mono-nav px-4 py-2 text-xs font-bold text-[#0E3A5C]/60 hover:text-[#0E3A5C] dark:text-[#E6F1F8]/60 dark:hover:text-[#E6F1F8] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="font-mono-nav px-5 py-2 bg-[#0E3A5C] dark:bg-[#4A9DC7] text-[#DCEAF5] dark:text-[#051C2E] text-xs font-bold uppercase rounded-lg shadow-md hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 disabled:opacity-40 transition-all cursor-pointer"
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