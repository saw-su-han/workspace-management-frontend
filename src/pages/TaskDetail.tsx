// src/pages/TaskDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ConfirmModal } from '../Components/ConfirmModel';
import {
    useTaskDetails,
    useUpdateTask,
    useUpdateTaskStatus,
    useDeleteTask,
    useWorkspaceDetails,
    useWorkspaceMembers,
    useProfile,
    useComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    type TaskStatus,
    type TaskPriority
} from '../hooks/useAuth';

const PRIORITY_STYLES: Record<TaskPriority, { label: string; text: string; bg: string; border: string }> = {
    LOW: { label: 'Low', text: 'text-sky-600 dark:text-sky-300', bg: 'bg-sky-500/[0.04] dark:bg-sky-400/10', border: 'border-sky-500/20' },
    MEDIUM: { label: 'Medium', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/[0.04] dark:bg-amber-400/10', border: 'border-amber-500/20' },
    HIGH: { label: 'High', text: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-500/[0.04] dark:bg-rose-400/10', border: 'border-rose-500/20' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    TODO: { label: 'To Do', dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-500/[0.04] dark:bg-slate-400/10', border: 'border-slate-500/20' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/[0.04] dark:bg-amber-400/10', border: 'border-amber-500/20' },
    DONE: { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-500/[0.04] dark:bg-emerald-400/10', border: 'border-emerald-500/20' },
};

const toBackendStatus = (status: TaskStatus): 'todo' | 'in-progress' | 'done' =>
    status === 'TODO' ? 'todo' : status === 'IN_PROGRESS' ? 'in-progress' : 'done';

export const TaskDetail: React.FC = () => {
    const { workspaceId: workspaceIdParam, taskId: taskIdParam } = useParams<{ workspaceId: string; taskId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const taskId = Number(taskIdParam);
    const navigate = useNavigate();

    const { data: task, isLoading, refetch } = useTaskDetails(workspaceId, taskId);
    const { data: workspace } = useWorkspaceDetails(workspaceId);
    const { mutate: updateTask, isPending: isSaving } = useUpdateTask(taskId);
    const { mutate: updateTaskStatus, isPending: isSavingStatus } = useUpdateTaskStatus(workspaceId);
    const { mutate: deleteTask } = useDeleteTask(workspaceId);

    // --- Role detection ---
    const { data: userProfile } = useProfile();
    const currentUserId = userProfile?.userId ?? userProfile?.id;
    const { data: members } = useWorkspaceMembers(workspaceId);
    const currentMember = members?.find((m) => m.userId === currentUserId);
    const isMember = currentMember?.role?.toUpperCase() === 'MEMBER';
    const isOwnTask = task?.assignee?.id === currentUserId;

    const [isEditing, setIsEditing] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
    const [status, setStatus] = useState<TaskStatus>('TODO');
    const [dueDate, setDueDate] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);

    // --- Comments (moved above the early return — hooks must never be
    // called conditionally or after a conditional return) ---
    const { data: comments, isLoading: commentsLoading } = useComments(workspaceId, taskId);
    const { mutate: createComment, isPending: isPostingComment } = useCreateComment(workspaceId, taskId);
    const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment(workspaceId, taskId);
    const { mutate: deleteComment } = useDeleteComment(workspaceId, taskId);

    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    const resetFormFromTask = () => {
        if (!task) return;
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setStatus(task.status);
        setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    };

    useEffect(() => {
        resetFormFromTask();
    }, [task]);

    const startEditing = () => {
        if (isMember && !isOwnTask) return;
        resetFormFromTask();
        setSaveError(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        resetFormFromTask();
        setSaveError(null);
        setIsEditing(false);
    };

    const handleSave = () => {
        if (isMember) {
            setSaveError(null);
            updateTaskStatus(
                { taskId, status: toBackendStatus(status) },
                {
                    onSuccess: () => {
                        refetch();
                        setIsEditing(false);
                        setSavedFlash(true);
                        setTimeout(() => setSavedFlash(false), 1800);
                    },
                    onError: (err: any) => {
                        setSaveError(err?.response?.data?.message || "Couldn't update status.");
                    },
                }
            );
            return;
        }

        const trimmed = title.trim();
        if (!trimmed) {
            setSaveError("Task title can't be empty.");
            return;
        }
        setSaveError(null);
        updateTask(
            {
                workspaceId,
                title: trimmed,
                description: description.trim() || undefined,
                priority,
                status,
                dueDate: dueDate || undefined,
            },
            {
                onSuccess: () => {
                    refetch();
                    setIsEditing(false);
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 1800);
                },
                onError: (err: any) => {
                    setSaveError(err?.response?.data?.message || "Couldn't save task.");
                },
            }
        );
    };

    const handleDelete = () => {
        deleteTask(taskId, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                navigate(task?.project?.id ? `/workspaces/${workspaceId}/projects/${task.project.id}` : `/workspaces/${workspaceId}`);
            },
        });
    };

    const handlePostComment = () => {
        const trimmed = commentText.trim();
        if (!trimmed) {
            setCommentError("Comment can't be empty.");
            return;
        }
        setCommentError(null);
        createComment(trimmed, {
            onSuccess: () => setCommentText(''),
            onError: (err: any) => {
                setCommentError(err?.response?.data?.message || "Couldn't post comment.");
            },
        });
    };

    const startEditingComment = (c: { id: number; content: string }) => {
        setEditingCommentId(c.id);
        setEditingContent(c.content);
        setCommentError(null);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleUpdateComment = () => {
        const trimmed = editingContent.trim();
        if (!trimmed || editingCommentId === null) {
            setCommentError("Comment can't be empty.");
            return;
        }
        setCommentError(null);
        updateComment(
            { commentId: editingCommentId, content: trimmed },
            {
                onSuccess: () => {
                    setEditingCommentId(null);
                    setEditingContent('');
                },
                onError: (err: any) => {
                    setCommentError(err?.response?.data?.message || "Couldn't update comment.");
                },
            }
        );
    };

    const handleDeleteComment = () => {
        if (commentToDelete === null) return;
        deleteComment(commentToDelete, {
            onSuccess: () => setCommentToDelete(null),
            onError: () => setCommentToDelete(null),
        });
    };

    if (isLoading || !task) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                    <span className="font-mono-nav text-xs font-bold tracking-wider uppercase text-mint-700 dark:text-mint-400">
                        Loading Task...
                    </span>
                </div>
            </div>
        );
    }

    const pStyle = PRIORITY_STYLES[task.priority];
    const sStyle = STATUS_STYLES[task.status];
    const canEdit = !isMember || isOwnTask;
    const lockedFieldClasses = `font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 outline-none focus:ring-2 focus:ring-mint-600/20 focus:border-mint-600 dark:focus:border-mint-400${isMember ? ' opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="min-h-screen w-full bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Left: Back Button with Text instead of just Arrow + Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(task?.project?.id ? `/workspaces/${workspaceId}/projects/${task.project.id}` : `/workspaces/${workspaceId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-mint-700 dark:text-mint-400" />
                            <span>{task?.project?.name ? 'Back to Project' : 'Back to Workspace'}</span>
                        </button>

                        <div className="hidden sm:block space-y-0.5 border-l border-mint-900/10 dark:border-mint-300/15 pl-4">
                            <div className="font-mono-nav flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                <span>{workspace?.workspaceName || 'Workspace'}</span>
                                {task.project?.name && (
                                    <>
                                        <span>/</span>
                                        <span>{task.project.name}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="font-display text-base font-black tracking-tight text-mint-900 dark:text-mint-50">
                                {task.title}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                        {!isMember && (
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}/assign`)}
                                className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Icon icon="solar:users-group-rounded-bold" className="w-3.5 h-3.5 text-mint-400 dark:text-mint-950" />
                                <span>Assign</span>
                            </button>
                        )}
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-2xl mx-auto p-6 md:p-8 mt-4">
                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-6">

                    {/* ASSIGNEE SUMMARY */}
                    <div className="flex items-center justify-between p-3.5 bg-white/50 dark:bg-mint-900/40 rounded-2xl border border-mint-900/15 dark:border-mint-300/15 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-3 min-w-0">
                            {task.assignee ? (
                                <>
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
                                    <div className="min-w-0">
                                        <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50 truncate">
                                            {task.assignee.name}
                                        </p>
                                        <p className="font-mono-nav text-[10px] text-mint-800/60 dark:text-mint-300/60 truncate">
                                            {task.assignee.email}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="font-mono-nav text-xs font-bold text-mint-800/60 dark:text-mint-300/60">
                                    Nobody is assigned to this task yet.
                                </p>
                            )}
                        </div>
                        {!isMember && (
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}/assign`)}
                                className="font-mono-nav px-3 py-1.5 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 text-[11px] font-bold text-mint-900 dark:text-mint-50 rounded-xl transition-all cursor-pointer flex-shrink-0"
                            >
                                {task.assignee ? 'Reassign' : 'Assign'}
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <>
                            {/* --- EDIT FORM --- */}
                            {isMember && (
                                <p className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-700 dark:text-mint-400">
                                    You can only change the status of this task
                                </p>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isMember}
                                    className={lockedFieldClasses}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Add more detail..."
                                    disabled={isMember}
                                    className={`${lockedFieldClasses} resize-none placeholder:text-mint-800/40 dark:placeholder:text-mint-300/40`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                        className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 outline-none cursor-pointer"
                                    >
                                        <option value="TODO" className="bg-white dark:bg-mint-950">To Do</option>
                                        <option value="IN_PROGRESS" className="bg-white dark:bg-mint-950">In Progress</option>
                                        <option value="DONE" className="bg-white dark:bg-mint-950">Done</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                        Priority
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                        disabled={isMember}
                                        className={lockedFieldClasses}
                                    >
                                        <option value="LOW" className="bg-white dark:bg-mint-950">Low</option>
                                        <option value="MEDIUM" className="bg-white dark:bg-mint-950">Medium</option>
                                        <option value="HIGH" className="bg-white dark:bg-mint-950">High</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        disabled={isMember}
                                        className={lockedFieldClasses}
                                    />
                                </div>
                            </div>

                            {saveError && (
                                <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                    {saveError}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-mint-900/10 dark:border-mint-300/15">
                                {!isMember && (
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="font-mono-nav px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                                    >
                                        Delete Task
                                    </button>
                                )}
                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        onClick={cancelEditing}
                                        className="font-mono-nav px-4 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 text-xs font-bold text-mint-900 dark:text-mint-50 rounded-xl transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isMember ? isSavingStatus : isSaving}
                                        className="font-mono-nav px-5 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                    >
                                        {(isMember ? isSavingStatus : isSaving) ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* --- READ-ONLY VIEW --- */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-mono-nav px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`} />
                                    {sStyle.label}
                                </span>
                                <span className={`font-mono-nav px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                    {pStyle.label} priority
                                </span>
                                {task.dueDate && (
                                    <span className="font-mono-nav text-[11px] font-bold text-mint-800/60 dark:text-mint-300/60 flex items-center gap-1 ml-auto">
                                        <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5" />
                                        Due {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <p className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                                    Description
                                </p>
                                {task.description ? (
                                    <p className="font-mono-nav text-xs text-mint-900/80 dark:text-mint-100/80 leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="font-mono-nav text-xs text-mint-800/40 dark:text-mint-300/40 italic">
                                        No description yet.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-mint-900/10 dark:border-mint-300/15">
                                {!isMember && (
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="font-mono-nav px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                                    >
                                        Delete Task
                                    </button>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    {savedFlash && (
                                        <span className="font-mono-nav text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            Saved ✓
                                        </span>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={startEditing}
                                            className="font-mono-nav px-5 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                                            <span>{isMember ? 'Update Status' : 'Edit Task'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* --- COMMENTS (separate section, outside the task card) --- */}
                <div className="mt-6 bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-4">
                    <p className="font-mono-nav text-[10px] font-extrabold uppercase tracking-wider text-mint-800/60 dark:text-mint-300/60">
                        Comments
                    </p>

                    {commentsLoading ? (
                        <div className="flex items-center gap-2 text-mint-800/60 dark:text-mint-300/60">
                            <div className="w-4 h-4 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                            <span className="font-mono-nav text-xs">Loading comments...</span>
                        </div>
                    ) : comments && comments.length > 0 ? (
                        <div className="space-y-3">
                            {comments.map((c) => {
                                const isOwnComment = c.author.id === currentUserId;
                                const isEditingThis = editingCommentId === c.id;

                                return (
                                    <div
                                        key={c.id}
                                        className="flex items-start gap-3 p-3 bg-white/50 dark:bg-mint-900/40 rounded-xl border border-mint-900/10 dark:border-mint-300/15"
                                    >
                                        {c.author.avatar ? (
                                            <img
                                                src={c.author.avatar}
                                                alt={c.author.name}
                                                className="w-7 h-7 rounded-lg object-cover border border-mint-700/25 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/25 flex items-center justify-center text-mint-900 dark:text-mint-50 text-[10px] font-black uppercase shadow-inner flex-shrink-0">
                                                {c.author.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50 truncate">
                                                        {c.author.name}
                                                    </p>
                                                    <p className="font-mono-nav text-[10px] text-mint-800/40 dark:text-mint-300/40 flex-shrink-0">
                                                        {new Date(c.createdAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                {isOwnComment && !isEditingThis && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => startEditingComment(c)}
                                                            className="font-mono-nav px-2 py-1 text-[10px] font-bold text-mint-700 dark:text-mint-400 hover:bg-mint-900/5 dark:hover:bg-mint-300/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setCommentToDelete(c.id)}
                                                            className="font-mono-nav px-2 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isEditingThis ? (
                                                <div className="mt-1.5 flex flex-col gap-1.5">
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        rows={2}
                                                        className="font-mono-nav px-3 py-2 bg-white/60 dark:bg-mint-900/60 border border-mint-900/15 dark:border-mint-300/15 rounded-lg text-xs font-bold text-mint-900 dark:text-mint-50 outline-none resize-none focus:ring-2 focus:ring-mint-600/20 focus:border-mint-600 dark:focus:border-mint-400"
                                                    />
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={cancelEditingComment}
                                                            className="font-mono-nav px-3 py-1.5 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 text-[11px] font-bold text-mint-900 dark:text-mint-50 rounded-lg transition-all cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleUpdateComment}
                                                            disabled={isUpdatingComment}
                                                            className="font-mono-nav px-3 py-1.5 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-[11px] font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                                                        >
                                                            {isUpdatingComment ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="font-mono-nav text-xs text-mint-900/80 dark:text-mint-100/80 leading-relaxed whitespace-pre-wrap mt-0.5">
                                                    {c.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="font-mono-nav text-xs text-mint-800/40 dark:text-mint-300/40 italic">
                            No comments yet.
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={2}
                            placeholder="Write a comment..."
                            className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 outline-none resize-none placeholder:text-mint-800/40 dark:placeholder:text-mint-300/40 focus:ring-2 focus:ring-mint-600/20 focus:border-mint-600 dark:focus:border-mint-400"
                        />
                        {commentError && (
                            <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                                {commentError}
                            </p>
                        )}
                        <button
                            onClick={handlePostComment}
                            disabled={isPostingComment}
                            className="font-mono-nav self-end px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                            {isPostingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete task"
                message="This permanently deletes the task. This cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            <ConfirmModal
                isOpen={commentToDelete !== null}
                title="Delete comment"
                message="This permanently deletes the comment. This cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDeleteComment}
                onCancel={() => setCommentToDelete(null)}
            />
        </div>
    );
};