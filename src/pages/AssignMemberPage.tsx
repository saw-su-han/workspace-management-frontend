// src/pages/AssignMemberPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceMembers, useAssignProjectMember, useProjectDetails } from '../hooks/useAuth';

export function AssignMemberPage() {
    const { workspaceId: workspaceIdParam, projectId: projectIdParam } = useParams<{ workspaceId: string; projectId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const projectId = Number(projectIdParam);
    const navigate = useNavigate();

    const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
    const { data: project } = useProjectDetails(projectId, workspaceId);
    const { mutate: assignMember, isPending, isSuccess } = useAssignProjectMember();

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const assignedUserIds = new Set(
        (project as any)?.members?.map((m: any) => m.user?.id) ?? []
    );

    const availableMembers = (members ?? []).filter((m) => !assignedUserIds.has(m.userId));

    const handleAssign = () => {
        if (!selectedUserId) {
            setError('Pick a member to assign.');
            return;
        }
        setError(null);
        assignMember(
            { workspaceId, projectId, userId: selectedUserId },
            {
                onError: (err: any) => {
                    setError(err?.response?.data?.message || "Couldn't assign member.");
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-sky-50 dark:bg-[#051923] text-sky-950 dark:text-cyan-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-sky-200/70 dark:border-cyan-400/10 bg-white/80 dark:bg-[#051923]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-cyan-400/60">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                            className="hover:text-sky-600 dark:hover:text-cyan-300 transition-colors"
                        >
                            Workspace #{workspaceId}
                        </button>
                        <span>/</span>
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                            className="hover:text-sky-600 dark:hover:text-cyan-300 transition-colors max-w-[140px] truncate"
                        >
                            {project?.name || `Project #${projectId}`}
                        </button>
                        <span>/</span>
                        <span className="text-sky-600 dark:text-cyan-300 font-bold">Assign Members</span>
                    </div>

                    {/* Quick Link back to Dashboard */}
                    <button
                        onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                        className="px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                    >
                        View Project Board 📋
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-lg mx-auto p-6 mt-4">
                <h1 className="text-lg font-extrabold tracking-tight mb-1">Assign Member</h1>
                <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mb-6">
                    Choose a workspace member to add to this project.
                </p>

                <div className="bg-white dark:bg-[#0a2f4e]/30 border border-sky-200/70 dark:border-cyan-400/10 rounded-2xl p-5 space-y-4 shadow-sm">
                    {isMembersLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin" />
                        </div>
                    ) : availableMembers.length === 0 ? (
                        <p className="text-xs text-sky-500/70 dark:text-cyan-400/50 text-center py-6">
                            All workspace members are already assigned to this project.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {availableMembers.map((member) => (
                                <label
                                    key={member.userId}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${selectedUserId === member.userId
                                        ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-400/10'
                                        : 'border-sky-200 dark:border-cyan-400/10 hover:bg-sky-50 dark:hover:bg-[#0e3a5c]'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="assignee"
                                        checked={selectedUserId === member.userId}
                                        onChange={() => setSelectedUserId(member.userId)}
                                        className="accent-cyan-500"
                                    />
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                                        {member.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate">{member.name}</p>
                                        <p className="text-[10px] text-sky-500/70 dark:text-cyan-400/50 truncate">{member.email}</p>
                                    </div>
                                    <span className="ml-auto text-[9px] font-extrabold text-sky-400 dark:text-cyan-400/50">{member.role}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
                    {isSuccess && <p className="text-[11px] text-emerald-500 font-semibold">Member assigned successfully.</p>}

                    <button
                        onClick={handleAssign}
                        disabled={isPending || availableMembers.length === 0}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20"
                    >
                        {isPending ? 'Assigning...' : 'Assign to Project'}
                    </button>
                </div>
            </div>
        </div>
    );
}