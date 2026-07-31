// src/pages/DashboardLayout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useLogout } from '../hooks/useAuth';
import { CreateWorkspaceModal } from '../Components/CreateWorkspceModel';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';
import { Icon } from "@iconify/react";

export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    const { data: userProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();
    const { mutate: handleLogoutServer, isPending: isLoggingOut } = useLogout();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'ADMIN' | 'OWNER' | 'MEMBER'>('ALL');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-gray-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.04)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-emerald-600 dark:fill-emerald-400" />
                    </svg>
                    <div className="relative inline-flex rounded-full h-9 w-9 bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30 items-center justify-center text-white">
                        <Icon icon="lucide:hexagon" className="w-5 h-5 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-1 text-center relative px-4">
                    <p className="font-display text-base font-bold tracking-tight text-gray-900 dark:text-white">Loading workspaces</p>
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
            <header className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
                        <Icon icon="lucide:hexagon" className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                        <Icon icon="lucide:cpu" className="absolute w-3.5 h-3.5 text-white" />
                        <div className="absolute -inset-0.5 bg-emerald-400 rounded-xl blur opacity-30"></div>
                    </div>
                    <div>
                        <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                            Project<span className="text-emerald-600 dark:text-emerald-400">Hive</span>
                        </h1>
                        <p className="font-mono-nav text-[9px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase -mt-0.5">Dashboard</p>
                    </div>
                </div>

                {/* DESKTOP SEARCH */}
                <div className="hidden md:block max-w-sm w-full relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-600 transition-colors">
                        <Icon icon="lucide:search" className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono-nav w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 rounded-xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                    />
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
                        <Icon icon="lucide:log-out" className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center focus:outline-none rounded-full hover:ring-4 hover:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                    >
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-9 w-9 rounded-full object-cover border-2 border-emerald-600/50 shadow-sm"
                        />
                    </button>
                </div>

                {/* MOBILE MENU TOGGLE BUTTON */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                        <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* MOBILE DROPDOWN MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 space-y-3 shadow-xl z-30">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                            <UserAvatar userProfile={userProfile} className="h-10 w-10 rounded-full object-cover border border-emerald-600/40 shadow-sm" />
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{userProfile?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile?.email || 'View Profile'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="font-mono-nav text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                        >
                            <Icon icon="lucide:user" className="w-3.5 h-3.5" />
                            Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            onClick={() => navigate('/login')}
                            className="font-mono-nav w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <Icon icon="lucide:log-in" className="w-4 h-4 text-emerald-500" />
                            <span>Sign In</span>
                        </button>
                        <button
                            onClick={executeLogoutPipeline}
                            disabled={isLoggingOut}
                            className="font-mono-nav w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                            <Icon icon="lucide:log-out" className="w-4 h-4" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-10 relative z-10 space-y-8">

                {/* CLEAN & SIMPLE DASHBOARD HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Secure Orchestration Hub
                        </div>
                        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
                            Workspaces Dashboard
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                            Select a workspace below to manage your projects, members, and secure pipelines.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="font-mono-nav text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2 shadow-sm">
                            <Icon icon="lucide:layers" className="w-4 h-4" />
                            {workspaces.length} Total Workspaces
                        </span>
                    </div>
                </div>

                {/* MOBILE SEARCH BAR */}
                <div className="block md:hidden w-full">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                            <Icon icon="lucide:search" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="font-mono-nav w-full pl-10 pr-4 py-3 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                        />
                    </div>
                </div>

                {/* ROLE FILTER BAR & CREATE WORKSPACE BUTTON */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 shadow-xl shadow-black/[0.02] backdrop-blur-xl">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full no-scrollbar">
                        <span className="font-mono-nav text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 hidden lg:inline flex-shrink-0 flex items-center gap-1">
                            <Icon icon="lucide:filter" className="w-3.5 h-3.5" /> Filter:
                        </span>
                        {(['ALL', 'OWNER', 'ADMIN', 'MEMBER'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`font-mono-nav text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 shadow-sm ${activeFilter === tab
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/40'
                                    }`}
                            >
                                <Icon icon={tab === 'OWNER' ? 'lucide:shield-check' : tab === 'ADMIN' ? 'lucide:shield' : tab === 'MEMBER' ? 'lucide:users' : 'lucide:layout-grid'} className="w-3.5 h-3.5" />
                                {tab === 'ALL' ? `All (${workspaces.length})` : tab}
                            </button>
                        ))}
                    </div>

                    {/* Create Workspace Button inside the Filter Bar */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="font-mono-nav inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex-shrink-0"
                    >
                        <Icon icon="lucide:plus-circle" className="w-4 h-4" />
                        <span>New Workspace</span>
                    </button>
                </div>

                {/* WORKSPACES TITLE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <div>
                        <h2 className="font-display font-extrabold text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">Your Workspaces</h2>
                        <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">
                            {filteredWorkspaces.length} shown · active channels & pipeline access
                        </p>
                    </div>
                </div>

                {/* WORKSPACE CARDS GRID */}
                {filteredWorkspaces.length === 0 ? (
                    <div className="text-center p-16 border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-gray-900/20 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                            <Icon icon="lucide:folder-search" className="w-6 h-6" />
                        </div>
                        <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 tracking-wide">No workspaces found for this filter. Try adjusting your search query or tab.</p>
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
                                    className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl"
                                >
                                    {/* Top accent line */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

                                    {/* Card Header */}
                                    <div className="flex items-center justify-between gap-3 relative z-10">
                                        <div className="flex items-center gap-3.5">
                                            <UserAvatar
                                                userProfile={{
                                                    avatar: workspaceInfo.logo,
                                                    name: workspaceInfo.name || userProfile?.name || 'Workspace'
                                                }}
                                                className="w-12 h-12 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform"
                                            />
                                            <div>
                                                <h4 className="font-display font-bold text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                    {workspaceInfo.name}
                                                </h4>
                                                <span className="font-mono-nav text-[11px] text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1 mt-0.5">
                                                    Active Workspace
                                                </span>
                                            </div>
                                        </div>

                                        {/* Clean Status Dot */}
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 flex-shrink-0 animate-pulse" />
                                    </div>

                                    {/* Card Footer / Details */}
                                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 relative z-10">
                                        <span className={`font-mono-nav text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${roleText === 'OWNER'
                                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                            : roleText === 'ADMIN'
                                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                            }`}>
                                            <Icon icon={roleText === 'OWNER' ? 'lucide:shield-check' : roleText === 'ADMIN' ? 'lucide:shield' : 'lucide:user'} className="w-3 h-3" />
                                            {roleText}
                                        </span>

                                        <div className="flex items-center gap-1.5 font-mono-nav text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                                            <span>Open Space</span>
                                            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
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