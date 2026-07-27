// src/pages/TaskAssignPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
    useTaskDetails,
    useWorkspaceMembers,
    useAssignTask,
    useWorkspaceDetails,
    type WorkspaceMemberItem,
} from '../hooks/useAuth';

export const TaskAssign: React.FC = () => {
    const { workspaceId: workspaceIdParam, taskId: taskIdParam } = useParams<{ workspaceId: string; taskId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const taskId = Number(taskIdParam);
    const navigate = useNavigate();

    const { data: task, isLoading: isTaskLoading } = useTaskDetails(workspaceId, taskId);
    const { data: workspace } = useWorkspaceDetails(workspaceId);
    const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
    const { mutate: assignTask, isPending: isAssigning } = useAssignTask(workspaceId, taskId);

    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [assignedFlash, setAssignedFlash] = useState(false);

    const filteredMembers = (members || []).filter((m) =>
        !search.trim() ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = (member: WorkspaceMemberItem) => {
        setSelectedUserId(member.userId);
        setAssignError(null);
        assignTask(member.userId, {
            onSuccess: () => {
                setAssignedFlash(true);
                setTimeout(() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}`), 900);
            },
            onError: (err: any) => {
                setSelectedUserId(null);
                setAssignError(err?.response?.data?.message || "Couldn't assign this task.");
            },
        });
    };

    const isLoading = isTaskLoading || isMembersLoading;

    return (
        <div className="min-h-screen w-full bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Left: Back Button with Text + Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-mint-700 dark:text-mint-400" />
                            <span>Back to Task</span>
                        </button>

                        <div className="hidden sm:block space-y-0.5 border-l border-mint-900/10 dark:border-mint-300/15 pl-4">
                            <div className="font-mono-nav flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                <span>{workspace?.workspaceName || 'Workspace'}</span>
                                {task?.project?.name && (
                                    <>
                                        <span>/</span>
                                        <span>{task.project.name}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="font-display text-base font-black tracking-tight text-mint-900 dark:text-mint-50">
                                {task?.title || 'Assign Task'}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}`)}
                            className="font-mono-nav px-3.5 py-2 text-xs font-bold text-mint-900/70 dark:text-mint-300/70 hover:bg-white/50 dark:hover:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            View Task Details
                        </button>
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-xl mx-auto p-6 md:p-8 mt-4">
                <div className="mb-6">
                    <h2 className="font-display text-xl md:text-2xl font-black tracking-tight text-mint-900 dark:text-mint-50 mb-1">
                        Choose a member
                    </h2>
                    <p className="font-mono-nav text-xs text-mint-900/70 dark:text-mint-100/70">
                        They'll get an in-app notification and an email as soon as you assign them.
                    </p>
                </div>

                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-4">
                    {task?.assignee && (
                        <div className="flex items-center gap-3 p-3.5 bg-white/50 dark:bg-mint-900/40 rounded-2xl border border-mint-900/15 dark:border-mint-300/15 shadow-sm">
                            {task.assignee.avatar ? (
                                <img
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    className="w-8 h-8 rounded-xl object-cover border border-mint-700/25 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/25 flex items-center justify-center text-mint-900 dark:text-mint-50 text-xs font-black uppercase shadow-inner flex-shrink-0">
                                    {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            <p className="font-mono-nav text-xs text-mint-900/80 dark:text-mint-100/80">
                                Currently assigned to <span className="font-bold text-mint-900 dark:text-mint-50">{task.assignee.name}</span>
                            </p>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-mint-700/50 dark:text-mint-400/50">
                            <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full font-mono-nav pl-10 pr-4 py-2.5 text-xs bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl outline-none text-mint-900 dark:text-mint-50 placeholder:text-mint-800/40 dark:placeholder:text-mint-300/40 focus:ring-2 focus:ring-mint-600/20 focus:border-mint-600 dark:focus:border-mint-400 transition-all"
                        />
                    </div>

                    {assignError && (
                        <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                            {assignError}
                        </p>
                    )}
                    {assignedFlash && (
                        <p className="font-mono-nav text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                            Assigned ✓ — heading back to the task...
                        </p>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="border border-dashed border-mint-900/15 dark:border-mint-300/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-mint-900/20">
                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-8 h-8 text-mint-700/50 dark:text-mint-400/50 mb-2" />
                            <h4 className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">No members found</h4>
                            <p className="font-mono-nav text-[11px] text-mint-900/60 dark:text-mint-100/60 max-w-xs mt-1">
                                No members match that search query.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filteredMembers.map((member) => {
                                const isCurrentAssignee = (task?.assignee as any)?.id === member.userId;
                                const isThisRowAssigning = isAssigning && selectedUserId === member.userId;
                                return (
                                    <button
                                        key={member.userId}
                                        onClick={() => !isCurrentAssignee && handleAssign(member)}
                                        disabled={isAssigning || isCurrentAssignee}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all text-left cursor-pointer ${isCurrentAssignee
                                                ? 'border-emerald-500/30 bg-emerald-500/5 opacity-80 cursor-default'
                                                : selectedUserId === member.userId
                                                    ? 'border-mint-600 dark:border-mint-400 bg-mint-500/10 dark:bg-mint-400/10 shadow-sm'
                                                    : 'border-mint-900/15 dark:border-mint-300/15 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-8 h-8 rounded-xl object-cover border border-mint-700/20 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/20 flex items-center justify-center text-mint-900 dark:text-mint-50 text-xs font-black uppercase shadow-inner flex-shrink-0">
                                                    {member.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50 truncate">
                                                    {member.name}
                                                </p>
                                                <p className="font-mono-nav text-[10px] text-mint-800/60 dark:text-mint-300/60 truncate">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-mint-900/5 dark:bg-mint-300/10 text-mint-800/70 dark:text-mint-300/70 border border-mint-900/10 dark:border-mint-300/15">
                                                {member.role}
                                            </span>
                                            {isCurrentAssignee ? (
                                                <span className="font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Assigned</span>
                                            ) : (
                                                <span className="font-mono-nav text-[10px] font-bold text-mint-700 dark:text-mint-400 flex items-center gap-1">
                                                    {isThisRowAssigning ? 'Assigning...' : <>Assign <Icon icon="solar:arrow-right-linear" className="w-3 h-3" /></>}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};