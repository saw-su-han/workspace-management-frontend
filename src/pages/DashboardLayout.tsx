import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useLogout, useUpdateProfile } from '../hooks/useAuth';
import { CreateWorkspaceModal } from '../Components/CreateWorkspceModel';
import { ThemeToggle } from '../Components/ThemeToggle';

export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const { data: userProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();
    const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
    const { mutate: handleLogoutServer } = useLogout();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Dropdown state
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Avatar upload feedback
    const [avatarError, setAvatarError] = useState<string | null>(null);
    // Tracks whether the <img> itself failed to load (broken URL, 404, etc.)
    const [avatarImgBroken, setAvatarImgBroken] = useState(false);

    // Inline name editing (backend only supports updating name + avatar)
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);

    const workspaces = userProfile?.workspaces || [];

    // Filter out soft-deleted workspaces and match search query
    const filteredWorkspaces = workspaces.filter((ws: any) =>
        ws.isDeleted !== true && ws.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- AVATAR URL RESOLUTION -------------------------------------------------
    // 1) Normalizes relative paths returned by the API into absolute URLs.
    // 2) Cache-busts the URL so the browser re-fetches the image after upload,
    //    even if the filename/path returned by the backend is identical to
    //    the previous one.
    const API_BASE_URL = import.meta.env.VITE_API_URL || "";

    const resolveAvatarUrl = (rawUrl?: string | null) => {
        if (!rawUrl) return null;

        const isAbsolute = /^https?:\/\//i.test(rawUrl);
        const base = isAbsolute ? rawUrl : `${API_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

        const cacheKey = userProfile?.avatarUpdatedAt || userProfile?.updatedAt;
        const separator = base.includes("?") ? "&" : "?";
        return cacheKey ? `${base}${separator}v=${cacheKey}` : base;
    };

    const avatarUrl = !avatarImgBroken ? resolveAvatarUrl(userProfile?.avatar) : null;

    // Reset the "broken" flag whenever the underlying avatar value changes
    useEffect(() => {
        setAvatarImgBroken(false);
    }, [userProfile?.avatar]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
                setIsEditingName(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);
        setAvatarImgBroken(false);

        const formData = new FormData();
        formData.append("avatar", file);

        updateProfile(formData, {
            onSuccess: () => {
                refetchProfile();
                // Reset the input so selecting the same file again still fires onChange
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: (err: any) => {
                setAvatarError(
                    err?.response?.data?.message || "Couldn't upload avatar. Please try again."
                );
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const startEditingName = () => {
        setNameDraft(userProfile?.name || "");
        setNameError(null);
        setIsEditingName(true);
    };

    const cancelEditingName = () => {
        setIsEditingName(false);
        setNameError(null);
    };

    const saveName = () => {
        const trimmed = nameDraft.trim();

        if (!trimmed) {
            setNameError("Name can't be empty.");
            return;
        }

        setNameError(null);
        const formData = new FormData();
        formData.append("name", trimmed);

        updateProfile(formData, {
            onSuccess: () => {
                refetchProfile();
                setIsEditingName(false);
            },
            onError: (err: any) => {
                setNameError(
                    err?.response?.data?.message || "Couldn't update name. Please try again."
                );
            },
        });
    };

    // Extract Initials for placeholder (e.g. "John Doe" -> "JD")
    const getInitials = (name: string) => {
        return name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";
    };

    const navigateToWorkspace = (workspaceId: number) => {
        navigate(`/workspaces/${workspaceId}`);
    };

    if (isProfileLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-955 dark:bg-slate-950 gap-6 transition-colors duration-300 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-15"></div>
                    <div className="relative inline-flex rounded-2xl h-6 w-6 bg-indigo-500 shadow-lg shadow-indigo-500/50 animate-pulse"></div>
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-sm font-bold tracking-wider text-slate-200">Initializing Dashboard</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">Setting up workspaces...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col antialiased relative overflow-hidden">

                {/* Ambient Decorative Glows */}
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-500/5 dark:bg-violet-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

                {/* PREMIUM HEADER INTERFACE */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-900/80 bg-white/60 dark:bg-[#030712]/60 backdrop-blur-xl px-6 md:px-8 sticky top-0 z-40 gap-4 transition-colors">
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                            <span className="font-extrabold text-base text-white">⚡</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Workspace</h1>
                            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-0.5">Control Center</p>
                        </div>
                    </div>

                    {/* CENTRAL GLASMOPHIC SEARCH BAR */}
                    <div className="max-w-sm w-full relative group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-12 py-2 text-xs bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/85 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 focus:bg-white dark:focus:bg-slate-950/80 rounded-xl text-slate-900 dark:text-slate-100 transition-all outline-none"
                        />
                        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                            <span className="text-[10px] font-semibold text-slate-400/80 dark:text-slate-600 bg-slate-200/50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">⌘K</span>
                        </div>
                    </div>

                    {/* CONTROLS & FACEBOOK-STYLE PROFILE MENU */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <ThemeToggle />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                            accept="image/*"
                        />

                        {/* PROFILE CONTAINER */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 focus:outline-none p-0.5 rounded-full hover:ring-4 hover:ring-indigo-500/10 transition-all duration-200"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={userProfile?.name}
                                        onError={() => setAvatarImgBroken(true)}
                                        className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xs text-white border-2 border-indigo-500/40 shadow-sm">
                                        {getInitials(userProfile?.name)}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Card */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3.5 w-72 origin-top-right rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-4 shadow-xl dark:shadow-indigo-950/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* User Detail Info Segment */}
                                    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-900">
                                        <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={userProfile?.name}
                                                    onError={() => setAvatarImgBroken(true)}
                                                    className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-800 group-hover/avatar:opacity-75 transition-opacity"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-sm text-white group-hover/avatar:opacity-75 transition-opacity">
                                                    {getInitials(userProfile?.name)}
                                                </div>
                                            )}
                                            {/* Camera Overlay Icon */}
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-white font-bold">
                                                    {isUpdatingProfile ? "..." : "Edit"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="truncate flex-1">
                                            {isEditingName ? (
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        value={nameDraft}
                                                        onChange={(e) => setNameDraft(e.target.value)}
                                                        autoFocus
                                                        className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    />
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={saveName}
                                                            disabled={isUpdatingProfile}
                                                            className="px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded-md font-bold"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEditingName}
                                                            className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-bold"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 group/name">
                                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">
                                                        {userProfile?.name}
                                                    </h4>
                                                    <button
                                                        onClick={startEditingName}
                                                        className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover/name:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                                {userProfile?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Errors inside menu */}
                                    {(avatarError || nameError) && (
                                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/25 text-red-500 rounded-lg text-[10px] font-semibold">
                                            {avatarError || nameError}
                                        </div>
                                    )}

                                    {/* Dropdown Options */}
                                    <div className="mt-3 space-y-1">
                                        <button
                                            onClick={executeLogoutPipeline}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/[0.05] rounded-xl transition-colors text-left"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
                                Your Workspaces
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Select a workspace to manage its projects, members, and tracking loops.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all self-start sm:self-auto"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Workspace
                        </button>
                    </div>

                    {/* WORKSPACE GRID DESIGNS */}
                    {filteredWorkspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm min-h-[350px]">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 flex items-center justify-center mb-4 text-lg">
                                📁
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No Workspaces Found</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1.5">
                                {searchQuery ? "No workspaces match your query search filter parameters." : "You are not a member of any workspaces yet. Create one to get rolling!"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-5 px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-bold text-xs rounded-xl transition-all"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredWorkspaces.map((ws: any) => {
                                const workspaceInfo = ws.workspace || ws;
                                const wsId = workspaceInfo.id;
                                const wsName = workspaceInfo.name;
                                const wsLogo = workspaceInfo.logo;

                                return (
                                    <div
                                        key={wsId}
                                        onClick={() => navigateToWorkspace(wsId)}
                                        className="group border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-[#0b0f19] p-5 rounded-2xl shadow-sm hover:shadow-md dark:hover:shadow-indigo-950/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                                    >
                                        <div className="flex gap-4 items-start">
                                            {wsLogo ? (
                                                <img
                                                    src={resolveAvatarUrl(wsLogo) || ''}
                                                    alt={wsName}
                                                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 font-extrabold text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center uppercase border border-slate-200/30 dark:border-slate-800/50">
                                                    {getInitials(wsName)}
                                                </div>
                                            )}
                                            <div className="truncate flex-1">
                                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate">
                                                    {wsName}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                                                    Role: {ws.role || 'MEMBER'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50 dark:border-slate-900/60 text-slate-400 dark:text-slate-600">
                                            <span className="text-[10px] font-medium tracking-wide">Enter Workspace</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform text-xs font-bold text-indigo-500">→</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* MODAL WRAPPERS */}
                {isCreateModalOpen && (
                    <CreateWorkspaceModal
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={() => refetchProfile()}
                    />
                )}
            </div>
        </div>
    );
};