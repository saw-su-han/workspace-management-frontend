import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';
import { useProfile, useWorkspaceDetails, useDashboard, useDashboardMember } from '../hooks/useAuth';

const StatCard: React.FC<{
    icon: string;
    label: string;
    value: number | string;
    accent?: string;
}> = ({ icon, label, value, accent = 'text-emerald-600 dark:text-emerald-400' }) => (
    <div className="relative rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 shadow-lg overflow-hidden backdrop-blur-xl flex items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 relative z-10">
            <Icon icon={icon} className={`w-5 h-5 ${accent}`} />
        </div>
        <div className="relative z-10">
            <p className="font-mono-nav text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {label}
            </p>
            <p className="font-display font-extrabold text-xl text-gray-900 dark:text-white mt-0.5">
                {value}
            </p>
        </div>
    </div>
);

export const WorkspaceDashboard: React.FC = () => {
    const { workspaceId: workspaceIdParam } = useParams<{ workspaceId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const navigate = useNavigate();

    const { data: userProfile } = useProfile();
    const { data: workspace } = useWorkspaceDetails(workspaceId);

    const {
        data: adminStats,
        isLoading: isAdminLoading,
        isError: isAdminError,
    } = useDashboard(workspaceId);

    const [page, setPage] = useState(1);
    const {
        data: myStats,
        isLoading: isMyStatsLoading,
    } = useDashboardMember(workspaceId, page, 5);

    const isAdmin = !isAdminError && !!adminStats;

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300 flex flex-col antialiased relative overflow-x-hidden font-sans">
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

            <header className="h-16 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-shrink-0">
                    <button
                        onClick={() => navigate(`/workspaces/${workspaceId}`)}
                        className="font-mono-nav text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <span>←</span> Back to Workspace
                    </button>
                    <span className="font-display font-extrabold text-sm md:text-base tracking-tight text-gray-900 dark:text-white hidden sm:inline">
                        {workspace?.name || workspace?.workspaceName} · Dashboard
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <UserAvatar userProfile={userProfile} className="h-9 w-9 rounded-full object-cover border-2 border-emerald-600/50 shadow-sm" />
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 relative z-10 space-y-10">

                {isAdmin && (
                    <section className="space-y-4">
                        <div>
                            <h2 className="font-display font-extrabold text-base text-gray-900 dark:text-white tracking-tight">Workspace Overview</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Visible to Owners and Admins only.
                            </p>
                        </div>

                        {isAdminLoading ? (
                            <p className="font-mono-nav text-xs text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-widest">
                                Loading overview...
                            </p>
                        ) : adminStats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard icon="lucide:users" label="Members" value={adminStats.totalMembers} />
                                <StatCard icon="lucide:shield" label="Admins" value={adminStats.totalAdmins} />
                                <StatCard icon="lucide:crown" label="Owners" value={adminStats.totalOwners} />
                                <StatCard icon="lucide:list-checks" label="Total Tasks" value={adminStats.totalTasks} />
                                <StatCard icon="lucide:check-circle-2" label="Completed" value={adminStats.completedTasks} accent="text-emerald-600 dark:text-emerald-400" />
                                <StatCard icon="lucide:clock" label="Pending" value={adminStats.pendingTasks} accent="text-amber-500" />
                                <StatCard icon="lucide:alert-triangle" label="Overdue" value={adminStats.overdueTasks} accent="text-rose-500" />
                            </div>
                        ) : null}
                    </section>
                )}

                <section className="space-y-4">
                    <div>
                        <h2 className="font-display font-extrabold text-base text-gray-900 dark:text-white tracking-tight">My Dashboard</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Projects and tasks assigned to you in this workspace.
                        </p>
                    </div>

                    {isMyStatsLoading ? (
                        <p className="font-mono-nav text-xs text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-widest">
                            Loading your work...
                        </p>
                    ) : myStats ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard icon="lucide:folder-kanban" label="Assigned Projects" value={myStats.pagination.totalProjects} />
                                <StatCard icon="lucide:check-square" label="Assigned Tasks" value={myStats.pagination.totalTasks} />
                                <StatCard icon="lucide:check-circle-2" label="Completed" value={myStats.completedTasks} accent="text-emerald-600 dark:text-emerald-400" />
                                <StatCard icon="lucide:clock" label="Pending" value={myStats.pendingTasks} accent="text-amber-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 shadow-lg backdrop-blur-xl space-y-3">
                                    <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                        Your Projects
                                    </h3>
                                    {myStats.assignedProjects.length === 0 ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">No assigned projects.</p>
                                    ) : (
                                        myStats.assignedProjects.map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${p.id}`)}
                                                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
                                            >
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</span>
                                                <span className="font-mono-nav text-[10px] uppercase text-gray-500 dark:text-gray-400">{p.status}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-5 shadow-lg backdrop-blur-xl space-y-3">
                                    <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                        Your Tasks
                                    </h3>
                                    {myStats.assignedTasks.length === 0 ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">No assigned tasks.</p>
                                    ) : (
                                        myStats.assignedTasks.map((t) => (
                                            <div
                                                key={t.id}
                                                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                                            >
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{t.title}</span>
                                                <span className="font-mono-nav text-[10px] uppercase text-gray-500 dark:text-gray-400">
                                                    {t.status} · {t.priority}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="font-mono-nav px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 disabled:opacity-40 cursor-pointer"
                                >
                                    Prev
                                </button>
                                <span className="font-mono-nav text-xs text-gray-500 dark:text-gray-400">Page {page}</span>
                                <button
                                    disabled={page >= myStats.pagination.totalTaskPages && page >= myStats.pagination.totalProjectPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="font-mono-nav px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : null}
                </section>
            </main>
        </div>
    );
};