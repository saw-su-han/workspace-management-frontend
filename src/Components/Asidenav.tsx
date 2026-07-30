// src/components/AsideNav.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface AsideNavProps {
    workspaceId: number;
    projectId?: number;
}

interface NavItem {
    key: string;
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
    hint?: string;
}

export function AsideNav({ workspaceId, projectId }: AsideNavProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const hasProject = typeof projectId === 'number' && !isNaN(projectId);

    const items: NavItem[] = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'solar:widget-5-bold-duotone',
            path: '/dashboard',
        },
        {
            key: 'project',
            label: 'Project Detail',
            icon: 'solar:folder-bold-duotone',
            path: `/workspaces/${workspaceId}/projects/${projectId}`,
            disabled: !hasProject,
            hint: 'Open a project to enable this',
        },
        {
            key: 'assign',
            label: 'Assign Members',
            icon: 'solar:users-group-rounded-bold-duotone',
            path: `/workspaces/${workspaceId}/projects/${projectId}/assign`,
            disabled: !hasProject,
            hint: 'Open a project to enable this',
        },
        {
            key: 'invite',
            label: 'Invite Member',
            icon: 'solar:user-plus-bold-duotone',
            path: `/workspaces/${workspaceId}/invite`,
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex-col z-40">
            {/* Brand / Workspace tag */}
            <div className="h-16 md:h-20 flex flex-col justify-center px-5 border-b border-gray-200 dark:border-gray-800">
                <span className="font-mono-nav text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Workspace #{workspaceId}
                </span>
                <h2 className="font-display text-sm font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
                    Navigation
                </h2>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1.5">
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
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                                }`}
                        >
                            <Icon
                                icon={item.icon}
                                className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}
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
    );
}