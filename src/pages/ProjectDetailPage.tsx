// src/pages/ProjectDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useProjectDetails } from '../hooks/useAuth';
import { AsideNav } from '../Components/Asidenav';

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
            <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
                <AsideNav workspaceId={wId} projectId={pId} />
                <div className="flex-1 flex h-screen flex-col items-center justify-center gap-6 transition-colors duration-300 relative overflow-hidden">
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
                        <p className="font-display text-base font-bold tracking-tight text-gray-900 dark:text-white">Loading project details</p>
                        <p className="font-mono-nav text-[10px] text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-[0.25em]">Please wait…</p>
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
            <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
                <AsideNav workspaceId={wId} projectId={pId} />
                <div className="flex-1 flex h-screen flex-col items-center justify-center gap-4 p-4 text-center transition-colors duration-300">
                    <FontFaces />
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 max-w-md w-full backdrop-blur-xl">
                        <Icon icon="solar:danger-triangle-bold-duotone" className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <h3 className="font-display text-xs font-extrabold text-rose-600 dark:text-rose-400 mb-1">
                            Failed to Load Project
                        </h3>
                        <p className="font-mono-nav text-[11px] text-rose-500 dark:text-rose-300 font-medium">
                            {apiErrorMessage}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(`/workspaces/${isNaN(wId) ? '' : wId}`)}
                        className="font-mono-nav px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                        Return to Workspace
                    </button>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'COMPLETED':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700';
            default: // PLANNING
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={wId} projectId={pId} />
            <div className="flex-1 text-gray-900 dark:text-gray-50 transition-colors duration-300 antialiased relative overflow-x-hidden">
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

                {/* Top Navigation Bar */}
                <nav className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center transition-colors">
                    <div className="max-w-6xl w-full mx-auto flex items-center justify-between">

                        {/* Left: Back Button + Breadcrumbs */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="font-mono-nav px-3.5 py-2 bg-gray-100 dark:bg-gray-900 hover:border-emerald-500/40 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Back to Workspace</span>
                            </button>

                            <div className="hidden sm:block space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-4">
                                <div className="font-mono-nav flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <span>Workspace #{wId}</span>
                                    <span>/</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">Project View</span>
                                </div>
                                <h1 className="font-display text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    {project.name}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => navigate(`/workspaces/${wId}`)}
                                className="font-mono-nav px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Icon icon="solar:folder-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                All Projects
                            </button>

                            <button
                                onClick={() => navigate(`/workspaces/${wId}/projects/${pId}/assign`)}
                                className="font-mono-nav px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Icon icon="solar:users-group-rounded-bold" className="w-3.5 h-3.5 text-white" />
                                <span>Manage Assignments</span>
                            </button>
                        </div>

                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                    {/* Main Project Card */}
                    <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-6">

                        {/* Header: ID, Name, Status & Created At */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Project ID Badge */}
                                    <span className="font-mono-nav text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                                        ID: #{project.id}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`font-mono-nav inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${getStatusStyle(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>

                                <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    {project.name}
                                </h2>

                                {/* Description */}
                                <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                                    {project.description || "No project description provided."}
                                </p>
                            </div>

                            {/* Created At Info Tag */}
                            <div className="self-start px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3 min-w-[200px]">
                                <div>
                                    <span className="block font-mono-nav text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                        <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3" />
                                        Created On
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white mt-0.5 block">
                                        {formatDate(project.createdAt)}
                                    </span>
                                </div>

                                <div>
                                    <span className="block font-mono-nav text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                        <Icon icon="solar:play-bold-duotone" className="w-3 h-3" />
                                        Start Date
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white mt-0.5 block">
                                        {project.startDate || "No start date provided"}
                                    </span>
                                </div>

                                <div>
                                    <span className="block font-mono-nav text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                        <Icon icon="solar:stop-bold-duotone" className="w-3 h-3" />
                                        End Date
                                    </span>
                                    <span className="font-mono-nav text-xs font-bold text-gray-900 dark:text-white mt-0.5 block">
                                        {project.endDate || "No end date provided"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="pt-2">
                            <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                                <Icon icon="solar:users-group-rounded-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Assigned Members ({project.members?.length || 0})
                            </h3>

                            {project.members && project.members.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {project.members.map((member) => (
                                        <div
                                            key={member.user.id}
                                            className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
                                        >
                                            {member.user.avatar ? (
                                                <img
                                                    src={member.user.avatar}
                                                    alt={member.user.name}
                                                    className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-600/40"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                                                    {member.user.name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-display text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                                    {member.user.name}
                                                </p>
                                                <p className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500">
                                                    {member.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono-nav text-xs text-gray-400 dark:text-gray-500 italic">
                                    No members assigned to this project yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-4">
                        <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Project Tasks ({project.tasks?.length || 0})
                        </h3>

                        {project.tasks && project.tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-3"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white">
                                                    {task.title}
                                                </h4>
                                                {task.status && (
                                                    <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        {task.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-mono-nav text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {task.description || "No task description provided."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50">
                                <Icon icon="solar:clipboard-remove-bold-duotone" className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                                <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white">No tasks created yet</h4>
                                <p className="font-mono-nav text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mt-1">
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