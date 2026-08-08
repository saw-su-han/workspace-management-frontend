import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

interface AsideNavProps {
    workspaceId: number;
    projectId?: number;
    taskId?: number;
}

interface NavItem {
    key: string;
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
    hint?: string;
}

export function AsideNav({ workspaceId, projectId, taskId }: AsideNavProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const projectStorageKey = `lastProjectId:${workspaceId}`;
    const taskStorageKey = `lastTaskId:${workspaceId}`;

    const [rememberedProjectId, setRememberedProjectId] = useState<number | null>(null);
    const [rememberedTaskId, setRememberedTaskId] = useState<number | null>(null);

    // On mount (or workspace change), recall the last project and task visited in this workspace
    useEffect(() => {
        const storedProj = localStorage.getItem(projectStorageKey);
        const parsedProj = storedProj ? Number(storedProj) : NaN;
        setRememberedProjectId(!isNaN(parsedProj) ? parsedProj : null);

        const storedTask = localStorage.getItem(taskStorageKey);
        const parsedTask = storedTask ? Number(storedTask) : NaN;
        setRememberedTaskId(!isNaN(parsedTask) ? parsedTask : null);
    }, [projectStorageKey, taskStorageKey]);

    // Whenever we're on a page with a real projectId, remember it
    useEffect(() => {
        if (typeof projectId === 'number' && !isNaN(projectId)) {
            localStorage.setItem(projectStorageKey, String(projectId));
            setRememberedProjectId(projectId);
        }
    }, [projectId, projectStorageKey]);

    // Whenever we're on a page with a real taskId, remember it
    useEffect(() => {
        if (typeof taskId === 'number' && !isNaN(taskId)) {
            localStorage.setItem(taskStorageKey, String(taskId));
            setRememberedTaskId(taskId);
        }
    }, [taskId, taskStorageKey]);

    const effectiveProjectId =
        typeof projectId === 'number' && !isNaN(projectId) ? projectId : rememberedProjectId;

    const effectiveTaskId =
        typeof taskId === 'number' && !isNaN(taskId) ? taskId : rememberedTaskId;

    const hasProject = typeof effectiveProjectId === 'number' && !isNaN(effectiveProjectId);
    const hasTask = typeof effectiveTaskId === 'number' && !isNaN(effectiveTaskId);

    const items: NavItem[] = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'solar:widget-5-bold-duotone',
            path: `/workspaces/${workspaceId}`,
        },
        {
            key: 'project',
            label: 'Project Detail',
            icon: 'solar:folder-bold-duotone',
            path: `/workspaces/${workspaceId}/projects/${effectiveProjectId}`,
            disabled: !hasProject,
            hint: 'Open a project first to enable this',
        },
        {
            key: 'assign',
            label: 'Assign Members',
            icon: 'solar:users-group-rounded-bold-duotone',
            path: `/workspaces/${workspaceId}/projects/${effectiveProjectId}/assign`,
            disabled: !hasProject,
            hint: 'Open a project first to enable this',
        },
        {
            key: 'task-assign',
            label: 'Task Assign',
            icon: 'solar:user-check-bold-duotone',
            path: `/workspaces/${workspaceId}/tasks/${effectiveTaskId}/assign`,
            disabled: !hasTask,
            hint: 'Open a task first to enable this',
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c121e]/70 backdrop-blur-2xl flex-col z-40 transition-colors">
                {/* Brand / Workspace tag */}
                <div className="h-20 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mint-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-mint-500/20 glow-mint">
                            <Icon icon="solar:layers-bold-duotone" className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                Workspace Console
                            </span>
                            <span className="font-mono-nav text-[10px] font-semibold text-mint-600 dark:text-mint-400">
                                ID #{workspaceId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3.5 py-6 space-y-2 overflow-y-auto">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono-nav">
                        Navigation
                    </div>
                    {items.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.key}
                                type="button"
                                disabled={item.disabled}
                                title={item.disabled ? item.hint : undefined}
                                onClick={() => !item.disabled && navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative group
                                    ${item.disabled
                                        ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                                        : active
                                            ? 'bg-gradient-to-r from-mint-500/15 via-teal-500/10 to-transparent text-slate-900 dark:text-white font-bold border-l-2 border-mint-500 dark:border-mint-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    active
                                        ? 'bg-gradient-to-tr from-mint-600 to-teal-500 text-slate-950 shadow-md shadow-mint-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:text-mint-600 dark:group-hover:text-mint-400'
                                }`}>
                                    <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                                </div>
                                <span className="truncate flex-1 text-left">{item.label}</span>
                                {active && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse"></span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="font-mono-nav text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Workspace Console v2.0
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-2xl flex items-center justify-around px-3 z-50 shadow-2xl pb-safe">
                {items.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.key}
                            type="button"
                            disabled={item.disabled}
                            title={item.disabled ? item.hint : undefined}
                            onClick={() => !item.disabled && navigate(item.path)}
                            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer flex-1 max-w-[88px]
                                ${item.disabled
                                    ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                                    : active
                                        ? 'text-mint-600 dark:text-mint-400 font-bold bg-mint-500/10'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <Icon
                                icon={item.icon}
                                className={`w-5 h-5 shrink-0 ${active ? 'scale-110 text-mint-600 dark:text-mint-400' : ''} transition-transform`}
                            />
                            <span className="font-mono-nav text-[9px] font-semibold mt-1 w-full text-center truncate">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}