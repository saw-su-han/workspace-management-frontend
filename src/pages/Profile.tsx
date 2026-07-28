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
    const { mutate: handleLogoutServer, isPending: isLoggingOut } = useLogout();

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

    const executeLogoutPipeline = () => {
        handleLogoutServer(undefined, {
            onSuccess: () => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            },
            onError: () => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        });
    };

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
                    <p className="font-display text-base font-bold tracking-tight text-gray-900 dark:text-white">Loading profile</p>
                    <p className="font-mono-nav text-[10px] text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-[0.25em]">Please wait…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 flex flex-col antialiased relative overflow-x-hidden font-sans">
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

            {/* HEADER - RESPONSIVE MOBILE & DESKTOP */}
            <header className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth="1" strokeDasharray="0.5 7" />
                        </svg>
                        <div className="relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30">
                            <span className="text-sm text-white font-bold">≈</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight text-gray-900 dark:text-white">Workspace</h1>
                        <p className="font-mono-nav text-[9px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase -mt-0.5">Profile Settings</p>
                    </div>
                </div>

                {/* DESKTOP NAV LINKS (CORRECTLY POSITIONED ON LEFT-MIDDLE OF HEADER) */}
                <div className="hidden md:flex items-center gap-2 mr-auto ml-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="font-mono-nav text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <span>←</span> Back to Dashboard
                    </button>
                </div>

                {/* CONTROLS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <ThemeToggle />

                    <button
                        onClick={executeLogoutPipeline}
                        disabled={isLoggingOut}
                        className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>

                    <UserAvatar
                        userProfile={userProfile}
                        className="h-9 w-9 rounded-full object-cover border-2 border-emerald-600/50 shadow-sm"
                    />
                </div>

                {/* MOBILE CONTROLS */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="font-mono-nav text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                    >
                        Dashboard
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA (COMPACT SIZING) */}
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                {/* HERO PROFILE CARD (COMPACT) */}
                <div className="relative rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-lg overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 relative z-10">
                        {/* Avatar Picker Container */}
                        <div className="relative group/avatar flex-shrink-0">
                            <UserAvatar
                                userProfile={userProfile}
                                previewUrl={localAvatarPreview}
                                className="h-20 w-20 rounded-xl object-cover border-2 border-emerald-600/40 shadow-md"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-950 shadow transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                                title="Change avatar"
                            >
                                {isUpdating ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="text-[10px] font-bold">📷</span>
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
                        <div className="space-y-1.5 text-center sm:text-left flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="font-display font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                                    {userProfile?.name || 'Workspace User'}
                                </h2>
                                <span className="inline-flex items-center gap-1.5 self-center sm:self-auto font-mono-nav text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Account
                                </span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {userProfile?.email || 'No email associated'}
                            </p>
                            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                                <span className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500">
                                    ID: <span className="text-gray-700 dark:text-gray-300 font-bold">#{userProfile?.id || 'N/A'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {avatarError && (
                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium font-mono-nav flex items-center gap-2">
                            <span>⚠️</span> {avatarError}
                        </div>
                    )}
                </div>

                {/* PERSONAL INFORMATION SETTINGS CARD (COMPACT) */}
                <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-lg backdrop-blur-xl space-y-5">
                    <div>
                        <h3 className="font-display font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
                            Personal Information
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Update your display name across all active workspaces.
                        </p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="block font-mono-nav text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="font-sans w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all disabled:opacity-50"
                                placeholder="Enter your name"
                                disabled={isUpdating}
                            />
                            {nameError && (
                                <p className="font-mono-nav text-xs font-bold text-rose-600 dark:text-rose-400 pt-1 flex items-center gap-1.5">
                                    <span>⚠️</span> {nameError}
                                </p>
                            )}
                            {nameSuccess && (
                                <p className="font-mono-nav text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1.5">
                                    <span>✓</span> Changes saved successfully!
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                onClick={handleNameSave}
                                disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                className="font-mono-nav px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
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