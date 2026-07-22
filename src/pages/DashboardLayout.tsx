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

    // Purely cosmetic helper — turns a workspace id into a stable "bearing" readout.
    // No logic changed: this only derives a display string for the ticket tag below.
    const bearingTag = (id: number) => {
        const bearing = ((id * 37) % 360).toString().padStart(3, '0');
        const num = id.toString().padStart(3, '0');
        return `№ ${num} · ${bearing}°`;
    };

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@400;500;700&display=swap');
            .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    if (isProfileLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#DCEAF5] dark:bg-[#051C2E] gap-6 transition-colors duration-300 relative overflow-hidden">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(11,37,69,0.06)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_#0A2E4A_0%,_#051C2E_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="#2E6F95" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" fill="#2E6F95" />
                    </svg>
                    <div className="relative inline-flex rounded-full h-9 w-9 bg-gradient-to-tr from-[#0E3A5C] to-[#4A9DC7] shadow-lg shadow-teal-500/30 items-center justify-center">
                        <span className="text-white text-sm">⚓</span>
                    </div>
                </div>
                <div className="space-y-1 text-center relative">
                    <p className="font-display italic text-base font-semibold tracking-tight text-[#0E3A5C] dark:text-[#DCEAF5]">Charting your waters</p>
                    <p className="font-mono-nav text-[10px] text-[#0E3A5C]/50 dark:text-[#4A9DC7]/60 uppercase tracking-[0.25em]">Reading the depth gauge…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DCEAF5] dark:bg-[#051C2E] text-[#0E3A5C] dark:text-[#E6F1F8] transition-colors duration-300 flex flex-col antialiased relative overflow-hidden">
            <FontFaces />

            {/* Chart-paper texture / depth lines */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(11,37,69,0.035) 0px, rgba(11,37,69,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A9DC7]/[0.06] dark:bg-[#4A9DC7]/[0.08] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2E6F95]/[0.05] dark:bg-[#2E6F95]/[0.05] blur-[160px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="flex h-16 items-center justify-between border-b border-[#0E3A5C]/10 dark:border-[#4A9DC7]/10 bg-[#DCEAF5]/70 dark:bg-[#051C2E]/80 backdrop-blur-xl px-6 md:px-8 sticky top-0 z-40 gap-4 transition-colors">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="relative flex h-9 w-9 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite] opacity-70" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="#2E6F95" strokeWidth="1" strokeDasharray="0.5 7" />
                        </svg>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#0E3A5C] to-[#4A9DC7] shadow-md shadow-teal-500/30 ring-1 ring-[#2E6F95]/30">
                            <span className="text-sm text-white drop-shadow">⚓</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-display italic font-semibold text-sm tracking-tight text-[#0E3A5C] dark:text-[#DCEAF5]">Workspace</h1>
                        <p className="font-mono-nav text-[9px] font-medium text-[#0E3A5C]/50 dark:text-[#4A9DC7]/60 tracking-[0.25em] uppercase -mt-0.5">Control Deck</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="max-w-sm w-full relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#0E3A5C]/40 dark:text-[#4A9DC7]/50 group-focus-within:text-[#4A9DC7] transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono-nav w-full pl-10 pr-12 py-2 text-xs bg-[#0E3A5C]/[0.04] dark:bg-[#DCEAF5]/[0.05] border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/15 focus:ring-4 focus:ring-[#4A9DC7]/15 focus:border-[#4A9DC7] rounded-lg outline-none text-[#0E3A5C] dark:text-[#DCEAF5] placeholder:text-[#0E3A5C]/35 dark:placeholder:text-[#DCEAF5]/30 transition-all"
                    />
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <ThemeToggle />

                    <button
                        onClick={executeLogoutPipeline}
                        disabled={isLoggingOut}
                        className="h-9 w-9 flex items-center justify-center rounded-full text-[#0E3A5C]/40 dark:text-[#DCEAF5]/40 hover:text-[#C1440E] dark:hover:text-[#E8703A] hover:bg-[#C1440E]/10 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center focus:outline-none rounded-full hover:ring-4 hover:ring-[#4A9DC7]/20 transition-all duration-200"
                    >
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-9 w-9 rounded-full object-cover border-2 border-[#2E6F95]/50 shadow-sm"
                        />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="font-display italic font-semibold text-xl md:text-2xl text-[#0E3A5C] dark:text-[#DCEAF5] tracking-tight">Your Workspaces</h2>
                        <p className="font-mono-nav text-[11px] text-[#0E3A5C]/50 dark:text-[#DCEAF5]/40 mt-1 tracking-wide">{filteredWorkspaces.length} charted · everything you're part of</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="font-mono-nav inline-flex items-center justify-center gap-2 bg-[#0E3A5C] dark:bg-[#4A9DC7] hover:bg-[#0E3A5C]/90 dark:hover:bg-[#4A9DC7]/90 text-[#DCEAF5] dark:text-[#051C2E] font-bold text-[11px] tracking-wide uppercase px-4 py-2.5 rounded-lg shadow-md transition-all"
                    >
                        + New Workspace
                    </button>
                </div>

                {filteredWorkspaces.length === 0 ? (
                    <div className="text-center p-12 border border-dashed border-[#0E3A5C]/20 dark:border-[#4A9DC7]/20 rounded-2xl bg-[#0E3A5C]/[0.02] dark:bg-[#DCEAF5]/[0.02]">
                        <p className="font-mono-nav text-xs text-[#0E3A5C]/50 dark:text-[#DCEAF5]/40 tracking-wide">No workspaces charted yet. Try another search, or start a new one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredWorkspaces.map((ws: any) => {
                            const workspaceInfo = ws.workspace || ws;
                            return (
                                <div
                                    key={workspaceInfo.id}
                                    onClick={() => navigateToWorkspace(workspaceInfo.id)}
                                    className="group relative border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 bg-white/70 dark:bg-[#0A2E4A]/40 backdrop-blur-sm p-5 rounded-xl shadow-sm hover:border-[#4A9DC7]/60 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between min-h-[148px] overflow-hidden"
                                >
                                    {/* notch detail, ticket-style */}
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DCEAF5] dark:bg-[#051C2E] border border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12" />

                                    <div className="flex gap-4 items-start relative">
                                        <UserAvatar
                                            userProfile={{
                                                avatar: workspaceInfo.logo,
                                                name: workspaceInfo.name || userProfile?.name || 'Workspace'
                                            }}
                                            className="w-11 h-11 rounded-lg object-cover border border-[#0E3A5C]/15 dark:border-[#4A9DC7]/20"
                                        />
                                        <div className="truncate flex-1">
                                            <h4 className="font-display font-semibold text-sm text-[#0E3A5C] dark:text-[#DCEAF5] group-hover:text-[#1E5F87] dark:group-hover:text-[#4A9DC7] transition-colors truncate">
                                                {workspaceInfo.name}
                                            </h4>
                                            <p className="font-mono-nav text-[9px] font-bold text-[#0E3A5C]/45 dark:text-[#4A9DC7]/50 uppercase tracking-wider mt-1">
                                                {ws.role || 'MEMBER'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-dashed border-[#0E3A5C]/12 dark:border-[#4A9DC7]/12 relative">
                                        <span className="font-mono-nav text-[9px] text-[#0E3A5C]/40 dark:text-[#DCEAF5]/30 tracking-wide">
                                            {bearingTag(workspaceInfo.id)}
                                        </span>
                                        <span className="transform group-hover:translate-x-1 transition-transform text-xs font-bold text-[#1E5F87] dark:text-[#4A9DC7]">→</span>
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