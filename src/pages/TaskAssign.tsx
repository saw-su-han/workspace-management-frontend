import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { AsideNav } from '../Components/Asidenav';
import { ConfirmModal } from '../Components/ConfirmModel';
import {
    useTaskDetails,
    useWorkspaceMembers,
    useAssignTask
} from '../hooks/useAuth';

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

export const ThemeToggle: React.FC = () => {
    const storageKey = "theme_preference";

    const [isDark, setIsDark] = useState(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved !== null) {
                return saved === "dark";
            }
        } catch { }
        return document.body.classList.contains("dark");
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, isDark ? "dark" : "light");
        } catch { }

        if (isDark) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-amber-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-7.072 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
            )}
        </button>
    );
};

export const TaskAssign: React.FC = () => {
    const { workspaceId: workspaceIdParam, taskId: taskIdParam } = useParams<{ workspaceId: string; taskId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const taskId = Number(taskIdParam);
    const navigate = useNavigate();

    const { data: task, isLoading: isTaskLoading } = useTaskDetails(workspaceId, taskId);
    const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
    const { mutate: assignTask, isPending, isSuccess } = useAssignTask(workspaceId, taskId);

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const filteredMembers = members?.filter((member) => {
        const query = searchQuery.toLowerCase();
        const nameMatch = member.name?.toLowerCase().includes(query);
        const emailMatch = member.email?.toLowerCase().includes(query);
        return nameMatch || emailMatch;
    });

    // Use the presence of the assignee object itself, not just its id,
    // so a falsy-but-valid id (e.g. 0) can't silently break this check.
    const hasCurrentAssignee = Boolean(task?.assignee);
    const currentAssigneeId = task?.assignee?.id;

    const selectedMember = members?.find((m) => m.userId === selectedUserId);

    const handleAssignClick = () => {
        if (selectedUserId === null) {
            setError('Pick a member to assign.');
            return;
        }
        setError(null);
        setIsConfirmOpen(true);
    };

    const confirmAssign = () => {
        if (selectedUserId === null) return;
        assignTask(selectedUserId, {
            onSuccess: () => {
                setIsConfirmOpen(false);
                navigate(`/workspaces/${workspaceId}/tasks/${taskId}`);
            },
            onError: (err: any) => {
                setIsConfirmOpen(false);
                setError(err?.response?.data?.message || "Couldn't assign task.");
            }
        });
    };

    if (isTaskLoading || isMembersLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="font-mono-nav text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                        Loading Assignment...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={workspaceId} taskId={taskId} />
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

                        {/* Left: Back Button + Breadcrumbs */}
                        <div className="flex items-center gap-4">
                            {/* <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}`)}
                                className="font-mono-nav px-3.5 py-2 bg-gray-100 dark:bg-gray-900 hover:border-emerald-500/40 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Back to Task</span>
                            </button> */}

                            <div className="hidden sm:block space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-4">
                                <div className="font-mono-nav flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <span>Workspace #{workspaceId}</span>
                                    <span>/</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">Task Assignment</span>
                                </div>
                                <h1 className="font-display text-base font-extrabold tracking-tight text-gray-900 dark:text-white truncate max-w-md">
                                    {task?.title || `Task #${taskId}`}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2.5">
                            <ThemeToggle />
                            {/* <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${taskId}`)}
                                className="font-mono-nav px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Task Details
                            </button> */}
                        </div>

                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="max-w-xl mx-auto p-4 sm:p-6 md:p-8 mt-4 relative z-10">
                    <div className="mb-6">
                        <h1 className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
                            {hasCurrentAssignee ? 'Reassign Task' : 'Assign Task'}
                        </h1>
                        <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 truncate">
                            {hasCurrentAssignee ? 'Reassigning' : 'Assigning'}: <span className="text-gray-700 dark:text-gray-300 font-bold">{task?.title}</span>
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 md:p-8 shadow-lg backdrop-blur-xl space-y-4">

                        {/* Search Members */}
                        <div className="relative">
                            <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workspace members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full font-mono-nav pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Members List */}
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {filteredMembers && filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => {
                                    const isCurrentAssignee = currentAssigneeId === member.userId;
                                    const isSelected = selectedUserId === member.userId;

                                    return (
                                        <label
                                            key={member.userId}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${isSelected
                                                ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-500/10 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-emerald-500/40'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="assignee"
                                                checked={isSelected}
                                                onChange={() => setSelectedUserId(member.userId)}
                                                className="accent-emerald-600"
                                            />
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-600/40"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm flex-shrink-0">
                                                    {member.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-display text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {member.name}
                                                    </p>
                                                    {isCurrentAssignee && (
                                                        <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                    {member.email}
                                                </p>
                                            </div>
                                            <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                {member.role}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="font-mono-nav text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                                    No members found matching your search.
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{error}</span>
                            </p>
                        )}
                        {isSuccess && (
                            <p className="font-mono-nav text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                                <span>✓</span> Task assigned successfully.
                            </p>
                        )}

                        <button
                            onClick={handleAssignClick}
                            disabled={isPending || selectedUserId === null}
                            className="w-full font-mono-nav px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Icon icon="solar:user-check-rounded-bold-duotone" className="w-4 h-4" />
                            <span>{isPending ? 'Assigning...' : hasCurrentAssignee ? 'Confirm Reassignment' : 'Confirm Assignment'}</span>
                        </button>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    title={hasCurrentAssignee ? 'Reassign task' : 'Assign task'}
                    message={
                        hasCurrentAssignee
                            ? `Reassign this task from ${task?.assignee?.name || 'the current assignee'} to ${selectedMember?.name || 'this member'}?`
                            : `Assign this task to ${selectedMember?.name || 'this member'}?`
                    }
                    confirmLabel={isPending ? 'Assigning...' : hasCurrentAssignee ? 'Reassign' : 'Assign'}
                    cancelLabel="Cancel"
                    isDangerous={false}
                    isLoading={isPending}
                    onConfirm={confirmAssign}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            </div>
        </div>
    );
};