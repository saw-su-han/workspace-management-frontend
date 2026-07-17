import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSignupWithInvitation } from '../hooks/useAuth';

export function SignupInvitation() {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const signupMutation = useSignupWithInvitation();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setFeedbackMsg({ type: 'error', text: 'Missing invitation token.' });
            return;
        }
        if (!name.trim() || password.length < 6) {
            setFeedbackMsg({ type: 'error', text: 'Please enter your name and a password (min 6 characters).' });
            return;
        }

        setFeedbackMsg(null);

        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("password", password);
        if (avatarFile) fd.append("avatar", avatarFile);

        signupMutation.mutate(
            { token, formData: fd },
            {
                onSuccess: () => {
                    navigate("/dashboard");
                },
                onError: (err: any) => {
                    setFeedbackMsg({
                        type: 'error',
                        text: err?.response?.data?.message || 'Could not complete signup.',
                    });
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#070d19] p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#0b121f] border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-1">
                    Finish setting up your account
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    You've been invited to join a workspace
                    {email && <> as <span className="font-bold text-cyan-600 dark:text-cyan-400">{email}</span></>}
                </p>

                {feedbackMsg && (
                    <div className="p-3 rounded-xl border text-xs font-semibold mb-5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-500/20">
                        {feedbackMsg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e1726] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0e1726] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Avatar (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                            className="text-xs text-slate-500 dark:text-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={signupMutation.isPending}
                        className="w-full py-2.5 mt-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                    >
                        {signupMutation.isPending ? 'Setting up account...' : 'Complete Signup'}
                    </button>
                </form>
            </div>
        </div>
    );
}