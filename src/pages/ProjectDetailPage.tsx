// src/pages/ProjectDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useProjectDetails } from '../hooks/useAuth';

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
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                    <span className="font-mono-nav text-xs font-bold tracking-wider uppercase text-mint-700 dark:text-mint-400">
                        Loading Project Details...
                    </span>
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
            <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-mint-950 gap-4 p-4 text-center">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 max-w-md w-full backdrop-blur-md">
                    <Icon icon="solar:danger-triangle-bold-duotone" className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                    <h3 className="font-display text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                        Failed to Load Project
                    </h3>
                    <p className="font-mono-nav text-[11px] text-rose-500 dark:text-rose-300 font-medium">
                        {apiErrorMessage}
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/workspaces/${isNaN(wId) ? '' : wId}`)}
                    className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                    Return to Workspace
                </button>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/[0.04] dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20';
            case 'COMPLETED':
                return 'bg-mint-500/[0.04] dark:bg-mint-400/10 text-mint-800 dark:text-mint-300 border-mint-900/15 dark:border-mint-300/15';
            default: // PLANNING
                return 'bg-amber-500/[0.04] dark:bg-amber-400/10 text-amber-600 dark:text-amber-300 border-amber-500/20';
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Left: Back Button with Text instead of just Arrow + Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-mint-700 dark:text-mint-400" />
                            <span>Back to Workspace</span>
                        </button>

                        <div className="hidden sm:block space-y-0.5 border-l border-mint-900/10 dark:border-mint-300/15 pl-4">
                            <div className="font-mono-nav flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                <span>Workspace #{wId}</span>
                                <span>/</span>
                                <span className="text-mint-700 dark:text-mint-400">Project View</span>
                            </div>
                            <h1 className="font-display text-base font-black tracking-tight text-mint-900 dark:text-mint-50">
                                {project.name}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="font-mono-nav px-3.5 py-2 text-xs font-bold text-mint-900/70 dark:text-mint-300/70 hover:bg-white/50 dark:hover:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Icon icon="solar:folder-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            All Projects
                        </button>

                        <button
                            onClick={() => navigate(`/workspaces/${wId}/projects/${pId}/assign`)}
                            className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Icon icon="solar:users-group-rounded-bold" className="w-3.5 h-3.5 text-mint-400 dark:text-mint-950" />
                            <span>Manage Assignments</span>
                        </button>
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">

                {/* Main Project Card */}
                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 backdrop-blur-md">

                    {/* Header: ID, Name, Status & Created At */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-mint-900/10 dark:border-mint-300/15 pb-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Project ID Badge */}
                                <span className="font-mono-nav text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/50 dark:bg-mint-900/40 text-mint-800/70 dark:text-mint-300/70 border border-mint-900/15 dark:border-mint-300/15 shadow-sm">
                                    ID: #{project.id}
                                </span>

                                {/* Status Badge */}
                                <span className={`font-mono-nav inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border shadow-sm ${getStatusStyle(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>

                            <h2 className="font-display text-xl md:text-2xl font-black tracking-tight text-mint-900 dark:text-mint-50">
                                {project.name}
                            </h2>

                            {/* Description */}
                            <p className="font-mono-nav text-xs text-mint-900/70 dark:text-mint-100/70 leading-relaxed max-w-3xl">
                                {project.description || "No project description provided."}
                            </p>
                        </div>

                        {/* Created At Info Tag */}
                        <div className="self-start px-5 py-4 rounded-2xl bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 space-y-3 min-w-[200px] backdrop-blur-md shadow-sm">
                            <div>
                                <span className="block font-mono-nav text-[9px] font-extrabold uppercase tracking-wider text-mint-800/50 dark:text-mint-300/50 flex items-center gap-1">
                                    <Icon icon="solar:calendar-bold-duotone" className="w-3 h-3" />
                                    Created On
                                </span>
                                <span className="font-mono-nav text-xs font-bold text-mint-900 dark:text-mint-50 mt-0.5 block">
                                    {formatDate(project.createdAt)}
                                </span>
                            </div>

                            <div>
                                <span className="block font-mono-nav text-[9px] font-extrabold uppercase tracking-wider text-mint-800/50 dark:text-mint-300/50 flex items-center gap-1">
                                    <Icon icon="solar:play-bold-duotone" className="w-3 h-3" />
                                    Start Date
                                </span>
                                <span className="font-mono-nav text-xs font-bold text-mint-900 dark:text-mint-50 mt-0.5 block">
                                    {project.startDate || "No start date provided"}
                                </span>
                            </div>

                            <div>
                                <span className="block font-mono-nav text-[9px] font-extrabold uppercase tracking-wider text-mint-800/50 dark:text-mint-300/50 flex items-center gap-1">
                                    <Icon icon="solar:stop-bold-duotone" className="w-3 h-3" />
                                    End Date
                                </span>
                                <span className="font-mono-nav text-xs font-bold text-mint-900 dark:text-mint-50 mt-0.5 block">
                                    {project.endDate || "No end date provided"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="pt-2">
                        <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-mint-800/70 dark:text-mint-300/70 mb-3 flex items-center gap-1.5">
                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            Assigned Members ({project.members?.length || 0})
                        </h3>

                        {project.members && project.members.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {project.members.map((member) => (
                                    <div
                                        key={member.user.id}
                                        className="flex items-center gap-3 px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 rounded-2xl border border-mint-900/15 dark:border-mint-300/15 backdrop-blur-md shadow-sm"
                                    >
                                        {member.user.avatar ? (
                                            <img
                                                src={member.user.avatar}
                                                alt={member.user.name}
                                                className="w-8 h-8 rounded-xl object-cover border border-mint-700/20"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/20 flex items-center justify-center text-mint-900 dark:text-mint-50 text-xs font-black uppercase shadow-inner">
                                                {member.user.name?.[0] || 'U'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50 leading-tight">
                                                {member.user.name}
                                            </p>
                                            <p className="font-mono-nav text-[10px] text-mint-800/60 dark:text-mint-300/60">
                                                {member.user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="font-mono-nav text-xs text-mint-800/50 dark:text-mint-300/50 italic">
                                No members assigned to this project yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-4">
                    <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-mint-800/70 dark:text-mint-300/70 flex items-center gap-1.5">
                        <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                        Project Tasks ({project.tasks?.length || 0})
                    </h3>

                    {project.tasks && project.tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-white/50 dark:bg-mint-900/40 rounded-2xl border border-mint-900/15 dark:border-mint-300/15 flex flex-col justify-between gap-3 backdrop-blur-md shadow-sm"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">
                                                {task.title}
                                            </h4>
                                            {task.status && (
                                                <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-mint-900/5 dark:bg-mint-300/10 text-mint-800/70 dark:text-mint-300/70 border border-mint-900/10 dark:border-mint-300/15">
                                                    {task.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-mono-nav text-[11px] text-mint-900/60 dark:text-mint-100/60 line-clamp-2">
                                            {task.description || "No task description provided."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-dashed border-mint-900/15 dark:border-mint-300/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-mint-900/20">
                            <Icon icon="solar:clipboard-remove-bold-duotone" className="w-8 h-8 text-mint-700/50 dark:text-mint-400/50 mb-2" />
                            <h4 className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">No tasks created yet</h4>
                            <p className="font-mono-nav text-[11px] text-mint-900/60 dark:text-mint-100/60 max-w-xs mt-1">
                                Create and assign tasks to your workspace members to start tracking progress.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}