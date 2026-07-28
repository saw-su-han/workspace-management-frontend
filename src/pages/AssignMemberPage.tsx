// src/pages/AssignMemberPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
        <div className="min-h-screen w-full bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Left: Back Button with Text + Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-mint-700 dark:text-mint-400" />
                            <span>Back to Project</span>
                        </button>

                        <div className="hidden sm:block space-y-0.5 border-l border-mint-900/10 dark:border-mint-300/15 pl-4">
                            <div className="font-mono-nav flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                <span>Workspace #{workspaceId}</span>
                                <span>/</span>
                                <span className="text-mint-700 dark:text-mint-400">Assign Members</span>
                            </div>
                            <h1 className="font-display text-base font-black tracking-tight text-mint-900 dark:text-mint-50">
                                {project?.name || `Project #${projectId}`}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                            className="font-mono-nav px-3.5 py-2 text-xs font-bold text-mint-900/70 dark:text-mint-300/70 hover:bg-white/50 dark:hover:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            Project Board
                        </button>
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-xl mx-auto p-6 md:p-8 mt-4">
                <div className="mb-6">
                    <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-mint-900 dark:text-mint-50 mb-1">
                        Assign Member
                    </h1>
                    <p className="font-mono-nav text-xs text-mint-900/70 dark:text-mint-100/70">
                        Choose a workspace member to add to this project.
                    </p>
                </div>

                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-4">
                    {isMembersLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                        </div>
                    ) : availableMembers.length === 0 ? (
                        <div className="border border-dashed border-mint-900/15 dark:border-mint-300/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-mint-900/20">
                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-8 h-8 text-mint-700/50 dark:text-mint-400/50 mb-2" />
                            <h4 className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">All members assigned</h4>
                            <p className="font-mono-nav text-[11px] text-mint-900/60 dark:text-mint-100/60 max-w-xs mt-1">
                                All workspace members are already assigned to this project.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {availableMembers.map((member) => (
                                <label
                                    key={member.userId}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${selectedUserId === member.userId
                                        ? 'border-mint-600 dark:border-mint-400 bg-mint-500/10 dark:bg-mint-400/10 shadow-sm'
                                        : 'border-mint-900/15 dark:border-mint-300/15 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="assignee"
                                        checked={selectedUserId === member.userId}
                                        onChange={() => setSelectedUserId(member.userId)}
                                        className="accent-mint-700 dark:accent-mint-400"
                                    />
                                    {member.avatar ? (
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-8 h-8 rounded-xl object-cover border border-mint-700/20"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/20 flex items-center justify-center text-mint-900 dark:text-mint-50 text-xs font-black uppercase shadow-inner flex-shrink-0">
                                            {member.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50 truncate">
                                            {member.name}
                                        </p>
                                        <p className="font-mono-nav text-[10px] text-mint-800/60 dark:text-mint-300/60 truncate">
                                            {member.email}
                                        </p>
                                    </div>
                                    <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-mint-900/5 dark:bg-mint-300/10 text-mint-800/70 dark:text-mint-300/70 border border-mint-900/10 dark:border-mint-300/15">
                                        {member.role}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                            {error}
                        </p>
                    )}
                    {isSuccess && (
                        <p className="font-mono-nav text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                            Member assigned successfully.
                        </p>
                    )}

                    <button
                        onClick={handleAssign}
                        disabled={isPending || availableMembers.length === 0}
                        className="w-full font-mono-nav px-4 py-3 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
                        <span>{isPending ? 'Assigning...' : 'Assign to Project'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}