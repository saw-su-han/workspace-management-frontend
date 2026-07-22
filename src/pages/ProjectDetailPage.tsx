// src/pages/ProjectDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            <div className="flex h-screen w-full items-center justify-center bg-sky-50 dark:bg-[#051923] text-sky-950 dark:text-cyan-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold tracking-wider uppercase text-sky-500 dark:text-cyan-400">
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
            <div className="flex h-screen w-full flex-col items-center justify-center bg-sky-50 dark:bg-[#051923] gap-4 p-4 text-center">
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-6 max-w-md w-full">
                    <span className="text-2xl mb-2 block">⚠️</span>
                    <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
                        Failed to Load Project
                    </h3>
                    <p className="text-xs text-rose-500 dark:text-rose-300 font-medium">
                        {apiErrorMessage}
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/workspaces/${isNaN(wId) ? '' : wId}`)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                    Return to Workspace
                </button>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'COMPLETED':
                return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
            default: // PLANNING
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="min-h-screen w-full bg-sky-50 dark:bg-[#051923] text-sky-950 dark:text-cyan-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-sky-200/70 dark:border-cyan-400/10 bg-white/80 dark:bg-[#051923]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 mb-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-cyan-400/60">
                        <button
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="hover:text-sky-600 dark:hover:text-cyan-300 transition-colors"
                        >
                            Workspace #{wId}
                        </button>
                        <span>/</span>
                        <span className="text-sky-600 dark:text-cyan-300 font-bold">{project.name}</span>
                    </div>

                    {/* Actions Navbar */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/workspaces/${wId}`)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-cyan-300 hover:bg-sky-100 dark:hover:bg-cyan-500/10 rounded-xl transition-all"
                        >
                            All Projects
                        </button>

                        <button
                            onClick={() => navigate(`/workspaces/${wId}/projects/${pId}/assign`)}
                            className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                            <span>Manage Assignments</span>
                            <span>👥</span>
                        </button>
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6 pt-0">

                {/* Main Project Card */}
                <div className="bg-white dark:bg-[#0a2f4e]/30 border border-sky-200/70 dark:border-cyan-400/10 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

                    {/* Header: ID, Name, Status & Created At */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-sky-100 dark:border-cyan-400/10 pb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Project ID Badge */}
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-cyan-950/50 text-slate-500 dark:text-cyan-400/80 border border-slate-200 dark:border-cyan-400/20">
                                    ID: #{project.id}
                                </span>

                                {/* Project Name */}
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-sky-950 dark:text-cyan-50">
                                    {project.name}
                                </h1>

                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-sky-700/80 dark:text-cyan-100/70 leading-relaxed max-w-3xl">
                                {project.description || "No project description provided."}
                            </p>
                        </div>

                        {/* Created At Info Tag */}
                        <div className="self-start px-4 py-3 rounded-xl bg-sky-50/50 dark:bg-[#0e3a5c]/40 border border-sky-100 dark:border-cyan-400/10 space-y-2 min-w-[170px]">
                            <div>
                                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-sky-500/70 dark:text-cyan-400/50">
                                    Created On
                                </span>
                                <span className="text-xs font-bold text-sky-900 dark:text-cyan-100">
                                    {formatDate(project.createdAt)}
                                </span>
                            </div>

                            <div>
                                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-sky-500/70 dark:text-cyan-400/50">
                                    Start Date
                                </span>
                                <span className="text-xs font-bold text-sky-900 dark:text-cyan-100">
                                    {project.startDate || "No start Date provided"};
                                </span>
                            </div>

                            <div>
                                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-sky-500/70 dark:text-cyan-400/50">
                                    End Date
                                </span>
                                <span className="text-xs font-bold text-sky-900 dark:text-cyan-100">
                                    {project.endDate || "No end Date provided"};
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="pt-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-sky-500/80 dark:text-cyan-400/50 mb-3">
                            Assigned Members ({project.members?.length || 0})
                        </h2>

                        {project.members && project.members.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {project.members.map((member) => (
                                    <div
                                        key={member.user.id}
                                        className="flex items-center gap-2.5 px-3 py-2 bg-sky-50/60 dark:bg-[#0e3a5c]/50 rounded-xl border border-sky-200/70 dark:border-cyan-400/10"
                                    >
                                        {member.user.avatar ? (
                                            <img
                                                src={member.user.avatar}
                                                alt={member.user.name}
                                                className="w-7 h-7 rounded-full object-cover border border-cyan-400/30"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white text-[11px] font-bold uppercase">
                                                {member.user.name?.[0] || 'U'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-sky-900 dark:text-cyan-100 leading-tight">
                                                {member.user.name}
                                            </p>
                                            <p className="text-[10px] text-sky-500/70 dark:text-cyan-400/50">
                                                {member.user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-sky-500/70 dark:text-cyan-400/50 italic">
                                No members assigned to this project yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="bg-white dark:bg-[#0a2f4e]/30 border border-sky-200/70 dark:border-cyan-400/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-sky-500/80 dark:text-cyan-400/50">
                            Project Tasks ({project.tasks?.length || 0})
                        </h2>
                    </div>

                    {project.tasks && project.tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-sky-50/50 dark:bg-[#0e3a5c]/40 rounded-xl border border-sky-100 dark:border-cyan-400/10 flex flex-col justify-between gap-3"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="text-xs font-bold text-sky-950 dark:text-cyan-50">
                                                {task.title}
                                            </h3>
                                            {task.status && (
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-sky-200/60 dark:bg-cyan-950 text-sky-700 dark:text-cyan-300">
                                                    {task.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-sky-600/80 dark:text-cyan-200/60 line-clamp-2">
                                            {task.description || "No task description provided."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-sky-200/70 dark:border-cyan-400/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl mb-2">📋</span>
                            <h3 className="text-xs font-bold text-sky-900 dark:text-cyan-100">No tasks created yet</h3>
                            <p className="text-[11px] text-sky-500/70 dark:text-cyan-400/50 max-w-xs mt-1">
                                Create and assign tasks to your workspace members to start tracking progress.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}