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
            <div className="flex h-screen w-full items-center justify-center bg-[#f3f6f9] dark:bg-[#0b121f] text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl animate-spin text-cyan-500 font-sans">⟳</span>
                    Resolving workspace metrics...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070d19] text-slate-900 dark:text-slate-100 transition-colors duration-200">

            <header className="w-full bg-white dark:bg-[#0b121f] border-b border-slate-200/80 dark:border-slate-800/60 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {workspaceInfo?.workspaceLogo ? (
                            <img
                                src={workspaceInfo.workspaceLogo}
                                alt="Workspace Logo"
                                className="w-8 h-8 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-black text-sm flex items-center justify-center">
                                {workspaceInfo?.workspaceName?.charAt(0).toUpperCase() || 'W'}
                            </div>
                        )}
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                                {workspaceInfo?.workspaceName || 'Workspace'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">Workspace Context Environment</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111c30] transition-colors"
                        >
                            Overview
                        </button>
                        <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            Invite Member
                        </span>
                    </nav>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 md:p-8">
                <div className="bg-white dark:bg-[#0b121f] border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 shadow-sm">

                    <div className="border-b border-slate-100 dark:border-slate-800/60 pb-5 mb-6">
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Invite a Team Member
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Send an invitation email to join <span className="text-cyan-600 dark:text-cyan-400 font-bold">{workspaceInfo?.workspaceName}</span>
                        </p>
                    </div>

                    {feedbackMsg && (
                        <div className={`p-3 rounded-xl border text-xs font-semibold mb-6 ${feedbackMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                            }`}>
                            {feedbackMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="teammate@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e1726] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Assign Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['MEMBER', 'ADMIN'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`p-3 text-center border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${role === r
                                            ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 font-bold'
                                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 text-xs'
                                            }`}
                                    >
                                        <span className="text-[11px] font-extrabold tracking-wide">{r}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
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