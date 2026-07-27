// src/pages/NotificationsPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ConfirmModal } from '../Components/ConfirmModel';
import {
    useUserNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useClearAllNotifications,
} from '../hooks/useAuth';

export function NotificationsPage() {
    const { workspaceId: workspaceIdParam } = useParams<{ workspaceId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const navigate = useNavigate();

    // Turns "TASK_ASSIGNED" / "task_assigned" into "Task Assigned"
    const formatType = (type?: string) => {
        if (!type) return 'Notification';
        return type
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const { data: notifications, isLoading, refetch } = useUserNotifications(workspaceId);
    const { mutate: markAsRead } = useMarkNotificationAsRead(workspaceId);
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead(workspaceId);
    const { mutate: clearAll, isPending: isClearing } = useClearAllNotifications(workspaceId);

    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

    const list = Array.isArray(notifications) ? notifications : [];
    const unreadCount = list.filter((n: any) => !n.isRead).length;

    const handleMarkAllRead = () => {
        markAllAsRead(undefined, {
            onSuccess: () => refetch(),
        });
    };

    const handleClearAll = () => {
        clearAll(undefined, {
            onSuccess: () => {
                setIsClearConfirmOpen(false);
                refetch();
            },
        });
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300">

            {/* Top Navigation Bar */}
            <nav className="border-b border-mint-900/10 dark:border-mint-300/15 bg-white/80 dark:bg-mint-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-mint-700 dark:text-mint-400" />
                            <span>Back to Workspace</span>
                        </button>

                        <div className="hidden sm:block space-y-0.5 border-l border-mint-900/10 dark:border-mint-300/15 pl-4">
                            <h1 className="font-display text-base font-black tracking-tight text-mint-900 dark:text-mint-50 flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-3xl mx-auto p-6 md:p-8">

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-3 mb-5">
                    <p className="font-mono-nav text-xs text-mint-900/60 dark:text-mint-100/60">
                        {list.length} notification{list.length === 1 ? '' : 's'} total
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAll || unreadCount === 0}
                            className="font-mono-nav px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 disabled:opacity-40 text-mint-900 dark:text-mint-50 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            <Icon icon="solar:check-read-bold-duotone" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
                        </button>
                        <button
                            onClick={() => setIsClearConfirmOpen(true)}
                            disabled={isClearing || list.length === 0}
                            className="font-mono-nav px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                            Clear all
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl shadow-sm backdrop-blur-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center p-12">
                            <Icon icon="solar:bell-off-bold-duotone" className="w-8 h-8 mx-auto text-mint-800/30 dark:text-mint-300/30 mb-3" />
                            <p className="font-display font-bold text-sm text-mint-900 dark:text-mint-50">No notifications</p>
                            <p className="font-mono-nav text-xs text-mint-800/50 dark:text-mint-300/50 mt-1">You're all caught up.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-mint-900/10 dark:divide-mint-300/10">
                            {list.map((item: any, index: number) => (
                                <div
                                    key={item.notification?.id ?? index}
                                    className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors ${!item.isRead ? 'bg-mint-500/[0.04] dark:bg-mint-400/[0.05]' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!item.isRead ? 'bg-mint-600 dark:bg-mint-400' : 'bg-transparent'
                                            }`} />
                                        <div>
                                            <p className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">
                                                {formatType(item.notification?.type)}
                                            </p>
                                            <p className="font-mono-nav text-[11px] text-mint-900/70 dark:text-mint-100/80 mt-0.5">
                                                {item.notification?.message || 'New update in workspace'}
                                            </p>
                                            {item.notification?.createdAt && (
                                                <p className="font-mono-nav text-[10px] text-mint-800/40 dark:text-mint-300/40 mt-1">
                                                    {new Date(item.notification.createdAt).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!item.isRead && (
                                        <button
                                            onClick={() => markAsRead(item.notification.id, { onSuccess: () => refetch() })}
                                            className="font-mono-nav text-[10px] font-bold text-mint-600 dark:text-mint-400 hover:underline flex-shrink-0 cursor-pointer"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isClearConfirmOpen}
                title="Clear All Notifications"
                message="This will permanently remove every notification in this workspace. This action cannot be undone."
                confirmLabel="Clear All"
                cancelLabel="Cancel"
                isDangerous={true}
                isLoading={isClearing}
                onConfirm={handleClearAll}
                onCancel={() => setIsClearConfirmOpen(false)}
            />
        </div>
    );
}