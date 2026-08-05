// src/pages/ProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { useProfile, useUpdateProfile } from '../hooks/useAuth';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: userProfile, isLoading } = useProfile();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    //const { mutate: handleLogoutServer, isPending: isLoggingOut } = useLogout();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [nameDraft, setNameDraft] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    // Dynamic state management for local avatar image preview
    const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);

    // Invalidate and sync layout data when visiting page boundary
    useEffect(() => {
        if (location.pathname === '/profile') {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    }, [location.pathname, queryClient]);

    // Keep state values in absolute synchronization with backend profile load events
    useEffect(() => {
        if (userProfile?.name) {
            setNameDraft(userProfile.name);
        }
    }, [userProfile?.name]);

    // Cleanup object urls to avoid layout memory leaks
    useEffect(() => {
        return () => {
            if (localAvatarPreview) {
                URL.revokeObjectURL(localAvatarPreview);
            }
        };
    }, [localAvatarPreview]);

    // const executeLogoutPipeline = () => {
    //     handleLogoutServer(undefined, {
    //         onSuccess: () => {
    //             localStorage.removeItem("token");
    //             window.location.href = "/login";
    //         },
    //         onError: () => {
    //             localStorage.removeItem("token");
    //             window.location.href = "/login";
    //         }
    //     });
    // };

    // --- FILE SELECTION INTERCEPT HANDLER -------------------------------------
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        const previewUrl = URL.createObjectURL(file);
        setLocalAvatarPreview(previewUrl);

        const formData = new FormData();
        formData.append("avatar", file);

        updateProfile(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['user'] });
                queryClient.invalidateQueries({ queryKey: ['auth'] });

                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: (err: any) => {
                setLocalAvatarPreview(null);
                setAvatarError(
                    err?.response?.data?.message || "Couldn't upload avatar. Please try again."
                );
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const handleNameSave = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = nameDraft.trim();
        if (!trimmed) {
            setNameError("Name can't be empty.");
            return;
        }
        if (trimmed === userProfile?.name) return;

        setNameError(null);
        setNameSuccess(false);

        const formData = new FormData();
        formData.append("name", trimmed);

        updateProfile(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['user'] });
                queryClient.invalidateQueries({ queryKey: ['auth'] });

                setNameSuccess(true);
                setTimeout(() => setNameSuccess(false), 3000);
            },
            onError: (err: any) => {
                setNameError(err?.response?.data?.message || "Couldn't update name.");
            },
        });
    };

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-slate-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.04)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-600 dark:text-mint-400" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-mint-600 dark:fill-mint-400" />
                    </svg>
                    <div className="relative inline-flex rounded-2xl h-10 w-10 bg-mint-500/10 dark:bg-mint-500/5 items-center justify-center">
                        <Icon icon="lucide:user" className="w-5 h-5 text-mint-600 dark:text-mint-400" />
                    </div>
                </div>
                <div className="space-y-1 text-center relative px-4">
                    <p className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">Loading profile</p>
                    <p className="font-mono-nav text-[10px] text-mint-600/70 dark:text-mint-400/60 uppercase tracking-[0.25em]">Please wait…</p>
                </div>
            </div>
        );
    }

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

            {/* HEADER - RESPONSIVE MOBILE & DESKTOP */}
            <header className="h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-mint-500/10 dark:bg-mint-500/5 flex items-center justify-center">
                        <Icon icon="lucide:user-cog" className="w-5 h-5 text-mint-600 dark:text-mint-400" />
                    </div>
                    <div>
                        <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight text-slate-900 dark:text-white">Workspace</h1>
                        <p className="font-mono-nav text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.25em] uppercase -mt-0.5">Profile Settings</p>
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

                {/* PROFILE CARD */}
                <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden space-y-6">
                    {/* Decorative top accent glow border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-mint-500 via-teal-500 to-mint-400 opacity-80" />

                    {/* Header/Banner Info */}
                    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6 flex flex-col sm:flex-row items-center gap-5">
                        {/* Avatar Picker Container */}
                        <div className="relative group/avatar flex-shrink-0">
                            <UserAvatar
                                userProfile={userProfile}
                                previewUrl={localAvatarPreview}
                                className="h-20 w-20 rounded-2xl object-cover border-2 border-mint-500/30 shadow-xs"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-xl bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                                title="Change avatar"
                            >
                                {isUpdating ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Icon icon="lucide:camera" className="w-3.5 h-3.5" />
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                                    {userProfile?.name || 'Workspace User'}
                                </h2>
                                <span className="inline-flex items-center gap-1.5 self-center sm:self-auto font-mono-nav text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-mint-500/10 text-mint-700 dark:text-mint-400 border border-mint-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse" />
                                    Active Account
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {userProfile?.email || 'No email associated'}
                            </p>
                            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                                <span className="font-mono-nav text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <Icon icon="lucide:id-card" className="w-3 h-3 text-mint-600 dark:text-mint-400" />
                                    ID: <span className="text-slate-700 dark:text-slate-300 font-bold">#{userProfile?.id || 'N/A'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {avatarError && (
                        <div className="font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">
                            <span className="text-sm">⚠️</span> {avatarError}
                        </div>
                    )}

                    {nameSuccess && (
                        <div className="font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs bg-mint-500/10 text-mint-700 dark:text-mint-400 border-mint-500/20">
                            <span className="text-sm">✓</span> Changes saved successfully!
                        </div>
                    )}

                    {nameError && (
                        <div className="font-mono-nav p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">
                            <span className="text-sm">⚠️</span> {nameError}
                        </div>
                    )}

                    {/* FORM INPUT SECTION */}
                    <form onSubmit={handleNameSave} className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Icon icon="lucide:user" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                                Display Name
                            </label>
                            <input
                                type="text"
                                required
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                placeholder="Enter your name"
                                disabled={isUpdating}
                                className="font-sans w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 focus:outline-none transition-all shadow-xs disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Icon icon="lucide:mail" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                                Registered Email Address
                            </label>
                            <input
                                type="email"
                                disabled
                                value={userProfile?.email || ''}
                                className="font-sans w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 px-4 py-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed opacity-75"
                            />
                        </div>

                        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
                            <button
                                type="submit"
                                disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                className="font-mono-nav px-6 py-3 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-mint-500/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                                <Icon icon="lucide:check" className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

            </main>
        </div>
    );
};