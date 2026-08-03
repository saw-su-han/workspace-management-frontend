import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ConfirmModal } from '../Components/ConfirmModel';
import { AsideNav } from '../Components/Asidenav';
import { ThemeToggle } from '../Components/ThemeToggle';
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

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

const PRIORITY_STYLES: Record<TaskPriority, { label: string; text: string; bg: string; border: string }> = {
    LOW: { label: 'Low', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800/60' },
    MEDIUM: { label: 'Medium', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800/60' },
    HIGH: { label: 'High', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800/60' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    TODO: { label: 'To Do', dot: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/40', border: 'border-gray-200 dark:border-gray-800' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800/60' },
    DONE: { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800/60' },
};

const toBackendStatus = (status: TaskStatus): 'todo' | 'in-progress' | 'done' =>
    status === 'TODO' ? 'todo' : status === 'IN_PROGRESS' ? 'in-progress' : 'done';

// Returns true if a comment has been edited since creation.
// Falls back gracefully if updatedAt isn't present on the type/data yet.
const isCommentEdited = (c: { createdAt: string; updatedAt?: string }): boolean => {
    if (!c.updatedAt) return false;
    const created = new Date(c.createdAt).getTime();
    const updated = new Date(c.updatedAt).getTime();
    // Small threshold to absorb sub-second precision differences some backends
    // introduce even on initial creation (e.g. separate createdAt/updatedAt writes).
    return updated - created > 1000;
};

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
    const [isResigning, setIsResigning] = useState(false);

    const handleResign = () => {
        setIsResigning(true);
        updateTask(
            { workspaceId, assignedTo: null },
            {
                onSuccess: () => {
                    setIsResigning(false);
                    refetch();
                },
                onError: (err: any) => {
                    setIsResigning(false);
                    setSaveError(err?.response?.data?.message || "Couldn't resign task.");
                },
            }
        );
    };

    // --- Comments ---
    const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useComments(workspaceId, taskId);
    const { mutate: createComment, isPending: isPostingComment } = useCreateComment(workspaceId, taskId);
    const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment(workspaceId, taskId);
    const { mutate: deleteComment } = useDeleteComment(workspaceId, taskId);

    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    // Optimistically mark comments as edited the instant a save succeeds,
    // so the "(edited)" tag shows before the refetch resolves.
    const [locallyEditedIds, setLocallyEditedIds] = useState<Set<number>>(new Set());

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
            onSuccess: () => {
                setCommentText('');
                refetchComments();
            },
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
        const idBeingEdited = editingCommentId;
        updateComment(
            { commentId: idBeingEdited, content: trimmed },
            {
                onSuccess: () => {
                    setLocallyEditedIds((prev) => new Set(prev).add(idBeingEdited));
                    setEditingCommentId(null);
                    setEditingContent('');
                    refetchComments();
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
            onSuccess: () => {
                setCommentToDelete(null);
                refetchComments();
            },
            onError: () => setCommentToDelete(null),
        });
    };

    if (isLoading || !task) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="font-mono-nav text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                        Loading Task...
                    </span>
                </div>
            </div>
        );
    }

    const pStyle = PRIORITY_STYLES[task.priority];
    const sStyle = STATUS_STYLES[task.status];
    const canEdit = !isMember || isOwnTask;
    const lockedFieldClasses = `px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500${isMember ? ' opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={workspaceId} projectId={task?.project?.id} />
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

                        {/* Left: Back Button & Breadcrumbs */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(task?.project?.id ? `/workspaces/${workspaceId}/projects/${task.project.id}` : `/workspaces/${workspaceId}`)}
                                className="font-mono-nav px-3.5 py-2 bg-gray-100 dark:bg-gray-900 hover:border-emerald-500/40 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{task?.project?.name ? 'Back to Project' : 'Back to Workspace'}</span>
                            </button>

                            <div className="hidden sm:block space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-4">
                                <div className="font-mono-nav flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <span>{workspace?.workspaceName || 'Workspace'}</span>
                                    {task.project?.name && (
                                        <>
                                            <span>/</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">{task.project.name}</span>
                                        </>
                                    )}
                                </div>
                                <h1 className="font-display text-base font-extrabold tracking-tight text-gray-900 dark:text-white truncate max-w-md">
                                    {task.title}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Actions & Theme Toggle */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {!isMember && (
                                <button
                                    onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}/assign`)}
                                    className="font-mono-nav px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Icon icon="solar:users-group-rounded-bold" className="w-3.5 h-3.5" />
                                    <span>Assign</span>
                                </button>
                            )}
                        </div>

                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 mt-4 relative z-10">
                    <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-6">

                        {/* ASSIGNEE SUMMARY */}
                        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                {task.assignee ? (
                                    <>
                                        {task.assignee.avatar ? (
                                            <img
                                                src={task.assignee.avatar}
                                                alt={task.assignee.name}
                                                className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-600/40 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm flex-shrink-0">
                                                {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-display text-xs font-bold text-gray-900 dark:text-white truncate">
                                                {task.assignee.name}
                                            </p>
                                            <p className="font-mono-nav text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                {task.assignee.email}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="font-mono-nav text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <Icon icon="solar:user-block-bold-duotone" className="w-4 h-4" />
                                        <span>Currently no user assigned</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {task.assignee && (
                                    <button
                                        onClick={handleResign}
                                        disabled={isResigning}
                                        className="font-mono-nav px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                        title="Resign assignment"
                                    >
                                        <Icon icon="solar:user-minus-bold-duotone" className="w-3.5 h-3.5" />
                                        <span>{isResigning ? 'Resigning...' : 'Resign'}</span>
                                    </button>
                                )}
                                {!isMember && (
                                    <button
                                        onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}/assign`)}
                                        className="font-mono-nav px-3 py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer flex-shrink-0"
                                    >
                                        {task.assignee ? 'Reassign' : 'Assign'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <>
                                {isMember && (
                                    <p className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                        You can only change the status of this task
                                    </p>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
                                    <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Add more detail..."
                                        disabled={isMember}
                                        className={`${lockedFieldClasses} resize-none placeholder:text-gray-400`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                            className="px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Priority
                                        </label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                            disabled={isMember}
                                            className={lockedFieldClasses}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
                                    <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-center gap-2">
                                        <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4 flex-shrink-0" />
                                        <span>{saveError}</span>
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                    {!isMember && (
                                        <button
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="font-mono-nav px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                            <span>Delete Task</span>
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button
                                            onClick={cancelEditing}
                                            className="font-mono-nav px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isMember ? isSavingStatus : isSaving}
                                            className="font-mono-nav px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Icon icon="solar:diskette-bold-duotone" className="w-3.5 h-3.5" />
                                            <span>{(isMember ? isSavingStatus : isSaving) ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-mono-nav px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`} />
                                        {sStyle.label}
                                    </span>
                                    <span className={`font-mono-nav px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                        {pStyle.label} priority
                                    </span>
                                    {task.dueDate && (
                                        <span className="font-mono-nav text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-auto">
                                            <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5" />
                                            Due {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <p className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Description
                                    </p>
                                    {task.description ? (
                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {task.description}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-600 italic">
                                            No description yet.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                    {!isMember && (
                                        <button
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="font-mono-nav px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                            <span>Delete Task</span>
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3 ml-auto">
                                        {savedFlash && (
                                            <span className="font-mono-nav text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Icon icon="solar:check-circle-bold-duotone" className="w-3.5 h-3.5" />
                                                <span>Saved</span>
                                            </span>
                                        )}
                                        {canEdit && (
                                            <button
                                                onClick={startEditing}
                                                className="font-mono-nav px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
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

                    {/* --- COMMENTS SECTION --- */}
                    <div className="mt-6 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-4">
                        <p className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Comments
                        </p>

                        {commentsLoading ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                                <span className="font-mono-nav text-xs font-medium">Loading comments...</span>
                            </div>
                        ) : comments && comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map((c) => {
                                    const isOwnComment = c.author.id === currentUserId;
                                    const isEditingThis = editingCommentId === c.id;
                                    const edited = isCommentEdited(c) || locallyEditedIds.has(c.id);

                                    return (
                                        <div
                                            key={c.id}
                                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-gray-200 dark:border-gray-800"
                                        >
                                            {c.author.avatar ? (
                                                <img
                                                    src={c.author.avatar}
                                                    alt={c.author.name}
                                                    className="w-7 h-7 rounded-lg object-cover border-2 border-emerald-600/40 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold uppercase flex-shrink-0">
                                                    {c.author.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <p className="font-display text-xs font-bold text-gray-900 dark:text-white truncate">
                                                            {c.author.name}
                                                        </p>
                                                        <p className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 flex items-center gap-1">
                                                            <span>
                                                                {edited && c.updatedAt
                                                                    ? new Date(c.updatedAt).toLocaleString()
                                                                    : new Date(c.createdAt).toLocaleString()}
                                                            </span>
                                                            {edited && (
                                                                <span
                                                                    className="italic text-gray-400 dark:text-gray-500"
                                                                    title={`Created ${new Date(c.createdAt).toLocaleString()}`}
                                                                >
                                                                    (edited)
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    {isOwnComment && !isEditingThis && (
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => startEditingComment(c)}
                                                                className="font-mono-nav px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setCommentToDelete(c.id)}
                                                                className="font-mono-nav px-2 py-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
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
                                                            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-900 dark:text-gray-100 outline-none resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                        />
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={cancelEditingComment}
                                                                className="font-mono-nav px-3 py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 rounded-lg transition-all cursor-pointer"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleUpdateComment}
                                                                disabled={isUpdatingComment}
                                                                className="font-mono-nav px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                                                            >
                                                                {isUpdatingComment ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mt-0.5">
                                                        {c.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="font-mono-nav text-xs text-gray-400 dark:text-gray-600 italic">
                                No comments yet.
                            </p>
                        )}

                        <div className="flex flex-col gap-1.5 pt-2">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={2}
                                placeholder="Write a comment..."
                                className="px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 outline-none resize-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {commentError && (
                                <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                                    {commentError}
                                </p>
                            )}
                            <button
                                onClick={handlePostComment}
                                disabled={isPostingComment}
                                className="font-mono-nav self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
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
        </div>
    );
};