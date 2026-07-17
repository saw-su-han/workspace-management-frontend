// src/pages/ProjectDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetails } from '../hooks/useAuth';

export function ProjectDetail() {
    const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
    const navigate = useNavigate();

    // Parse IDs to numbers for the API hook calls
    const wId = Number(workspaceId);
    const pId = Number(projectId);

    const { data: project, isLoading, error } = useProjectDetails(pId);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f3f6f9] dark:bg-[#0b121f] text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl animate-bounce text-cyan-500 font-sans">⚡</span>
                    Loading Project Context...
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f3f6f9] dark:bg-[#0b121f] gap-4">
                <p className="text-sm font-semibold text-rose-500">Could not resolve project space.</p>
                <button
                    onClick={() => navigate(`/workspaces/${wId}`)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                    Return to Workspace
                </button>
            </div>
        );
    }

    // Generate dynamic UI badges based on internal DB state matching your enum
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
            case 'COMPLETED':
                return 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20';
            default:
                return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070d19] text-slate-900 dark:text-slate-100 p-6 md:p-8 transition-colors duration-200">

            {/* Navigation & Header Actions Context */}
            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(`/workspaces/${wId}`)}
                    className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:opacity-80 transition-opacity"
                >
                    <span>←</span> Back to Workspace Workspace
                </button>

                <button
                    onClick={() => navigate(`/workspaces/${wId}/projects/${pId}/assign`)}
                    className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
                >
                    Manage Assignments 👥
                </button>
            </div>

            {/* Main Container View Dashboard Layout */}
            <div className="max-w-6xl mx-auto bg-white dark:bg-[#0b121f] border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {project.name}
                            </h1>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                            {project.description || "No project description provided."}
                        </p>
                    </div>

                    {/* Date Tracking Parameters Box */}
                    <div className="flex gap-4 p-3 bg-slate-50 dark:bg-[#0e1726] rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <div>
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Start Date</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Unset'}</span>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 self-stretch" />
                        <div>
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Target Deadline</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Unset'}</span>
                        </div>
                    </div>
                </div>

                {/* Task Dashboard Workspace Placeholder Zone */}
                <div className="mt-8">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Project Tasks Board</h2>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl mb-2">📋</span>
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No active tracking elements</h3>
                        <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                            Start adding custom sprint modules, assign tasks to members, or update parameters to fit your team roadmap goals.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}