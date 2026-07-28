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
            <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.04)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.03)_0%,_transparent_60%)]" />

                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-ping" />
                    <div className="relative inline-flex rounded-2xl h-12 w-12 bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/20 items-center justify-center text-white font-bold">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
                <div className="space-y-1 text-center relative">
                    <p className="font-display text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">Loading Profile</p>
                    <p className="font-mono-nav text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Synchronizing state...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 flex flex-col antialiased relative overflow-hidden font-sans">
            <FontFaces />

            {/* Clean, Modern Background Gradients */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* MODERN FLOATING HEADER */}
            <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 sticky top-0 z-40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white font-bold text-sm">
                            ◆
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            Workspace
                        </button>
                    </div>

                    <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />

                    <nav className="flex items-center gap-1.5">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-mono-nav text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Dashboard
                        </button>
                        <button
                            className="font-mono-nav text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 cursor-default"
                        >
                            Profile
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="pl-3 border-l border-slate-200 dark:border-slate-800">
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* MODERN CARD CONTAINER LAYOUT */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 relative z-10 space-y-6">

                {/* Hero Profile Banner */}
                <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        {/* Avatar Picker Container */}
                        <div className="relative group/avatar">
                            <UserAvatar
                                userProfile={userProfile}
                                previewUrl={localAvatarPreview}
                                className="h-28 w-28 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-lg transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                                title="Change avatar"
                            >
                                {isUpdating ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="text-xs font-bold">📷</span>
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
                        <div className="space-y-2 text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                                    {userProfile?.name || 'Workspace User'}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 self-center sm:self-auto font-mono-nav text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Account
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {userProfile?.email || 'No email associated'}
                            </p>
                            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                                <span className="font-mono-nav text-[11px] text-slate-400 dark:text-slate-500">
                                    ID: <span className="text-slate-700 dark:text-slate-300 font-medium">{userProfile?.id || 'N/A'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {avatarError && (
                        <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium font-mono-nav flex items-center gap-2">
                            <span>⚠️</span> {avatarError}
                        </div>
                    )}
                </div>

                {/* Main Settings Panel */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl space-y-6">
                    <div>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                            Personal Information
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Update your display name and personal preferences.
                        </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-5">
                        <div className="space-y-2">
                            <label className="block font-mono-nav text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="font-sans w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all disabled:opacity-50"
                                placeholder="Enter your name"
                                disabled={isUpdating}
                            />
                            {nameError && (
                                <p className="font-mono-nav text-xs font-medium text-rose-600 dark:text-rose-400 pt-1 flex items-center gap-1.5">
                                    <span>⚠️</span> {nameError}
                                </p>
                            )}
                            {nameSuccess && (
                                <p className="font-mono-nav text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1.5">
                                    <span>✓</span> Changes saved successfully!
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleNameSave}
                                disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                className="font-mono-nav px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};