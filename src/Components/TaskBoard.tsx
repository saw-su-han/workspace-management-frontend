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

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

const PRIORITY_STYLES: Record<TaskPriority, { label: string; text: string; bg: string; border: string }> = {
    LOW: { label: 'Low', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    MEDIUM: { label: 'Medium', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    HIGH: { label: 'High', text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    TODO: { label: 'To Do', dot: 'bg-slate-400', text: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    DONE: { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
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

    // --- CREATE TASK ---
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

    const isTaskOwnedByCurrentUser = (task: TaskItem) => task.assignee?.id === currentUserId;

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

    // --- DELETE TASK ---
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
        <div className="min-h-screen w-full bg-slate-50/60 dark:bg-gray-950 font-sans">
            <div className="w-full text-gray-900 dark:text-gray-50 transition-colors duration-300 antialiased relative overflow-x-hidden flex flex-col min-h-screen">
                <FontFaces />

                {/* Background Styling */}
                <div
                    className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.2) 1px, transparent 0)',
                        backgroundSize: '36px 36px'
                    }}
                />
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-teal-600/10 dark:bg-teal-600/5 blur-[180px] rounded-full pointer-events-none" />


                {/* Main Content Container */}
                <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6 flex-1">

                    <ConfirmModal
                        isOpen={!!taskToDelete}
                        title="Delete Task"
                        message="Are you sure you want to delete this task? This action cannot be undone."
                        onConfirm={confirmDeleteTask}
                        onCancel={() => setTaskToDelete(null)}
                    />

                    {/* Header info banner / description */}
                    <div className="rounded-3xl bg-white/90 dark:bg-gray-900/70 border border-slate-200/80 dark:border-gray-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="font-display text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {isWorkspaceWide ? 'Workspace Wide Tasks' : 'Project Assignment Board'}
                            </h2>
                            <p className="font-mono-nav text-xs text-slate-500 dark:text-gray-400 mt-1">
                                {isMember
                                    ? 'Tasks you can view. You can update the status of items assigned directly to you.'
                                    : isWorkspaceWide ? 'Manage every task across every project in this workspace.' : 'Manage and monitor tasks specific to this project.'}
                            </p>
                        </div>
                        {!isMember && (
                            <button
                                onClick={() => {
                                    setIsCreateFormOpen((prev) => !prev);
                                    setEditingTask(null);
                                }}
                                className="md:hidden font-mono-nav px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Icon icon={isCreateFormOpen ? "solar:close-circle-bold" : "solar:add-circle-bold"} className="w-4 h-4 text-white" />
                                {isCreateFormOpen ? 'Close Form' : 'Create New Task'}
                            </button>
                        )}
                    </div>

                    {/* FILTER & SEARCH BAR */}
                    <div className="rounded-3xl bg-white/90 dark:bg-gray-900/70 border border-slate-200/80 dark:border-gray-800 p-4 sm:p-5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3.5 justify-between">
                        <div className="relative flex-1 max-w-md w-full">
                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
                                <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tasks by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl outline-none text-gray-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono-nav shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {isWorkspaceWide && projects && projects.length > 0 && (
                                <select
                                    value={projectFilter}
                                    onChange={(e) => setProjectFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                                    className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 outline-none cursor-pointer font-mono-nav shadow-sm"
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
                                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer font-mono-nav shadow-sm ${statusFilter === s
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                                        : 'bg-slate-50/80 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-800 hover:border-emerald-500/50'
                                        }`}
                                >
                                    {s === 'ALL' ? 'All Status' : STATUS_STYLES[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CREATE TASK FORM MODAL/EXPANDABLE PANEL */}
                    {!isMember && isCreateFormOpen && (
                        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 space-y-5 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4">
                                <h3 className="font-display text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icon icon="solar:add-square-bold-duotone" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    Create New Task
                                </h3>
                                <button
                                    onClick={() => setIsCreateFormOpen(false)}
                                    className="p-1 rounded-xl text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                >
                                    <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Implement user authentication flow"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl text-xs outline-none border bg-slate-50/80 dark:bg-gray-900/80 border-slate-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono-nav shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Description (Optional)</label>
                                    <textarea
                                        placeholder="Add context or acceptance criteria..."
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-2xl text-xs outline-none border bg-slate-50/80 dark:bg-gray-900/80 border-slate-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono-nav shadow-sm resize-none"
                                    />
                                </div>

                                {isWorkspaceWide && (
                                    <div className="space-y-1.5">
                                        <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Project</label>
                                        <select
                                            value={newProjectId}
                                            onChange={(e) => setNewProjectId(e.target.value ? Number(e.target.value) : '')}
                                            className="w-full px-4 py-3 bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs text-gray-900 dark:text-white outline-none cursor-pointer font-mono-nav shadow-sm"
                                        >
                                            <option value="">Select target project...</option>
                                            {projects?.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Priority Level</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                                        className="w-full px-4 py-3 bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs text-gray-900 dark:text-white outline-none cursor-pointer font-mono-nav shadow-sm"
                                    >
                                        <option value="LOW">Low Priority</option>
                                        <option value="MEDIUM">Medium Priority</option>
                                        <option value="HIGH">High Priority</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Due Date</label>
                                    <input
                                        type="date"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl text-xs outline-none border bg-slate-50/80 dark:bg-gray-900/80 border-slate-200 dark:border-gray-800 text-gray-900 dark:text-white font-mono-nav shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400 dark:text-gray-500">Assignee</label>
                                    <select
                                        value={newAssignedTo}
                                        onChange={(e) => setNewAssignedTo(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full px-4 py-3 bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs text-gray-900 dark:text-white outline-none cursor-pointer font-mono-nav shadow-sm"
                                    >
                                        <option value="">Unassigned</option>
                                        {members?.map((m) => (
                                            <option key={m.userId} value={m.userId}>{m.name} ({m.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {createError && <p className="text-xs text-rose-500 font-semibold font-mono-nav bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{createError}</p>}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsCreateFormOpen(false)}
                                    className="font-mono-nav px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={isCreatingTask}
                                    className="font-mono-nav px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                                >
                                    <span>{isCreatingTask ? 'Creating...' : 'Confirm & Create'}</span>
                                    <Icon icon="solar:check-read-bold" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {memberStatusError && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold font-mono-nav bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{memberStatusError}</p>
                    )}

                    {/* TASK LIST CONTAINER */}
                    {isTasksLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative flex h-16 w-16 items-center justify-center">
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-40" fill="none">
                                    <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-emerald-500" strokeWidth="2" strokeDasharray="4 8" />
                                </svg>
                                <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-emerald-500/30">✦</div>
                            </div>
                        </div>
                    ) : !tasks || tasks.length === 0 ? (
                        <div className="text-center p-16 border border-dashed border-slate-200 dark:border-gray-800 rounded-3xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-inner">
                                <Icon icon="solar:clipboard-remove-bold-duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-1">No tasks found</h3>
                            <p className="font-mono-nav text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                                {isMember ? 'No tasks are currently assigned to you or matching your filters.' : 'Get started by creating your first task above.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {tasks.map((task) => {
                                const isEditingThis = editingTask?.id === task.id;
                                const isOwnTask = isTaskOwnedByCurrentUser(task);

                                if (isEditingThis) {
                                    const inputCls = `w-full px-4 py-3 bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs text-gray-900 dark:text-white outline-none font-mono-nav shadow-sm${isMember ? ' opacity-50 cursor-not-allowed' : ''}`;

                                    return (
                                        <div key={task.id} className="p-6 border border-emerald-500/30 bg-white dark:bg-gray-900 rounded-3xl space-y-4 shadow-xl backdrop-blur-md">
                                            {isMember && (
                                                <p className="font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                                                    Member permission: You can only update the status of this task.
                                                </p>
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400">Title</label>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    disabled={isMember}
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400">Description</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows={2}
                                                    disabled={isMember}
                                                    className={`${inputCls} resize-none`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400">Priority</label>
                                                    <select
                                                        value={editPriority}
                                                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                                                        disabled={isMember}
                                                        className={inputCls}
                                                    >
                                                        <option value="LOW">Low</option>
                                                        <option value="MEDIUM">Medium</option>
                                                        <option value="HIGH">High</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400">Status</label>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                                                        className="w-full px-4 py-3 bg-slate-50/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs text-gray-900 dark:text-white outline-none cursor-pointer font-mono-nav shadow-sm"
                                                    >
                                                        <option value="TODO">To Do</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="DONE">Done</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="font-mono-nav text-[10px] font-extrabold uppercase text-slate-400">Due Date</label>
                                                    <input
                                                        type="date"
                                                        value={editDueDate}
                                                        onChange={(e) => setEditDueDate(e.target.value)}
                                                        disabled={isMember}
                                                        className={inputCls}
                                                    />
                                                </div>
                                            </div>
                                            {editError && <p className="font-mono-nav text-xs text-rose-500 font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{editError}</p>}
                                            <div className="flex justify-end gap-2.5 pt-2">
                                                <button
                                                    onClick={() => setEditingTask(null)}
                                                    className="font-mono-nav px-4 py-2.5 text-xs text-slate-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateTask}
                                                    disabled={isMember ? isUpdatingStatus : isUpdatingTask}
                                                    className="font-mono-nav px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                                                >
                                                    {(isMember ? isUpdatingStatus : isUpdatingTask) ? "Saving..." : "Save Changes"}
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
                                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-slate-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 rounded-3xl hover:border-emerald-500/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all cursor-pointer backdrop-blur-2xl"
                                    >
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                                <h3 className="font-display text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {task.title}
                                                </h3>
                                                {isWorkspaceWide && taskProjectId && projectNameFor(taskProjectId) && (
                                                    <span className="font-mono-nav px-2.5 py-0.5 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-700 flex-shrink-0">
                                                        {projectNameFor(taskProjectId)}
                                                    </span>
                                                )}
                                            </div>
                                            {task.description && (
                                                <p className="font-mono-nav text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2.5">
                                                {task.assignee ? (
                                                    <div
                                                        title={task.assignee.name}
                                                        className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                                    >
                                                        {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                ) : (
                                                    <span className="font-mono-nav text-[10px] font-bold text-slate-400 dark:text-gray-500 italic">Unassigned</span>
                                                )}
                                                {task.dueDate && (
                                                    <span className="font-mono-nav text-[10px] font-bold text-slate-500 dark:text-gray-400 flex items-center gap-1 bg-slate-100 dark:bg-gray-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-gray-700">
                                                        <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <span className={`font-mono-nav px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                                    {pStyle.label}
                                                </span>

                                                {isMember ? (
                                                    isOwnTask ? (
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleMemberStatusChange(task.id, e.target.value as TaskStatus)}
                                                            className={`font-mono-nav px-2.5 py-1 rounded-xl text-[10px] font-extrabold border outline-none cursor-pointer ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}
                                                        >
                                                            <option value="TODO">To Do</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="DONE">Done</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`font-mono-nav px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`} />
                                                            {sStyle.label}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className={`font-mono-nav px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`} />
                                                        {sStyle.label}
                                                    </span>
                                                )}

                                                {(!isMember || isOwnTask) && (
                                                    <button
                                                        onClick={() => openEditTask(task)}
                                                        className="p-2 bg-slate-100 dark:bg-gray-800 hover:bg-emerald-500/10 text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-200 dark:border-gray-700 flex items-center justify-center cursor-pointer shadow-sm"
                                                        title="Edit task"
                                                    >
                                                        <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {!isMember && (
                                                    <button
                                                        onClick={() => setTaskToDelete(task.id)}
                                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                        title="Delete task"
                                                    >
                                                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
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
            </div>
        </div>
    );
};