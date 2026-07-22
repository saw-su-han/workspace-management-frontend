import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../Components/ConfirmModel';
import {
    type ProjectItem,
    type TaskItem,
    useTasksQuery,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    type TaskStatus,
    type TaskPriority,
} from '../hooks/useAuth';

const PRIORITY_STYLES: Record<TaskPriority, { label: string; text: string; bg: string; border: string }> = {
    LOW: { label: 'Low', text: 'text-sky-600 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-400/10', border: 'border-sky-200 dark:border-sky-400/20' },
    MEDIUM: { label: 'Medium', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-400/10', border: 'border-amber-200 dark:border-amber-400/20' },
    HIGH: { label: 'High', text: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-400/10', border: 'border-rose-200 dark:border-rose-400/20' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    TODO: { label: 'To Do', dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-400/10', border: 'border-slate-200 dark:border-slate-400/20' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-400/10', border: 'border-amber-200 dark:border-amber-400/20' },
    DONE: { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20' },
};

interface TaskBoardProps {
    workspaceId: number;
    projectId?: number;
    projects?: ProjectItem[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ workspaceId, projectId, projects }) => {
    const navigate = useNavigate();
    const isWorkspaceWide = !projectId;

    // --- LIST / FILTERS ---
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');

    const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = useTasksQuery({
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
            },
            {
                onSuccess: () => {
                    setNewTitle('');
                    setNewDescription('');
                    setNewPriority('MEDIUM');
                    setNewDueDate('');
                    setNewProjectId(projectId ?? '');
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
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState<TaskPriority>("MEDIUM");
    const [editStatus, setEditStatus] = useState<TaskStatus>("TODO");
    const [editDueDate, setEditDueDate] = useState("");
    const [editError, setEditError] = useState<string | null>(null);

    const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask(
        editingTask?.id ?? 0
    );

    const openEditTask = (task: TaskItem) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditPriority(task.priority);
        setEditStatus(task.status);
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
        setEditError(null);
    };

    const handleUpdateTask = () => {
        if (!editingTask) return;

        const trimmed = editTitle.trim();

        if (!trimmed) {
            setEditError("Task title can't be empty.");
            return;
        }

        updateTask(
            {
                workspaceId,
                title: trimmed,
                description: editDescription || undefined,
                priority: editPriority,
                status: editStatus,
                dueDate: editDueDate || undefined,
            },
            {
                onSuccess: () => {
                    setEditingTask(null);
                    refetchTasks();
                },
                onError: (err: any) => {
                    setEditError(
                        err?.response?.data?.message || "Couldn't update task."
                    );
                },
            }
        );
    };

    // --- DELETE ---
    const { mutate: deleteTask } = useDeleteTask(workspaceId);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    const confirmDeleteTask = () => {
        if (!taskToDelete) return;
        deleteTask(taskToDelete, {
            onSuccess: () => {
                setTaskToDelete(null);
                refetchTasks();
            },
        });
    };

    const projectNameFor = (pid: number) => projects?.find((p) => p.id === pid)?.name;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-extrabold tracking-tight text-sky-950 dark:text-cyan-50">
                        {isWorkspaceWide ? 'Workspace Tasks' : 'Project Tasks'}
                    </h2>
                    <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mt-1">
                        {isWorkspaceWide ? 'Every task across every project in this workspace.' : 'Tasks that belong to this project.'}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateFormOpen((prev) => !prev)}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
                >
                    <span className="text-sm font-light">+</span> {isCreateFormOpen ? 'Cancel' : 'Create Task'}
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="relative max-w-xs w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sky-400 dark:text-cyan-400/50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl outline-none text-sky-950 dark:text-cyan-50 placeholder:text-sky-400 dark:placeholder:text-cyan-400/30 focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {isWorkspaceWide && projects && projects.length > 0 && (
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-[#0a2f4e]/60 border border-sky-200 dark:border-cyan-400/15 text-sky-600 dark:text-cyan-300 outline-none"
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
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${statusFilter === s
                                ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-400/20'
                                : 'bg-white dark:bg-[#0a2f4e]/60 text-sky-500 dark:text-cyan-400/50 border-sky-200 dark:border-cyan-400/15'
                                }`}
                        >
                            {s === 'ALL' ? 'All' : STATUS_STYLES[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CREATE TASK FORM */}
            {isCreateFormOpen && (
                <div className="p-5 border border-cyan-300/50 dark:border-cyan-400/20 bg-cyan-50/50 dark:bg-cyan-400/[0.04] rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Task title"
                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all placeholder:text-sky-400 dark:placeholder:text-cyan-400/30"
                        />
                        <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Short description (optional)"
                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all placeholder:text-sky-400 dark:placeholder:text-cyan-400/30"
                        />
                        {isWorkspaceWide && (
                            <select
                                value={newProjectId}
                                onChange={(e) => setNewProjectId(e.target.value ? Number(e.target.value) : '')}
                                className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
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
                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                        >
                            <option value="LOW">Low priority</option>
                            <option value="MEDIUM">Medium priority</option>
                            <option value="HIGH">High priority</option>
                        </select>
                        <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                        />
                    </div>
                    {createError && <p className="text-[11px] text-rose-500 dark:text-rose-300 font-semibold">{createError}</p>}
                    <div className="flex justify-end">
                        <button
                            onClick={handleCreateTask}
                            disabled={isCreatingTask}
                            className="px-5 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20"
                        >
                            {isCreatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </div>
            )}

            {/* TASK LIST */}
            {isTasksLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin" />
                </div>
            ) : !tasks || tasks.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-sky-300/60 dark:border-cyan-400/20 rounded-3xl bg-sky-50/50 dark:bg-[#0a2f4e]/20">
                    <p className="text-xs text-sky-500/70 dark:text-cyan-400/50">No tasks yet — add the first one with "Create Task".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            workspaceId={workspaceId}
                            isWorkspaceWide={isWorkspaceWide}
                            projectName={task.projectId ? projectNameFor(task.projectId) : undefined}
                            onOpen={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}`)}
                            onEdit={() => openEditTask(task)}
                            onAssign={() => navigate(`/workspaces/${workspaceId}/tasks/${task.id}/assign`)}
                            onDeleteRequest={() => setTaskToDelete(task.id)}
                            onChanged={refetchTasks}
                        />
                    ))}
                </div>
            )}

            {/* EDIT TASK MODAL */}
            {editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg border border-sky-200 dark:border-cyan-400/20 bg-white dark:bg-[#051923] p-6 rounded-3xl shadow-xl space-y-4">
                        <h3 className="text-sm font-extrabold text-sky-950 dark:text-cyan-50">
                            Edit Task
                        </h3>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Task Title"
                                className="w-full px-3.5 py-2.5 bg-sky-50 dark:bg-[#0a2f4e]/50 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25"
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description"
                                rows={3}
                                className="w-full px-3.5 py-2.5 bg-sky-50 dark:bg-[#0a2f4e]/50 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 resize-none"
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                                    className="px-3 py-2 bg-sky-50 dark:bg-[#0a2f4e]/50 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                                <select
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                                    className="px-3 py-2 bg-sky-50 dark:bg-[#0a2f4e]/50 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="px-3 py-2 bg-sky-50 dark:bg-[#0a2f4e]/50 border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                />
                            </div>
                        </div>

                        {editError && (
                            <p className="text-[11px] text-rose-500 font-semibold">{editError}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-sky-600 dark:text-cyan-300 hover:bg-sky-100 dark:hover:bg-cyan-400/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateTask}
                                disabled={isUpdatingTask}
                                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                            >
                                {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!taskToDelete}
                title="Delete task"
                message="This permanently deletes the task. This cannot be undone."
                confirmLabel="Delete"
                onConfirm={confirmDeleteTask}
                onCancel={() => setTaskToDelete(null)}
            />
        </div>
    );
};

// --- ROW ---
interface TaskRowProps {
    task: TaskItem;
    workspaceId: number;
    isWorkspaceWide: boolean;
    projectName?: string;
    onOpen: () => void;
    onEdit: () => void;
    onAssign: () => void;
    onDeleteRequest: () => void;
    onChanged: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
    task,
    workspaceId,
    isWorkspaceWide,
    projectName,
    onOpen,
    onEdit,
    onAssign,
    onDeleteRequest,
    onChanged,
}) => {
    const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(task.id);
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const pStyle = PRIORITY_STYLES[priority];
    const sStyle = STATUS_STYLES[status];

    const handleStatusChange = (next: TaskStatus) => {
        const prev = status;
        setStatus(next);
        updateTask(
            { workspaceId, status: next },
            {
                onSuccess: () => { setUpdateError(null); onChanged(); },
                onError: (err: any) => {
                    setStatus(prev);
                    setUpdateError(err?.response?.data?.message || "Couldn't update status.");
                },
            }
        );
    };

    const handlePriorityChange = (next: TaskPriority) => {
        const prev = priority;
        setPriority(next);
        updateTask(
            { workspaceId, priority: next },
            {
                onSuccess: () => { setUpdateError(null); onChanged(); },
                onError: (err: any) => {
                    setPriority(prev);
                    setUpdateError(err?.response?.data?.message || "Couldn't update priority.");
                },
            }
        );
    };

    return (
        <div
            onClick={onOpen}
            className="group relative flex flex-col gap-2 p-4 border border-sky-200 dark:border-cyan-400/10 bg-white dark:bg-[#0a2f4e]/30 rounded-2xl hover:border-cyan-400/50 dark:hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-extrabold text-xs text-sky-950 dark:text-cyan-50 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                            {task.title}
                        </h3>
                        {isWorkspaceWide && projectName && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-sky-100 dark:bg-[#051923] text-sky-500 dark:text-cyan-400/60 flex-shrink-0">
                                {projectName}
                            </span>
                        )}
                    </div>
                    {task.description && (
                        <p className="text-[10px] text-sky-500/70 dark:text-cyan-400/50 truncate mt-0.5">{task.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {task.dueDate && (
                        <span className="text-[9px] font-bold text-sky-400 dark:text-cyan-400/40">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}

                    {/* Quick-edit priority */}
                    <select
                        value={priority}
                        disabled={isUpdating}
                        onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border outline-none disabled:opacity-50 ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>

                    {/* Quick-edit status */}
                    <select
                        value={status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border outline-none disabled:opacity-50 ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>

                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-1.5 hover:bg-sky-200 dark:hover:bg-cyan-400/10 text-xs rounded-lg"
                            title="Edit Task"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssign();
                            }}
                            className="p-1.5 hover:bg-sky-200 dark:hover:bg-cyan-400/10 text-xs rounded-lg"
                            title="Assign Task"
                        >
                            👥
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRequest();
                            }}
                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs rounded-lg text-rose-500"
                            title="Delete Task"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            {updateError && (
                <p className="text-[10px] text-rose-500 dark:text-rose-300 font-semibold" onClick={(e) => e.stopPropagation()}>
                    {updateError}
                </p>
            )}
        </div>
    );
};