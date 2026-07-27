import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ConfirmModal } from '../Components/ConfirmModel';
import {
    type ProjectItem,
    useTasksQuery,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useWorkspaceMembers,
    useUpdateTaskStatus,
    useProfile,
    type TaskItem,
    type TaskStatus,
    type TaskPriority,
} from '../hooks/useAuth';

const PRIORITY_STYLES: Record<TaskPriority, { label: string; text: string; bg: string; border: string }> = {
    LOW: { label: 'Low', text: 'text-mint-800 dark:text-mint-300', bg: 'bg-mint-500/[0.04] dark:bg-mint-400/10', border: 'border-mint-900/15 dark:border-mint-300/15' },
    MEDIUM: { label: 'Medium', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/[0.04] dark:bg-amber-400/10', border: 'border-amber-500/20 dark:border-amber-400/20' },
    HIGH: { label: 'High', text: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-500/[0.04] dark:bg-rose-400/10', border: 'border-rose-500/20 dark:border-rose-400/20' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    TODO: { label: 'To Do', dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-500/[0.04] dark:bg-slate-400/10', border: 'border-slate-500/20 dark:border-slate-400/20' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/[0.04] dark:bg-amber-400/10', border: 'border-amber-500/20 dark:border-amber-400/20' },
    DONE: { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-500/[0.04] dark:bg-emerald-400/10', border: 'border-emerald-500/20 dark:border-emerald-400/20' },
};

interface TaskBoardProps {
    workspaceId: number;
    projectId?: number;
    projects?: ProjectItem[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ workspaceId, projectId, projects }) => {
    const navigate = useNavigate();
    const isWorkspaceWide = !projectId;

    const { data: userProfile } = useProfile();
    const currentUserId = userProfile?.userId ?? userProfile?.id;
    const { data: members } = useWorkspaceMembers(workspaceId);
    const currentMember = members?.find((m) => m.userId === currentUserId);
    const isMember = currentMember?.role?.toUpperCase() === 'MEMBER';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');

    const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useTasksQuery({
        workspaceId,
        projectId: projectId ?? (projectFilter === 'ALL' ? undefined : projectFilter),
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
    });

    // --- CREATE TASK (OWNER/ADMIN only) ---
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
    const [newDueDate, setNewDueDate] = useState('');
    const [newProjectId, setNewProjectId] = useState<number | ''>(projectId ?? '');
    const [newAssignedTo, setNewAssignedTo] = useState<number | ''>('');
    const [createError, setCreateError] = useState<string | null>(null);
    const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

    const handleCreateTask = () => {
        const trimmed = newTitle.trim();
        if (!trimmed) {
            setCreateError("Task title can't be empty.");
            return;
        }
        const targetProjectId = projectId ?? (newProjectId || undefined);
        if (!targetProjectId) {
            setCreateError('Choose a project for this task.');
            return;
        }
        setCreateError(null);
        createTask(
            {
                workspaceId,
                projectId: targetProjectId,
                title: trimmed,
                description: newDescription.trim() || undefined,
                priority: newPriority,
                dueDate: newDueDate || undefined,
                assignedTo: newAssignedTo || undefined,
            },
            {
                onSuccess: () => {
                    setNewTitle('');
                    setNewDescription('');
                    setNewPriority('MEDIUM');
                    setNewDueDate('');
                    setNewProjectId(projectId ?? '');
                    setNewAssignedTo('');
                    setIsCreateFormOpen(false);
                    refetchTasks();
                },
                onError: (err: any) => {
                    setCreateError(err?.response?.data?.message || "Couldn't create task.");
                },
            }
        );
    };

    // --- EDIT TASK ---
    const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM');
    const [editStatus, setEditStatus] = useState<TaskStatus>('TODO');
    const [editError, setEditError] = useState<string | null>(null);

    const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask(editingTask?.id ?? 0);
    const { mutate: updateTaskStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus(workspaceId);
    const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '');

    const isTaskOwnedByCurrentUser = (task: TaskItem) =>
        task.assignee?.id === currentUserId;

    const openEditTask = (task: TaskItem) => {
        if (isMember && !isTaskOwnedByCurrentUser(task)) return;

        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setEditDueDate(toDateInputValue(task.dueDate));
        setEditPriority(task.priority);
        setEditStatus(task.status);
        setEditError(null);
        setIsCreateFormOpen(false);
    };

    const toBackendStatus = (status: TaskStatus): 'todo' | 'in-progress' | 'done' =>
        status === 'TODO' ? 'todo' : status === 'IN_PROGRESS' ? 'in-progress' : 'done';

    const [memberStatusError, setMemberStatusError] = useState<string | null>(null);
    const handleMemberStatusChange = (taskId: number, status: TaskStatus) => {
        setMemberStatusError(null);
        updateTaskStatus(
            { taskId, status: toBackendStatus(status) },
            {
                onSuccess: () => refetchTasks(),
                onError: (err: any) => setMemberStatusError(err?.response?.data?.message || "Couldn't update status."),
            }
        );
    };

    const handleUpdateTask = () => {
        if (!editingTask) return;

        if (isMember) {
            setEditError(null);
            updateTaskStatus(
                { taskId: editingTask.id, status: toBackendStatus(editStatus) },
                {
                    onSuccess: () => {
                        setEditingTask(null);
                        refetchTasks();
                    },
                    onError: (err: any) => {
                        setEditError(err?.response?.data?.message || "Couldn't update status.");
                    },
                }
            );
            return;
        }

        const trimmed = editTitle.trim();
        if (!trimmed) {
            setEditError("Task title can't be empty.");
            return;
        }
        setEditError(null);

        updateTask(
            {
                workspaceId,
                title: trimmed,
                description: editDescription.trim() || undefined,
                dueDate: editDueDate || undefined,
                priority: editPriority,
                status: editStatus,
            },
            {
                onSuccess: () => {
                    setEditingTask(null);
                    refetchTasks();
                },
                onError: (err: any) => {
                    setEditError(err?.response?.data?.message || "Couldn't update task.");
                },
            }
        );
    };

    // --- DELETE TASK (OWNER/ADMIN only) ---
    const { mutate: deleteTask } = useDeleteTask(workspaceId);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    const confirmDeleteTask = () => {
        if (!taskToDelete) return;
        deleteTask(taskToDelete, {
            onSuccess: () => {
                setTaskToDelete(null);
                if (editingTask?.id === taskToDelete) setEditingTask(null);
                refetchTasks();
            },
        });
    };

    const projectNameFor = (pid: number) => projects?.find((p) => p.id === pid)?.name;

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={!!taskToDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                onConfirm={confirmDeleteTask}
                onCancel={() => setTaskToDelete(null)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-base font-extrabold tracking-tight text-mint-900 dark:text-mint-50">
                        {isWorkspaceWide ? 'Workspace Tasks' : 'Project Tasks'}
                    </h2>
                    <p className="font-mono-nav text-xs text-mint-800/60 dark:text-mint-300/60 mt-1">
                        {isMember
                            ? 'Tasks you can see. You can update the status of anything assigned to you.'
                            : isWorkspaceWide ? 'Every task across every project in this workspace.' : 'Tasks that belong to this project.'}
                    </p>
                </div>
                {!isMember && (
                    <button
                        onClick={() => {
                            setIsCreateFormOpen((prev) => !prev);
                            setEditingTask(null);
                        }}
                        className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 active:scale-95 text-mint-50 dark:text-mint-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-mint-500/20 flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                        <Icon icon={isCreateFormOpen ? "lucide:x" : "lucide:plus"} className="w-3.5 h-3.5" />
                        {isCreateFormOpen ? 'Cancel' : 'Create Task'}
                    </button>
                )}
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="relative max-w-xs w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-mint-800/50 dark:text-mint-300/50">
                        <Icon icon="lucide:search" className="w-3.5 h-3.5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl outline-none text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 focus:border-mint-600 focus:ring-4 focus:ring-mint-500/15 transition-all font-mono-nav"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {isWorkspaceWide && projects && projects.length > 0 && (
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 text-mint-900 dark:text-mint-50 outline-none cursor-pointer font-mono-nav"
                        >
                            <option value="ALL">All projects</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    )}
                    {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer font-mono-nav ${statusFilter === s
                                ? 'bg-mint-900 dark:bg-mint-400 text-mint-50 dark:text-mint-950 border-mint-900 dark:border-mint-400 shadow-sm'
                                : 'bg-white/50 dark:bg-mint-900/40 text-mint-800/70 dark:text-mint-300/70 border-mint-900/15 dark:border-mint-300/15 hover:border-mint-600'
                                }`}
                        >
                            {s === 'ALL' ? 'All' : STATUS_STYLES[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CREATE TASK FORM */}
            {!isMember && isCreateFormOpen && (
                <div className="p-5 border border-mint-700/30 bg-mint-500/[0.03] rounded-2xl space-y-3 backdrop-blur-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Task title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border bg-white/50 dark:bg-mint-900/40 border-mint-900/15 dark:border-mint-300/15 text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 focus:border-mint-600 focus:ring-4 focus:ring-mint-500/15 font-mono-nav"
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)..."
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border bg-white/50 dark:bg-mint-900/40 border-mint-900/15 dark:border-mint-300/15 text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 focus:border-mint-600 focus:ring-4 focus:ring-mint-500/15 font-mono-nav"
                        />
                        {isWorkspaceWide && (
                            <select
                                value={newProjectId}
                                onChange={(e) => setNewProjectId(e.target.value ? Number(e.target.value) : '')}
                                className="px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none cursor-pointer font-mono-nav"
                            >
                                <option value="">Choose project...</option>
                                {projects?.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                            className="w-full px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none cursor-pointer font-mono-nav"
                        >
                            <option value="LOW">Low Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="HIGH">High Priority</option>
                        </select>
                        <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border bg-white/50 dark:bg-mint-900/40 border-mint-900/15 dark:border-mint-300/15 text-mint-900 dark:text-mint-50 font-mono-nav"
                        />
                        <select
                            value={newAssignedTo}
                            onChange={(e) => setNewAssignedTo(e.target.value ? Number(e.target.value) : '')}
                            className="px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none cursor-pointer font-mono-nav"
                        >
                            <option value="">Assign to... (optional)</option>
                            {members?.map((m) => (
                                <option key={m.userId} value={m.userId}>{m.name} ({m.role})</option>
                            ))}
                        </select>
                    </div>
                    {createError && <p className="text-[11px] text-rose-500 font-semibold font-mono-nav">{createError}</p>}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsCreateFormOpen(false)}
                            className="font-mono-nav px-4 py-2 text-xs font-bold text-mint-900/70 dark:text-mint-300/70 hover:text-mint-900 dark:hover:text-mint-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateTask}
                            disabled={isCreatingTask}
                            className="font-mono-nav px-5 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-xs font-bold uppercase tracking-wide rounded-xl transition-all shadow-md shadow-mint-500/20 cursor-pointer"
                        >
                            {isCreatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </div>
            )}

            {memberStatusError && (
                <p className="text-[11px] text-rose-500 dark:text-rose-300 font-semibold font-mono-nav">{memberStatusError}</p>
            )}

            {/* TASK LIST */}
            {isTasksLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                </div>
            ) : !tasks || tasks.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-mint-900/15 dark:border-mint-300/20 rounded-3xl bg-white/30 dark:bg-mint-900/20">
                    <p className="font-mono-nav text-xs text-mint-900/60 dark:text-mint-100/60">No tasks yet{!isMember && ' — add the first one with "Create Task".'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {tasks.map((task) => {
                        const isEditingThis = editingTask?.id === task.id;
                        const isOwnTask = isTaskOwnedByCurrentUser(task);

                        if (isEditingThis) {
                            const lockedFieldClasses = `w-full px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none font-mono-nav${isMember ? ' opacity-50 cursor-not-allowed' : ''
                                }`;

                            return (
                                <div key={task.id} className="p-5 border border-mint-700/30 bg-mint-500/[0.05] rounded-2xl space-y-3 backdrop-blur-md">
                                    {isMember && (
                                        <p className="font-mono-nav text-[10px] font-bold text-mint-700 dark:text-mint-300 uppercase tracking-wide">
                                            You can only change the status of this task
                                        </p>
                                    )}
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        disabled={isMember}
                                        className={lockedFieldClasses}
                                    />
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        disabled={isMember}
                                        className={`${lockedFieldClasses} resize-none`}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <select
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                                            disabled={isMember}
                                            className={lockedFieldClasses}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                                            className="w-full px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none cursor-pointer font-mono-nav"
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                        <input
                                            type="date"
                                            value={editDueDate}
                                            onChange={(e) => setEditDueDate(e.target.value)}
                                            disabled={isMember}
                                            className={lockedFieldClasses}
                                        />
                                    </div>
                                    {editError && <p className="font-mono-nav text-[11px] text-rose-500 font-semibold">{editError}</p>}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingTask(null)}
                                            className="font-mono-nav px-3 py-1.5 text-xs text-mint-900/70 dark:text-mint-300/70 font-bold cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateTask}
                                            disabled={isMember ? isUpdatingStatus : isUpdatingTask}
                                            className="font-mono-nav px-4 py-1.5 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                                        >
                                            {(isMember ? isUpdatingStatus : isUpdatingTask) ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        const pStyle = PRIORITY_STYLES[task.priority];
                        const sStyle = STATUS_STYLES[task.status];
                        const taskProjectId = task.projectId;

                        return (
                            <div
                                key={task.id}
                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}`)}
                                className="group relative flex items-center justify-between gap-4 p-4 border border-mint-900/10 dark:border-mint-300/15 bg-white/60 dark:bg-mint-900/40 rounded-2xl hover:border-mint-700/50 hover:shadow-md transition-all cursor-pointer backdrop-blur-md"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h3 className="font-display text-xs font-extrabold text-mint-900 dark:text-mint-50 truncate group-hover:text-mint-700 dark:group-hover:text-mint-400 transition-colors">
                                            {task.title}
                                        </h3>
                                        {isWorkspaceWide && taskProjectId && projectNameFor(taskProjectId) && (
                                            <span className="font-mono-nav px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-mint-900/5 dark:bg-mint-300/10 text-mint-800/70 dark:text-mint-300/70 flex-shrink-0">
                                                {projectNameFor(taskProjectId)}
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className="font-mono-nav text-[10px] text-mint-900/60 dark:text-mint-100/60 truncate mt-0.5">{task.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {task.assignee ? (
                                        <div
                                            title={task.assignee.name}
                                            className="w-6 h-6 rounded-lg bg-gradient-to-tr from-mint-900 to-mint-600 flex-shrink-0 flex items-center justify-center text-[9px] font-black text-mint-50"
                                        >
                                            {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    ) : (
                                        <span className="font-mono-nav text-[9px] font-bold text-mint-800/40 dark:text-mint-300/40 italic">Unassigned</span>
                                    )}
                                    {task.dueDate && (
                                        <span className="font-mono-nav text-[9px] font-bold text-mint-800/50 dark:text-mint-300/50">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    <span className={`font-mono-nav px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                        {pStyle.label}
                                    </span>

                                    {isMember ? (
                                        isOwnTask ? (
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleMemberStatusChange(task.id, e.target.value as TaskStatus)}
                                                className={`font-mono-nav px-2 py-0.5 rounded-full text-[9px] font-extrabold border outline-none cursor-pointer ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}
                                            >
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="DONE">Done</option>
                                            </select>
                                        ) : (
                                            <span className={`font-mono-nav px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1.5 border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                                <span className={`w-1 h-1 rounded-full ${sStyle.dot}`} />
                                                {sStyle.label}
                                            </span>
                                        )
                                    ) : (
                                        <span className={`font-mono-nav px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1.5 border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                            <span className={`w-1 h-1 rounded-full ${sStyle.dot}`} />
                                            {sStyle.label}
                                        </span>
                                    )}

                                    <div className="flex gap-1 items-center ml-1">
                                        {(!isMember || isOwnTask) && (
                                            <button
                                                onClick={() => openEditTask(task)}
                                                className="p-1.5 bg-mint-900/5 dark:bg-mint-300/10 hover:bg-mint-900/10 dark:hover:bg-mint-300/20 text-mint-900 dark:text-mint-50 rounded-lg transition-colors border border-mint-900/10 dark:border-mint-300/15 flex items-center justify-center cursor-pointer"
                                                title="Edit Task"
                                            >
                                                <Icon icon="solar:pen-bold" className="w-3.5 h-3.5 text-mint-700 dark:text-mint-400" />
                                            </button>
                                        )}
                                        {!isMember && (
                                            <button
                                                onClick={() => setTaskToDelete(task.id)}
                                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors border border-rose-500/20 flex items-center justify-center cursor-pointer"
                                                title="Delete Task"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};