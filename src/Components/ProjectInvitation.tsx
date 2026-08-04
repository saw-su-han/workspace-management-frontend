import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useInviteUser } from '../hooks/useAuth';

interface InviteMemberPanelProps {
    workspaceId: number;
    workspaceName?: string;
}

export const InviteMember: React.FC<InviteMemberPanelProps> = ({ workspaceId, workspaceName }) => {
    const inviteMutation = useInviteUser(workspaceId);

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

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden space-y-6">
                {/* Decorative top accent glow border */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-mint-500 via-teal-500 to-mint-400 opacity-80" />

                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-mint-500/10 dark:bg-mint-500/5 flex items-center justify-center mb-3">
                        <Icon icon="lucide:mail-plus" className="w-6 h-6 text-mint-600 dark:text-mint-400" />
                    </div>
                    <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                        Invite Team Member
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Send a secure invitation email to join{' '}
                        <span className="font-bold text-mint-600 dark:text-mint-400">
                            {workspaceName || 'this workspace'}
                        </span>
                    </p>
                </div>

                {feedbackMsg && (
                    <div
                        className={`font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs ${feedbackMsg.type === 'success'
                            ? 'bg-mint-500/10 text-mint-700 dark:text-mint-400 border-mint-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            }`}
                    >
                        <span className="text-sm">{feedbackMsg.type === 'success' ? '✓' : '⚠️'}</span> {feedbackMsg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="teammate@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="font-sans w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 focus:outline-none transition-all shadow-xs"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            Assign Permission Role
                        </label>
                        <div className="grid grid-cols-2 gap-3.5">
                            {(['MEMBER', 'ADMIN'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`font-mono-nav p-4 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${role === r
                                        ? 'border-mint-500 dark:border-mint-400 bg-mint-500/10 text-mint-700 dark:text-mint-400 font-bold'
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 hover:border-mint-500/40'
                                        }`}
                                >
                                    <Icon icon={r === 'ADMIN' ? 'lucide:shield-check' : 'lucide:user'} className="w-4 h-4" />
                                    <span className="text-xs font-extrabold tracking-wider">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={inviteMutation.isPending}
                            className="font-mono-nav px-6 py-3 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-mint-500/20 transition-all cursor-pointer flex items-center gap-2"
                        >
                            <span>{inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}</span>
                            <Icon icon="lucide:send" className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};