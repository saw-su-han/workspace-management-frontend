import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useLogout } from '../hooks/useAuth';
import { CreateWorkspaceModal } from '../Components/CreateWorkspceModel';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';

export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    const { data: userProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();
    const { mutate: handleLogoutServer, isPending: isLoggingOut } = useLogout();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'ADMIN' | 'OWNER' | 'MEMBER'>('ALL');

    const workspaces = userProfile?.workspaces || [];

    const filteredWorkspaces = workspaces.filter((ws: any) => {
        const workspaceInfo = ws.workspace || ws;
        const matchesSearch = ws.isDeleted !== true && (
            ws.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workspaceInfo.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (!matchesSearch) return false;

        const role = ws.role?.toUpperCase();
        if (activeFilter === 'ADMIN') return role === 'ADMIN';
        if (activeFilter === 'OWNER') return role === 'OWNER';
        if (activeFilter === 'MEMBER') return role === 'MEMBER';

        return true;
    });

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

    const navigateToWorkspace = (workspaceId: number) => {
        navigate(`/workspaces/${workspaceId}`);
    };

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    if (isProfileLoading) {
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
                    <p className="font-display text-base font-bold tracking-tight text-mint-900 dark:text-mint-50">Charting your workspace waters</p>
                    <p className="font-mono-nav text-[10px] text-mint-800/50 dark:text-mint-300/60 uppercase tracking-[0.25em]">Reading workspace state…</p>
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

            {/* HEADER */}
            <header className="flex h-16 items-center justify-between border-b border-mint-900/10 dark:border-mint-300/15 bg-mint-50/70 dark:bg-mint-950/80 backdrop-blur-xl px-6 md:px-8 sticky top-0 z-40 gap-4 transition-colors">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="relative flex h-9 w-9 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-700 dark:text-mint-400" strokeWidth="1" strokeDasharray="0.5 7" />
                        </svg>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-mint-900 to-mint-600 shadow-md shadow-mint-500/20 ring-1 ring-mint-700/30">
                            <span className="text-sm text-mint-50 font-bold">≈</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-display font-extrabold text-sm tracking-tight text-mint-900 dark:text-mint-50">Workspace</h1>
                        <p className="font-mono-nav text-[9px] font-semibold text-mint-800/50 dark:text-mint-300/60 tracking-[0.25em] uppercase -mt-0.5">Control Deck</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="max-w-sm w-full relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-mint-800/40 dark:text-mint-300/50 group-focus-within:text-mint-600 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono-nav w-full pl-10 pr-12 py-2 text-xs bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 rounded-lg outline-none text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 transition-all"
                    />
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <ThemeToggle />

                    <button
                        onClick={executeLogoutPipeline}
                        disabled={isLoggingOut}
                        className="h-9 w-9 flex items-center justify-center rounded-full text-mint-900/40 dark:text-mint-100/40 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center focus:outline-none rounded-full hover:ring-4 hover:ring-mint-500/20 transition-all duration-200 cursor-pointer"
                    >
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-9 w-9 rounded-full object-cover border-2 border-mint-700/50 shadow-sm"
                        />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10 space-y-8">

                {/* ROLE FILTER BAR & CREATE WORKSPACE BUTTON */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-mint-900/10 dark:border-mint-300/15 bg-white/60 dark:bg-mint-900/30 backdrop-blur-md">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full">
                        <span className="font-mono-nav text-[10px] font-bold text-mint-800/50 dark:text-mint-300/50 uppercase tracking-wider mr-2 hidden sm:inline">
                            Role Filter:
                        </span>
                        {(['ALL', 'OWNER', 'ADMIN', 'MEMBER'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`font-mono-nav text-[11px] font-bold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${activeFilter === tab
                                    ? 'bg-mint-900 dark:bg-mint-400 text-mint-50 dark:text-mint-950 border-mint-900 dark:border-mint-400 shadow-sm'
                                    : 'bg-white/40 dark:bg-mint-900/20 text-mint-800 dark:text-mint-200 border-mint-900/10 dark:border-mint-300/10 hover:border-mint-500/40'
                                    }`}
                            >
                                {tab === 'ALL' ? `All (${workspaces.length})` : tab}
                            </button>
                        ))}
                    </div>

                    {/* Create Workspace Button inside the Filter Bar */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="font-mono-nav inline-flex items-center justify-center gap-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 font-bold text-[11px] tracking-wide uppercase px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer flex-shrink-0"
                    >
                        + New Workspace
                    </button>
                </div>

                {/* WORKSPACES TITLE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display font-extrabold text-xl md:text-2xl text-mint-900 dark:text-mint-50 tracking-tight">Your Workspaces</h2>
                        <p className="font-mono-nav text-[11px] font-medium text-mint-800/50 dark:text-mint-100/40 mt-1 tracking-wide">
                            {filteredWorkspaces.length} shown · active channels & pipeline access
                        </p>
                    </div>
                </div>

                {/* WORKSPACE CARDS GRID (Sleek Minimal Modern Card Design) */}
                {filteredWorkspaces.length === 0 ? (
                    <div className="text-center p-12 border border-dashed border-mint-900/20 dark:border-mint-300/20 rounded-2xl bg-white/40 dark:bg-mint-900/20">
                        <p className="font-mono-nav text-xs text-mint-800/50 dark:text-mint-100/40 tracking-wide">No workspaces found for this role filter. Try selecting another tab.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredWorkspaces.map((ws: any) => {
                            const workspaceInfo = ws.workspace || ws;
                            const roleText = (ws.role || 'MEMBER').toUpperCase();
                            return (
                                <div
                                    key={workspaceInfo.id}
                                    onClick={() => navigateToWorkspace(workspaceInfo.id)}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 shadow-sm hover:shadow-xl hover:border-mint-500/50 dark:hover:border-mint-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    {/* Top accent line */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint-600 via-emerald-500 to-mint-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3.5">
                                            <UserAvatar
                                                userProfile={{
                                                    avatar: workspaceInfo.logo,
                                                    name: workspaceInfo.name || userProfile?.name || 'Workspace'
                                                }}
                                                className="w-11 h-11 rounded-xl object-cover border border-mint-900/15 dark:border-mint-300/20 shadow-sm group-hover:scale-105 transition-transform"
                                            />
                                            <div>
                                                <h4 className="font-display font-bold text-base text-mint-900 dark:text-mint-50 group-hover:text-mint-600 dark:group-hover:text-mint-300 transition-colors line-clamp-1">
                                                    {workspaceInfo.name}
                                                </h4>
                                                <span className="font-mono-nav text-[10px] text-mint-800/40 dark:text-mint-300/50 tracking-wider">
                                                    ID: #{workspaceInfo.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Clean Status Dot */}
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mt-1.5 flex-shrink-0" />
                                    </div>

                                    {/* Card Footer / Details */}
                                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-mint-900/5 dark:border-mint-300/10">
                                        <span className={`font-mono-nav text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${roleText === 'OWNER'
                                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                            : roleText === 'ADMIN'
                                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                                                : 'bg-mint-900/5 dark:bg-mint-300/10 text-mint-800 dark:text-mint-200 border border-mint-900/10 dark:border-mint-300/15'
                                            }`}>
                                            {roleText}
                                        </span>

                                        <div className="flex items-center gap-1 font-mono-nav text-xs font-bold text-mint-800 dark:text-mint-300 group-hover:text-mint-600 dark:group-hover:text-mint-100 transition-colors">
                                            <span>Open</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {isCreateModalOpen && (
                <CreateWorkspaceModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => refetchProfile()}
                />
            )}
        </div>
    );
};