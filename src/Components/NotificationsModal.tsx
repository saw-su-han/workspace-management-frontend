// src/pages/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ConfirmModal } from '../Components/ConfirmModel';
import { ThemeToggle } from '../Components/ThemeToggle';
import {
    useUserNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useClearAllNotifications,
} from '../hooks/useAuth';

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

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

    // Initialize local overrides from sessionStorage so they persist when navigating between pages
    const storageKey = `notificationOverrides_${workspaceId}`;
    const [readOverrides, setReadOverrides] = useState<Record<number, boolean>>(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Save overrides to sessionStorage whenever they change
    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(readOverrides));
        } catch (e) {
            console.error(e);
        }
    }, [readOverrides, storageKey]);

    const rawList = Array.isArray(notifications) ? notifications : [];

    // Merge server data with local optimistic state overrides
    const list = rawList.map((item: any) => {
        const id = item.notification?.id ?? item.id;
        if (readOverrides[id] !== undefined) {
            return {
                ...item,
                isRead: readOverrides[id],
                notification: item.notification ? { ...item.notification, isRead: readOverrides[id] } : undefined
            };
        }
        return item;
    });

    const unreadCount = Array.isArray(list)
        ? list.filter((n: any) => {
            const isRead = n.isRead ?? n.notification?.isRead;
            return isRead === false || isRead === undefined;
        }).length
        : 0;

    const updateUnreadCountInStorageAndDispatch = (newOverrides: Record<number, boolean>) => {
        setReadOverrides(newOverrides);
        window.dispatchEvent(new Event('notificationsUpdated'));
    };

    const handleMarkAllRead = () => {
        markAllAsRead(undefined, {
            onSuccess: () => {
                const allReadMap: Record<number, boolean> = {};
                list.forEach((item: any) => {
                    const id = item.notification?.id ?? item.id;
                    if (id !== undefined) allReadMap[id] = true;
                });
                updateUnreadCountInStorageAndDispatch(allReadMap);
                refetch();
            },
        });
    };

    const handleSingleMarkRead = (notificationId: number) => {
        const updatedOverrides = { ...readOverrides, [notificationId]: true };
        updateUnreadCountInStorageAndDispatch(updatedOverrides);

        markAsRead(notificationId, {
            onSuccess: () => {
                refetch();
            },
            onError: () => {
                const reverted = { ...readOverrides };
                delete reverted[notificationId];
                updateUnreadCountInStorageAndDispatch(reverted);
            }
        });
    };

    const handleClearAll = () => {
        clearAll(undefined, {
            onSuccess: () => {
                setIsClearConfirmOpen(false);
                updateUnreadCountInStorageAndDispatch({});
                sessionStorage.removeItem(storageKey);
                refetch();
            },
        });
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 font-sans antialiased relative overflow-x-hidden">
            <FontFaces />

            {/* Subtle grid pattern background */}
            <div
                className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.2) 1px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />
            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-teal-600/10 dark:bg-teal-600/5 blur-[180px] rounded-full pointer-events-none" />

            {/* Top Navigation Bar */}
            <nav className="h-18 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl sticky top-0 z-40 px-4 md:px-8 flex items-center transition-colors">
                <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4">

                    {/* Left: Back Button & Header */}
                    <div className="flex items-center gap-3.5 min-w-0">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                            className="font-mono-nav px-3.5 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm cursor-pointer flex items-center gap-2 flex-shrink-0"
                        >
                            <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Back to Workspace</span>
                        </button>

                        <div className="hidden sm:flex flex-col border-l border-gray-200 dark:border-gray-800 pl-4 min-w-0">
                            <h1 className="font-display text-sm md:text-base font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Theme Toggle */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <ThemeToggle />
                    </div>

                </div>
            </nav>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                {/* Notification Control Card */}
                <div className="rounded-3xl bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm dark:shadow-none backdrop-blur-2xl relative overflow-hidden space-y-6">

                    {/* Decorative top accent glow border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-80" />

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-6">
                        <div>
                            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Workspace Activity Stream
                            </h2>
                            <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'No unread notifications'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll || unreadCount === 0}
                                className="flex-1 sm:flex-none font-mono-nav px-3.5 py-2.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 disabled:opacity-40 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                {isMarkingAll ? 'Marking...' : 'Mark all read'}
                            </button>
                            <button
                                onClick={() => setIsClearConfirmOpen(true)}
                                disabled={isClearing || list.length === 0}
                                className="flex-1 sm:flex-none font-mono-nav px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                Clear all
                            </button>
                        </div>
                    </div>

                    {/* Notifications List Container */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                                <span className="font-mono-nav text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                    Loading notifications...
                                </span>
                            </div>
                        ) : list.length === 0 ? (
                            <div className="text-center p-12">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600 mx-auto mb-3 shadow-inner">
                                    <Icon icon="solar:bell-off-bold-duotone" className="w-6 h-6" />
                                </div>
                                <p className="font-display font-bold text-sm text-gray-900 dark:text-white">No notifications</p>
                                <p className="font-mono-nav text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-800/80">
                                {list.map((item: any, index: number) => {
                                    const isItemRead = item.isRead ?? item.notification?.isRead;
                                    const notificationId = item.notification?.id ?? item.id;

                                    return (
                                        <div
                                            key={notificationId ?? index}
                                            className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors ${!isItemRead ? 'bg-emerald-500/[0.04] dark:bg-emerald-400/[0.05]' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/40'}`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${!isItemRead ? 'bg-emerald-500 animate-pulse' : 'bg-transparent'}`} />
                                                <div className="space-y-0.5">
                                                    <p className="font-display text-xs font-bold text-gray-900 dark:text-white">
                                                        {formatType(item.notification?.type ?? item.type)}
                                                    </p>
                                                    <p className="font-mono-nav text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {item.notification?.message || item.message || 'New update in workspace'}
                                                    </p>
                                                    {(item.notification?.createdAt || item.createdAt) && (
                                                        <p className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                            {new Date(item.notification?.createdAt || item.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {!isItemRead && (
                                                <button
                                                    onClick={() => handleSingleMarkRead(notificationId)}
                                                    className="font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0 cursor-pointer px-2 py-1 rounded-md bg-emerald-500/10"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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