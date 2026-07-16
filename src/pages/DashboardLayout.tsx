import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query'; // Added to manage cache clearance
import { useProfile, useLogout } from '../hooks/useAuth';
import { CreateWorkspaceModal } from '../Components/CreateWorkspceModel';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';

export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: userProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();
    const { mutate: handleLogoutServer, isPending: isLoggingOut } = useLogout();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 🔥 FORCE FRESH DATABASE SYNC ON ROUTE CHANGE / MOUNT
    // This wipes out cached staleness instantly when navigating back from Profile
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        refetchProfile();
    }, [location.pathname, queryClient, refetchProfile]);

    const workspaces = userProfile?.workspaces || [];

    const filteredWorkspaces = workspaces.filter((ws: any) =>
        ws.isDeleted !== true &&
        (ws.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ws.workspace?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

    if (isProfileLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-sky-50 dark:bg-[#051923] gap-6 transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.08)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_#0a2f4e_0%,_#051923_60%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-cyan-400/10 blur-[140px] rounded-full pointer-events-none" />
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></div>
                    <div className="relative inline-flex rounded-2xl h-6 w-6 bg-gradient-to-tr from-cyan-400 to-sky-600 shadow-lg shadow-cyan-500/50 animate-pulse"></div>
                </div>
                <div className="space-y-1 text-center relative">
                    <p className="text-sm font-bold tracking-widest text-sky-900 dark:text-cyan-50">Diving into your workspaces</p>
                    <p className="text-[10px] text-sky-600/70 dark:text-cyan-400/70 uppercase tracking-[0.2em] animate-pulse">Charting the depths...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-sky-50 dark:bg-[#051923] text-sky-950 dark:text-cyan-50 transition-colors duration-300 flex flex-col antialiased relative overflow-hidden">

                {/* Decorative ocean glow layers */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.08)_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,_rgba(15,107,168,0.25)_0%,_transparent_55%)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400/[0.06] dark:bg-cyan-400/[0.07] blur-[160px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/[0.05] dark:bg-teal-400/[0.06] blur-[160px] rounded-full pointer-events-none" />

                {/* HEADER */}
                <header className="flex h-16 items-center justify-between border-b border-sky-200/60 dark:border-cyan-400/10 bg-white/60 dark:bg-[#051923]/70 backdrop-blur-xl px-6 md:px-8 sticky top-0 z-40 gap-4 transition-colors">
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300/30">
                            <span className="font-extrabold text-base text-white drop-shadow">⚓</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-extrabold text-sm tracking-tight text-sky-950 dark:text-cyan-50">Workspace</h1>
                            <p className="text-[9px] font-semibold text-sky-500/70 dark:text-cyan-400/60 tracking-[0.2em] uppercase -mt-0.5">Control Deck</p>
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="max-w-sm w-full relative group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-sky-400 dark:text-cyan-400/60 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-300 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-12 py-2 text-xs bg-sky-100/60 dark:bg-[#0a2f4e]/60 border border-sky-200/80 dark:border-cyan-400/15 focus:ring-4 focus:ring-cyan-400/15 focus:border-cyan-500 dark:focus:border-cyan-400/60 rounded-xl outline-none text-sky-950 dark:text-cyan-50 placeholder:text-sky-400 dark:placeholder:text-cyan-400/40 transition-all"
                        />
                    </div>

                    {/* CONTROLS */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <ThemeToggle />

                        <button
                            onClick={executeLogoutPipeline}
                            disabled={isLoggingOut}
                            className="h-9 w-9 flex items-center justify-center rounded-full text-sky-400 dark:text-cyan-400/50 hover:text-rose-500 dark:hover:text-rose-300 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center focus:outline-none rounded-full hover:ring-4 hover:ring-cyan-400/20 transition-all duration-200"
                        >
                            {/* 🔥 Header User Profile Avatar View */}
                            <UserAvatar
                                userProfile={userProfile}
                                className="h-9 w-9 rounded-full object-cover border-2 border-cyan-500/40 dark:border-cyan-400/50 shadow-sm shadow-cyan-500/20"
                            />
                        </button>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="font-black text-xl md:text-2xl text-sky-950 dark:text-cyan-50 tracking-tight">Your Workspaces</h2>
                            <p className="text-xs text-sky-500/70 dark:text-cyan-400/50 mt-1">Everything you're part of, in one current.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/30"
                        >
                            + New Workspace
                        </button>
                    </div>

                    {filteredWorkspaces.length === 0 ? (
                        <div className="text-center p-12 border border-dashed border-sky-300/60 dark:border-cyan-400/20 rounded-3xl bg-white/50 dark:bg-[#0a2f4e]/20 backdrop-blur-sm">
                            <p className="text-xs text-sky-500/70 dark:text-cyan-400/50">No workspaces found in these waters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredWorkspaces.map((ws: any) => {
                                const workspaceInfo = ws.workspace || ws;
                                return (
                                    <div
                                        key={workspaceInfo.id}
                                        onClick={() => navigateToWorkspace(workspaceInfo.id)}
                                        className="group relative border border-sky-200/70 dark:border-cyan-400/10 bg-white dark:bg-[#0a2f4e]/40 backdrop-blur-sm p-5 rounded-2xl shadow-lg shadow-sky-900/5 dark:shadow-black/20 hover:border-cyan-400/50 dark:hover:border-cyan-400/40 hover:bg-sky-50/80 dark:hover:bg-[#0a2f4e]/70 hover:shadow-cyan-500/10 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] overflow-hidden"
                                    >
                                        {/* subtle current sweep on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/[0.06] group-hover:via-transparent group-hover:to-teal-400/[0.04] transition-all duration-500 pointer-events-none" />

                                        <div className="flex gap-4 items-start relative">
                                            {/* 🔥 Securely bound properties down to structural data definitions */}
                                            <UserAvatar
                                                userProfile={{
                                                    avatar: workspaceInfo.logo,
                                                    name: workspaceInfo.name || userProfile?.name || 'Workspace'
                                                }}
                                                className="w-11 h-11 rounded-xl object-cover border border-sky-200 dark:border-cyan-400/20"
                                            />
                                            <div className="truncate flex-1">
                                                <h4 className="font-extrabold text-sm text-sky-950 dark:text-cyan-50 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                                                    {workspaceInfo.name}
                                                </h4>
                                                <p className="text-[10px] font-bold text-sky-400 dark:text-cyan-400/50 uppercase tracking-wider mt-0.5">
                                                    Role: {ws.role || 'MEMBER'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-sky-100 dark:border-cyan-400/10 text-sky-400 dark:text-cyan-400/50 relative">
                                            <span className="text-[10px] font-medium tracking-wide">Enter Workspace</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform text-xs font-bold text-cyan-600 dark:text-cyan-300">→</span>
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
        </div>
    );
};