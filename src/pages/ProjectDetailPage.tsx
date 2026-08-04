import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useProjectDetails } from '../hooks/useAuth';
import { AsideNav } from '../Components/Asidenav';
import { ThemeToggle } from '../Components/ThemeToggle';

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

export function ProjectDetail() {
    const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
    const navigate = useNavigate();

    const wId = Number(workspaceId);
    const pId = Number(projectId);

    const { data: project, isLoading, error } = useProjectDetails(pId, wId);

    // Helper to format creation date
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full bg-slate-50 dark:bg-gray-950 font-sans">
                <AsideNav workspaceId={wId} projectId={pId} />
                <div className="flex-1 flex h-screen flex-col items-center justify-center gap-6 transition-colors duration-300 relative overflow-hidden">
                    <FontFaces />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.04)_0%,_transparent_60%)]" />

                    <div className="relative flex h-24 w-24 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-30 dark:opacity-50" fill="none">
                            <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-500" strokeWidth="1" strokeDasharray="2 6" />
                            <path d="M50 4 L56 46 L50 52 L44 46 Z" className="fill-emerald-500" />
                        </svg>
                        <div className="relative inline-flex rounded-2xl h-12 w-12 bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/20 items-center justify-center">
                            <span className="text-white text-base font-black">✦</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 text-center relative px-4">
                        <p className="font-display text-sm font-bold tracking-tight text-gray-800 dark:text-gray-100">Loading project space</p>
                        <p className="font-mono-nav text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Synchronizing data…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        const apiErrorMessage =
            (error as any)?.response?.data?.message ||
            (error as Error)?.message ||
            "Could not resolve project space.";

        return (
            <div className="flex min-h-screen w-full bg-slate-50 dark:bg-gray-950 font-sans">
                <AsideNav workspaceId={wId} projectId={pId} />
                <div className="flex-1 flex h-screen flex-col items-center justify-center gap-5 p-4 text-center transition-colors duration-300">
                    <FontFaces />
                    <div className="rounded-3xl border border-rose-500/20 bg-white dark:bg-gray-900/80 p-8 max-w-md w-full shadow-xl shadow-rose-500/5 backdrop-blur-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-rose-500" />
                        </div>
                        <h3 className="font-display text-sm font-extrabold text-gray-900 dark:text-white mb-1.5">
                            Failed to Load Project
                        </h3>
                        <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-medium bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 mb-6">
                            {apiErrorMessage}
                        </p>
                        <button
                            onClick={() => navigate(`/workspaces/${isNaN(wId) ? '' : wId}`)}
                            className="w-full font-mono-nav px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                            Return to Workspace
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5';
            case 'COMPLETED':
                return 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700';
            default: // PLANNING
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/5';
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={wId} projectId={pId} />
            <div className="flex-1 text-gray-900 dark:text-gray-50 transition-colors duration-300 antialiased relative overflow-x-hidden">
                <FontFaces />

                {/* Subtle grid pattern background */}
                <div
                    className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.2) 1px, transparent 0)',
                        backgroundSize: '36px 36px'
                    }}
                />
                {/* Atmospheric Background Glows */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-teal-600/10 dark:bg-teal-600/5 blur-[180px] rounded-full pointer-events-none" />

                {/* Top Navigation Bar */}
                <nav className="h-18 md:h-20 border-b border-slate-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl sticky top-0 z-40 px-4 md:px-8 flex items-center transition-colors">
                    <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">

                        {/* Left: Back Button + Breadcrumbs */}
                        <div className="flex items-center gap-3.5 min-w-0">
                            {/* <button
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="font-mono-nav px-3.5 py-2.5 bg-white dark:bg-gray-900/80 hover:border-emerald-500/50 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-gray-300 shadow-sm transition-all cursor-pointer flex items-center gap-2 flex-shrink-0"
                            >
                                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="hidden sm:inline">Workspace</span>
                            </button> */}

                            <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-gray-800 pl-4 min-w-0">
                                <div className="font-mono-nav flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                    <span>Workspace #{wId}</span>
                                    <span>/</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Overview</span>
                                </div>
                                <h1 className="font-display text-sm md:text-base font-extrabold tracking-tight text-gray-900 dark:text-white truncate max-w-xs md:max-w-sm">
                                    {project.name}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Actions & Theme Toggle */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                            <ThemeToggle />

                            {/* <button
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="hidden md:flex font-mono-nav px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-900/80 hover:bg-slate-100 dark:hover:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm transition-all cursor-pointer items-center gap-2"
                            >
                                <Icon icon="solar:folder-bold-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                All Projects
                            </button> */}

                            <button
                                onClick={() => navigate(`/workspaces/${wId}/projects/${pId}/assign`)}
                                className="font-mono-nav px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-white" />
                                <span className="hidden xs:inline">Manage Members</span>
                            </button>
                        </div>

                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                    {/* Main Project Card */}
                    <div className="rounded-3xl bg-white dark:bg-gray-900/70 border border-slate-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl space-y-8 relative overflow-hidden">

                        {/* Decorative top accent glow border */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-80" />

                        {/* Header: ID, Name, Status & Created At */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-100 dark:border-gray-800/80 pb-8">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Project ID Badge */}
                                    <span className="font-mono-nav text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800 shadow-sm">
                                        ID: #{project.id}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`font-mono-nav inline-flex items-center px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border ${getStatusStyle(project.status)}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                                        {project.status}
                                    </span>
                                </div>

                                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    {project.name}
                                </h2>

                                {/* Description */}
                                <p className="font-mono-nav text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                                    {project.description || "No project description provided."}
                                </p>
                            </div>

                            {/* Timeline & Metadata Card */}
                            <div className="w-full lg:w-72 p-5 rounded-2xl bg-slate-50/80 dark:bg-gray-900/90 border border-slate-200/80 dark:border-gray-800 space-y-4 shadow-sm">
                                <div className="space-y-1">
                                    <span className="font-mono-nav text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                                        <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Created On
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white block pl-5">
                                        {formatDate(project.createdAt)}
                                    </span>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-gray-800" />

                                <div className="space-y-1">
                                    <span className="font-mono-nav text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                                        <Icon icon="solar:play-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Start Date
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white block pl-5">
                                        {project.startDate || "Not provided"}
                                    </span>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-gray-800" />

                                <div className="space-y-1">
                                    <span className="font-mono-nav text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                                        <Icon icon="solar:stop-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        End Date
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white block pl-5">
                                        {project.endDate || "Not provided"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-mono-nav text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    Assigned Members
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                                        {project.members?.length || 0}
                                    </span>
                                </h3>
                            </div>

                            {project.members && project.members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {project.members.map((member) => (
                                        <div
                                            key={member.user.id}
                                            className="flex items-center gap-3.5 p-3.5 bg-slate-50/70 dark:bg-gray-900/60 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all"
                                        >
                                            {member.user.avatar ? (
                                                <img
                                                    src={member.user.avatar}
                                                    alt={member.user.name}
                                                    className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-600/30 shadow-sm flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm flex-shrink-0">
                                                    {member.user.name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-display text-xs font-bold text-gray-900 dark:text-white truncate">
                                                    {member.user.name}
                                                </p>
                                                <p className="font-mono-nav text-[10px] text-slate-400 dark:text-gray-500 truncate">
                                                    {member.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/40 text-center">
                                    <p className="font-mono-nav text-xs text-slate-400 dark:text-gray-500 italic">
                                        No members assigned to this project yet. Use "Manage Members" to add your team.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="rounded-3xl bg-white/90 dark:bg-gray-900/70 border border-slate-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-mono-nav text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Project Tasks
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                                    {project.tasks?.length || 0}
                                </span>
                            </h3>
                        </div>

                        {project.tasks && project.tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-5 bg-slate-50/80 dark:bg-gray-900/80 rounded-2xl border border-slate-200/80 dark:border-gray-800 flex flex-col justify-between gap-4 shadow-sm hover:border-emerald-500/40 transition-all group"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {task.title}
                                                </h4>
                                                {task.status && (
                                                    <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                                                        {task.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-mono-nav text-[11px] text-slate-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                                {task.description || "No task description provided."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-gray-900/40">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-600 mb-3 shadow-inner">
                                    <Icon icon="solar:clipboard-remove-bold-duotone" className="w-6 h-6" />
                                </div>
                                <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white mb-1">No tasks created yet</h4>
                                <p className="font-mono-nav text-[11px] text-slate-400 dark:text-gray-500 max-w-xs">
                                    Create and assign tasks to your workspace members to start tracking progress.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}