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
            <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex-col z-40">
                {/* Brand / Workspace tag */}
                <div className="h-16 md:h-20 flex flex-col justify-center px-5 border-b border-gray-200 dark:border-gray-800">
                    <span className="font-mono-nav text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Workspace #{workspaceId}
                    </span>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    {items.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.key}
                                type="button"
                                disabled={item.disabled}
                                title={item.disabled ? item.hint : undefined}
                                onClick={() => !item.disabled && navigate(item.path)}
                                className={`w-full font-mono-nav flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                                    ${item.disabled
                                        ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                                        : active
                                            ? 'bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white shadow-md shadow-mint-500/20'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                                    }`}
                            >
                                <Icon
                                    icon={item.icon}
                                    className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-mint-600 dark:text-mint-400'}`}
                                />
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="font-mono-nav text-[9px] text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                        v1.0 · Project Console
                    </p>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl flex items-center justify-around px-2 z-40">
                {items.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.key}
                            type="button"
                            disabled={item.disabled}
                            title={item.disabled ? item.hint : undefined}
                            onClick={() => !item.disabled && navigate(item.path)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer
                                ${item.disabled
                                    ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                                    : active
                                        ? 'text-mint-600 dark:text-mint-400 font-bold'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon
                                icon={item.icon}
                                className={`w-5 h-5 shrink-0 ${active ? 'scale-110 text-mint-600 dark:text-mint-400' : ''} transition-transform`}
                            />
                            <span className="font-mono-nav text-[9px] font-semibold mt-1 max-w-[56px] truncate">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}