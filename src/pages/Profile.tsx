// src/pages/ProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile, useUpdateProfile, useLogout } from '../hooks/useAuth';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: userProfile, isLoading } = useProfile();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    useLogout();

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

    // --- FILE SELECTION INTERCEPT HANDLER -------------------------------------
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        // Instantly generate localized browser view injection 
        const previewUrl = URL.createObjectURL(file);
        setLocalAvatarPreview(previewUrl);

        const formData = new FormData();
        formData.append("avatar", file);

        updateProfile(formData, {
            onSuccess: () => {
                // Wipe cache references everywhere to trigger app-wide synchronization
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['user'] });
                queryClient.invalidateQueries({ queryKey: ['auth'] });

                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: (err: any) => {
                setLocalAvatarPreview(null); // Remove mock view if request rejected
                setAvatarError(
                    err?.response?.data?.message || "Couldn't upload avatar. Please try again."
                );
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const handleNameSave = () => {
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
                setTimeout(() => setNameSuccess(false), 2000);
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
            <div className="flex h-screen flex-col items-center justify-center bg-mint-50 dark:bg-mint-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(3,48,39,0.06)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(11,238,194,0.05)_0%,_transparent_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-700 dark:text-mint-400" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-mint-700 dark:fill-mint-400" />
                    </svg>
                    <div className="relative inline-flex rounded-full h-9 w-9 bg-gradient-to-tr from-mint-900 to-mint-600 shadow-lg shadow-mint-500/30 items-center justify-center">
                        <span className="text-mint-50 text-sm font-bold">≈</span>
                    </div>
                </div>
                <div className="space-y-1 text-center relative">
                    <p className="font-display text-base font-bold tracking-tight text-mint-900 dark:text-mint-50">Charting your profile state</p>
                    <p className="font-mono-nav text-[10px] text-mint-800/50 dark:text-mint-300/60 uppercase tracking-[0.25em]">Reading account data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mint-50 dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300 flex flex-col antialiased relative overflow-hidden font-sans">
            <FontFaces />

            {/* Chart-paper texture / depth lines */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(3,48,39,0.035) 0px, rgba(3,48,39,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-300/20 dark:bg-mint-500/10 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-400/15 dark:bg-mint-600/10 blur-[160px] rounded-full pointer-events-none" />

            {/* JIRA-STYLE GLOBAL NAVIGATION HEADER */}
            <header className="flex h-14 items-center justify-between border-b border-mint-900/10 dark:border-mint-300/15 bg-mint-50/90 dark:bg-mint-950/90 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40 transition-colors">
                <div className="flex items-center gap-6">
                    {/* Jira-style Branding & Home/Dashboard Nav */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-mint-900 to-mint-600 shadow-sm shadow-mint-500/20">
                            <span className="text-xs text-mint-50 font-bold">≈</span>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-display font-bold text-sm tracking-tight text-mint-900 dark:text-mint-50 hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                            <span>Home</span>
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-mint-900/15 dark:bg-mint-300/20" />

                    {/* Jira-style Section Tabs */}
                    <nav className="flex items-center gap-1">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-mono-nav text-xs font-semibold px-3 py-1.5 rounded-lg text-mint-800/70 dark:text-mint-300/70 hover:bg-mint-900/5 dark:hover:bg-mint-300/10 transition-colors cursor-pointer"
                        >
                            Dashboard
                        </button>
                        <button
                            className="font-mono-nav text-xs font-semibold px-3 py-1.5 rounded-lg bg-mint-900/10 dark:bg-mint-300/15 text-mint-900 dark:text-mint-50 cursor-default"
                        >
                            Profile
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="flex items-center pl-2 border-l border-mint-900/10 dark:border-mint-300/15">
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-8 w-8 rounded-full object-cover border border-mint-700/40 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* JIRA-STYLE PROFILE LAYOUT */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 relative z-10 space-y-8">

                {/* Profile Header Banner */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 p-6 md:p-8 shadow-sm backdrop-blur-md overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mint-600 via-emerald-500 to-mint-400" />

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar Picker Container */}
                        <div className="relative group/avatar">
                            <UserAvatar
                                userProfile={userProfile}
                                previewUrl={localAvatarPreview}
                                className="h-24 w-24 rounded-full object-cover border-2 border-mint-900/20 dark:border-mint-300/30 shadow-md"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-mint-900 dark:bg-mint-400 text-mint-50 dark:text-mint-950 flex items-center justify-center border-2 border-white dark:border-mint-950 shadow-md transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                                title="Change avatar"
                            >
                                {isUpdating ? (
                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="text-xs">📷</span>
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

                        {/* User Details */}
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="font-display font-extrabold text-2xl text-mint-900 dark:text-mint-50 tracking-tight">
                                    {userProfile?.name || 'Atlassian User'}
                                </h1>
                                <span className="font-mono-nav text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs font-medium text-mint-900/60 dark:text-mint-100/60">
                                {userProfile?.email || 'No email associated'}
                            </p>
                            <p className="font-mono-nav text-[10px] text-mint-800/40 dark:text-mint-300/50 pt-1">
                                ACCOUNT ID: <span className="text-mint-900 dark:text-mint-200">{userProfile?.id || 'N/A'}</span>
                            </p>
                        </div>
                    </div>

                    {avatarError && (
                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold font-mono-nav">
                            ⚠️ {avatarError}
                        </div>
                    )}
                </div>

                {/* Jira-style Settings Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column: Navigation / Menu Side Panel */}
                    <div className="md:col-span-1 space-y-2">
                        <div className="p-4 rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 shadow-sm backdrop-blur-md">
                            <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-mint-800/50 dark:text-mint-300/50 mb-3 px-2">
                                Profile Settings
                            </h3>
                            <div className="space-y-1">
                                <button className="w-full text-left font-mono-nav text-xs font-bold px-3 py-2 rounded-xl bg-mint-900/10 dark:bg-mint-300/15 text-mint-900 dark:text-mint-50">
                                    Personal Details
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full text-left font-mono-nav text-xs font-semibold px-3 py-2 rounded-xl text-mint-800/70 dark:text-mint-300/70 hover:bg-mint-900/5 dark:hover:bg-mint-300/10 transition-colors"
                                >
                                    Workspaces & Access
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editable Details Panel */}
                    <div className="md:col-span-2">
                        <div className="rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 p-6 md:p-8 shadow-sm backdrop-blur-md space-y-6">
                            <div>
                                <h3 className="font-display font-bold text-base text-mint-900 dark:text-mint-50">
                                    About You
                                </h3>
                                <p className="text-xs text-mint-900/60 dark:text-mint-100/60 mt-0.5">
                                    Customize your public profile name visible across control decks and channels.
                                </p>
                            </div>

                            <div className="border-t border-mint-900/10 dark:border-mint-300/15 pt-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="block font-mono-nav text-[10px] font-bold tracking-wider uppercase text-mint-800/60 dark:text-mint-300/60">
                                        Public Name
                                    </label>
                                    <input
                                        type="text"
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="font-mono-nav w-full rounded-lg border border-mint-900/15 dark:border-mint-300/15 bg-white/50 dark:bg-mint-900/40 px-3.5 py-2.5 text-xs text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 transition-all focus:border-mint-600 focus:ring-4 focus:ring-mint-500/15 focus:outline-none disabled:opacity-50"
                                        placeholder="Enter your name"
                                        disabled={isUpdating}
                                    />
                                    {nameError && (
                                        <p className="font-mono-nav text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                            ⚠️ {nameError}
                                        </p>
                                    )}
                                    {nameSuccess && (
                                        <p className="font-mono-nav text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            ✓ Changes saved successfully!
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNameSave}
                                        disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                        className="font-mono-nav px-5 py-2.5 bg-mint-900 dark:bg-mint-400 text-mint-50 dark:text-mint-950 hover:bg-mint-800 dark:hover:bg-mint-300 active:scale-[0.99] disabled:opacity-40 text-[11px] font-bold uppercase tracking-wide rounded-lg shadow-md transition-all cursor-pointer"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};