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

    // --- WORKSPACE SWITCHER ---
    const allWorkspaces = userProfile?.workspaces || [];
    const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

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

    if (isLoading) {
        return (
            <div className="relative flex h-screen items-center justify-center bg-[#DCEAF5] dark:bg-[#051C2E] transition-colors duration-300 overflow-hidden font-sans">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                    .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                    .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
                `}</style>

                {/* Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(14,58,92,0.035) 0px, rgba(14,58,92,0.035) 1px, transparent 1px, transparent 32px)',
                    }}
                />

                <div className="relative flex flex-col items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-[#1E5F87] dark:border-[#4A9DC7] border-t-transparent animate-spin" />
                    <span className="font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#0E3A5C]/60 dark:text-[#4A9DC7]/70 uppercase">
                        Loading Deck...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#DCEAF5] dark:bg-[#051C2E] text-[#0E3A5C] dark:text-[#E6F1F8] flex flex-col transition-colors duration-300 overflow-hidden font-sans">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
                .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
            `}</style>

            {/* Background Atmosphere Layers */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(14,58,92,0.035) 0px, rgba(14,58,92,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A9DC7]/[0.08] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2E6F95]/[0.06] blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="border-b border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/75 dark:bg-[#0A2E4A]/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
                <div className="flex items-center gap-5">
                    {/* WORKSPACE SWITCHER DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setIsWorkspaceDropdownOpen((prev) => !prev)}
                            className="font-mono-nav group flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-[#051C2E]/60 border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 rounded-lg text-xs font-bold text-[#0E3A5C] dark:text-[#E6F1F8] shadow-sm transition-all hover:border-[#4A9DC7] hover:bg-white dark:hover:bg-[#051C2E] cursor-pointer"
                        >
                            Switch Workspace
                            <span className={`text-[9px] transition-transform duration-200 ${isWorkspaceDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {isWorkspaceDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceDropdownOpen(false)} />

                                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 dark:bg-[#0A2E4A]/95 border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md">
                                    <div className="max-h-64 overflow-y-auto divide-y divide-[#0E3A5C]/5 dark:divide-[#4A9DC7]/10">
                                        {allWorkspaces
                                            .filter((ws: any) => ws.isDeleted !== true)
                                            .map((ws: any) => {
                                                const wsInfo = ws.workspace || ws;
                                                return (
                                                    <button
                                                        key={wsInfo.id}
                                                        onClick={() => {
                                                            setIsWorkspaceDropdownOpen(false);
                                                            navigate(`/workspaces/${wsInfo.id}`);
                                                        }}
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold text-[#0E3A5C] dark:text-[#E6F1F8] hover:bg-[#0E3A5C]/5 dark:hover:bg-[#4A9DC7]/10 transition-colors cursor-pointer"
                                                    >
                                                        <div className="w-6 h-6 rounded bg-[#0E3A5C] dark:bg-[#4A9DC7] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white dark:text-[#051C2E]">
                                                            {wsInfo.name?.charAt(0).toUpperCase() || 'W'}
                                                        </div>
                                                        <span className="truncate flex-1">{wsInfo.name}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    <div className="border-t border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15">
                                        <button
                                            onClick={() => {
                                                setIsWorkspaceDropdownOpen(false);
                                                navigate('/dashboard');
                                            }}
                                            className="font-mono-nav w-full px-3.5 py-2.5 text-left text-[11px] font-bold text-[#1E5F87] dark:text-[#4A9DC7] hover:bg-[#0E3A5C]/5 dark:hover:bg-[#4A9DC7]/10 transition-colors cursor-pointer"
                                        >
                                            ← All Workspaces (Dashboard)
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <h1 className="font-display font-semibold text-lg text-[#0E3A5C] dark:text-[#E6F1F8]">
                        User Profile
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            {/* MAIN CONTENT CONTAINER */}
            <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-8 relative z-10 flex items-center justify-center">

                {/* Styled Auth / Settings Card */}
                <div className="group relative w-full border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/75 dark:bg-[#0A2E4A]/50 p-8 sm:p-10 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 overflow-hidden">

                    {/* Ticket Notch Details matching cards across app */}
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                    {/* Header Label */}
                    <div className="mb-6 font-mono-nav text-[10px] font-bold tracking-[0.2em] text-[#1E5F87] dark:text-[#4A9DC7] uppercase">
                        Account Overview · Personal Layer
                    </div>

                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <div className="relative group/avatar">
                            <div className="relative">
                                <UserAvatar
                                    userProfile={userProfile}
                                    previewUrl={localAvatarPreview}
                                    className="h-24 w-24 rounded-full object-cover border-2 border-[#0E3A5C]/20 dark:border-[#4A9DC7]/30 shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUpdating}
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#0E3A5C] dark:bg-[#4A9DC7] text-white dark:text-[#051C2E] flex items-center justify-center border-2 border-white dark:border-[#0A2E4A] shadow-md transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                                >
                                    {isUpdating ? (
                                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-xs">📷</span>
                                    )}
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* User Metadata */}
                        <div className="text-center sm:text-left flex-1 space-y-1">
                            <h2 className="font-display font-semibold text-2xl text-[#0E3A5C] dark:text-[#E6F1F8]">
                                {userProfile?.name || 'Loading Account...'}
                            </h2>
                            <p className="text-xs text-[#0E3A5C]/60 dark:text-[#E6F1F8]/60 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                                <span>📧</span> {userProfile?.email || 'No email associated'}
                            </p>
                            <p className="font-mono-nav text-[10px] text-[#0E3A5C]/50 dark:text-[#4A9DC7]/70 flex items-center justify-center sm:justify-start gap-2 pt-1">
                                <span>ID:</span>
                                <span className="bg-[#0E3A5C]/5 dark:bg-[#051C2E]/60 border border-[#0E3A5C]/10 dark:border-[#4A9DC7]/20 px-2 py-0.5 rounded text-[10px]">
                                    {userProfile?.id || 'N/A'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {avatarError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold mb-6 font-mono-nav">
                            ⚠️ {avatarError}
                        </div>
                    )}

                    <div className="border-t border-[#0E3A5C]/10 dark:border-[#4A9DC7]/15 my-6" />

                    {/* Editable Name Field */}
                    <div className="space-y-3">
                        <label className="block font-mono-nav text-[11px] font-bold tracking-wider uppercase text-[#0E3A5C]/70 dark:text-[#E6F1F8]/70">
                            Full Name
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="flex-1 rounded-lg border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20 bg-white/60 dark:bg-[#051C2E]/60 px-3.5 py-2.5 text-sm text-[#0E3A5C] dark:text-[#E6F1F8] placeholder-[#0E3A5C]/35 dark:placeholder-[#4A9DC7]/30 transition-all focus:border-[#4A9DC7] focus:bg-white dark:focus:bg-[#051C2E] focus:outline-none focus:ring-2 focus:ring-[#4A9DC7]/20 disabled:opacity-50"
                                placeholder="Enter your full legal name"
                                disabled={isUpdating}
                            />
                            <button
                                onClick={handleNameSave}
                                disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                className="font-mono-nav px-5 py-2.5 bg-[#0E3A5C] dark:bg-[#4A9DC7] text-[#DCEAF5] dark:text-[#051C2E] hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 active:scale-[0.99] disabled:opacity-40 text-xs font-bold uppercase tracking-wide rounded-lg shadow-md transition-all whitespace-nowrap cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                        {nameError && (
                            <p className="font-mono-nav text-[10px] font-semibold text-red-600 dark:text-red-400">
                                ⚠️ {nameError}
                            </p>
                        )}
                        {nameSuccess && (
                            <p className="font-mono-nav text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Profile updated successfully!
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Tagline */}
            <div className="pb-6 text-center font-mono-nav text-[9px] font-medium tracking-[0.25em] text-[#0E3A5C]/35 dark:text-[#4A9DC7]/35 uppercase select-none">
                Identity Profile Layer · Operations
            </div>
        </div>
    );
};