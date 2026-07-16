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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-sky-50 dark:bg-[#051923] transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.08)_0%,_transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,_#0a2f4e_0%,_#051923_65%)]" />
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin relative" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-[#051923] dark:to-[#051923] text-sky-950 dark:text-cyan-50 flex flex-col transition-colors duration-300 relative overflow-hidden font-sans">

            {/* Decorative ocean glow layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.08)_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(15,107,168,0.25)_0%,_transparent_55%)] pointer-events-none" />
            <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-teal-400/[0.05] dark:bg-teal-400/[0.07] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-cyan-400/[0.05] dark:bg-cyan-400/[0.06] blur-[150px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="border-b border-sky-200/70 dark:border-cyan-400/10 bg-white/70 dark:bg-[#051923]/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0a2f4e]/60 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs font-bold text-sky-700 dark:text-cyan-200 shadow-sm transition-all hover:border-cyan-400/50 dark:hover:border-cyan-400/40 hover:bg-sky-50 dark:hover:bg-[#0a2f4e]"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="font-extrabold text-sm tracking-tight text-cyan-600 dark:text-cyan-300">My Profile</h1>
                </div>
                <ThemeToggle />
            </header>

            {/* MAIN CONTENT CONTAINER */}
            <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 relative z-10">
                <div className="bg-white dark:bg-[#0a2f4e]/50 backdrop-blur-md border border-sky-200/70 dark:border-cyan-400/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl shadow-sky-900/5 dark:shadow-black/30 transition-colors">

                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group/avatar">
                            <div className="relative">
                                <UserAvatar
                                    userProfile={userProfile}
                                    previewUrl={localAvatarPreview}
                                    className="h-24 w-24 rounded-full object-cover border-4 border-cyan-500/30 dark:border-cyan-400/30 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-400/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUpdating}
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 hover:from-sky-500 hover:to-cyan-300 text-white flex items-center justify-center border-2 border-white dark:border-[#0a2f4e] shadow-lg shadow-cyan-500/30 transition-transform hover:scale-110 disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "📸"
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

                        {/* RENDER USER INFORMATION */}
                        <div className="text-center sm:text-left flex-1 space-y-1">
                            <h2 className="font-extrabold text-xl text-sky-950 dark:text-cyan-50">
                                {userProfile?.name || 'Loading Account...'}
                            </h2>
                            <p className="text-sm text-sky-500/80 dark:text-cyan-400/60 flex items-center justify-center sm:justify-start gap-2">
                                <span>📧</span> {userProfile?.email || 'No email associated'}
                            </p>
                            <p className="text-xs text-sky-400/70 dark:text-cyan-400/40 flex items-center justify-center sm:justify-start gap-2">
                                <span>Identification ID:</span>
                                <span className="font-mono bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/10 px-1.5 py-0.5 rounded text-[10px] text-cyan-700 dark:text-cyan-300">
                                    {userProfile?.id || 'N/A'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {avatarError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-400/25 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-semibold">
                            {avatarError}
                        </div>
                    )}

                    <div className="border-t border-sky-100 dark:border-cyan-400/10" />

                    {/* Editable Name Field */}
                    <div className="space-y-3">
                        <label className="block text-xs font-extrabold uppercase tracking-[0.15em] text-sky-500/80 dark:text-cyan-400/60">
                            Full Name
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="flex-1 px-4 py-2.5 text-xs bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all placeholder:text-sky-400 dark:placeholder:text-cyan-400/30"
                                placeholder="Enter your full legal name"
                                disabled={isUpdating}
                            />
                            <button
                                onClick={handleNameSave}
                                disabled={isUpdating || nameDraft.trim() === userProfile?.name}
                                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-40 disabled:hover:from-sky-600 disabled:hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all whitespace-nowrap"
                            >
                                Save Changes
                            </button>
                        </div>
                        {nameError && <p className="text-[11px] text-rose-500 dark:text-rose-300 font-semibold">{nameError}</p>}
                        {nameSuccess && <p className="text-[11px] text-teal-600 dark:text-teal-300 font-semibold">Profile updated successfully!</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};