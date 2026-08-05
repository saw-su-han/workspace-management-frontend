// src/pages/AssignMemberPage.tsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useWorkspaceMembers, useAssignProjectMember, useProjectDetails } from '../hooks/useAuth';
import { AsideNav } from '../Components/Asidenav';
import { ThemeToggle } from '../Components/ThemeToggle';
import { ConfirmModal } from '../Components/ConfirmModel';

const FontFaces = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
);

export function AssignMemberPage() {
    const { workspaceId: workspaceIdParam, projectId: projectIdParam } = useParams<{ workspaceId: string; projectId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const projectId = Number(projectIdParam);
    // const navigate = useNavigate();

    const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
    const { data: project } = useProjectDetails(projectId, workspaceId);
    const { mutate: assignMember, isPending, isSuccess } = useAssignProjectMember();

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const assignedUserIds = useMemo(() => {
        return new Set((project as any)?.members?.map((m: any) => m.user?.id) ?? []);
    }, [project]);

    const availableMembers = useMemo(() => {
        return (members ?? []).filter((m) => !assignedUserIds.has(m.userId));
    }, [members, assignedUserIds]);

    const filteredMembers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return availableMembers;
        return availableMembers.filter(
            (m) =>
                m.name?.toLowerCase().includes(query) ||
                m.email?.toLowerCase().includes(query) ||
                m.role?.toLowerCase().includes(query)
        );
    }, [availableMembers, searchQuery]);

    const selectedMember = availableMembers.find((m) => m.userId === selectedUserId);

    const handleAssignClick = () => {
        if (!selectedUserId) {
            setError('Pick a member to assign.');
            return;
        }
        setError(null);
        setIsConfirmOpen(true);
    };

    const confirmAssign = () => {
        if (!selectedUserId) return;
        assignMember(
            { workspaceId, projectId, userId: selectedUserId },
            {
                onSuccess: () => {
                    setIsConfirmOpen(false);
                    setSelectedUserId(null);
                },
                onError: (err: any) => {
                    setIsConfirmOpen(false);
                    setError(err?.response?.data?.message || "Couldn't assign member.");
                },
            }
        );
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-gray-950 font-sans">
            <AsideNav workspaceId={workspaceId} projectId={projectId} />

            <div className="flex-1 text-gray-900 dark:text-gray-50 transition-colors duration-300 antialiased relative overflow-x-hidden">
                <FontFaces />

                {/* Background Grid Pattern (Matching ProjectDetail) */}
                <div
                    className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.2) 1px, transparent 0)',
                        backgroundSize: '36px 36px'
                    }}
                />
                {/* Atmospheric Background Glows (Matching ProjectDetail) */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-teal-600/10 dark:bg-teal-600/5 blur-[180px] rounded-full pointer-events-none" />

                {/* Top Navigation Bar */}
                <nav className="h-18 md:h-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl sticky top-0 z-40 px-4 md:px-8 flex items-center transition-colors">
                    <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">

                        {/* Left: Breadcrumbs & Navigation */}
                        <div className="flex items-center gap-3.5 min-w-0">
                            {/* <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
                                className="font-mono-nav px-3.5 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm cursor-pointer flex items-center gap-2 flex-shrink-0"
                            >
                                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Back to Project</span>
                            </button> */}

                            <div className="hidden sm:flex flex-col border-l border-gray-200 dark:border-gray-800 pl-4 min-w-0">
                                <div className="font-mono-nav flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    <span>Workspace #{workspaceId}</span>
                                    <span>/</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Assign</span>
                                </div>
                                <h1 className="font-display text-sm md:text-base font-extrabold tracking-tight text-gray-900 dark:text-white truncate">
                                    {project?.name || `Project #${projectId}`}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Theme Toggle */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <ThemeToggle />
                        </div>

                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="max-w-xl mx-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-6">

                    {/* Card Container styled like Project Details */}
                    <div className="rounded-3xl bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm dark:shadow-none backdrop-blur-2xl relative overflow-hidden space-y-6">

                        {/* Decorative Top Accent Bar */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-80" />

                        <div>
                            <h1 className="font-display text-lg md:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Assign Member
                            </h1>
                            <p className="font-mono-nav text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Choose a workspace member to add to this project.
                            </p>
                        </div>

                        {/* Inner Container */}
                        <div className="space-y-4">
                            {/* Search Bar Input */}
                            {!isMembersLoading && availableMembers.length > 0 && (
                                <div className="relative">
                                    <Icon
                                        icon="solar:magnifer-linear"
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, email, or role..."
                                        className="w-full font-mono-nav text-xs bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-9 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}

                            {isMembersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                                </div>
                            ) : availableMembers.length === 0 ? (
                                <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                                    <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white">All members assigned</h4>
                                    <p className="font-mono-nav text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                                        All workspace members are already assigned to this project.
                                    </p>
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <Icon icon="solar:user-block-bold-duotone" className="w-7 h-7 text-gray-400 dark:text-gray-600 mb-2" />
                                    <h4 className="font-display text-xs font-bold text-gray-900 dark:text-white">No members found</h4>
                                    <p className="font-mono-nav text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                        No available members match "{searchQuery}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {filteredMembers.map((member) => {
                                        const isSelected = selectedUserId === member.userId;
                                        return (
                                            <label
                                                key={member.userId}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${isSelected
                                                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-emerald-500/40'
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
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm flex-shrink-0">
                                                        {member.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-display text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {member.name}
                                                    </p>
                                                    <p className="font-mono-nav text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                <span className="font-mono-nav text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    {member.role}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {error && (
                                <p className="font-mono-nav text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </p>
                            )}
                            {isSuccess && (
                                <p className="font-mono-nav text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                                    <span>✓</span> Member assigned successfully.
                                </p>
                            )}

                            <button
                                onClick={handleAssignClick}
                                disabled={isPending || availableMembers.length === 0}
                                className="w-full font-mono-nav px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
                                <span>{isPending ? 'Assigning...' : 'Assign to Project'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    title="Assign member"
                    message={`Add ${selectedMember?.name || 'this member'} to "${project?.name || `Project #${projectId}`}"?`}
                    confirmLabel={isPending ? 'Assigning...' : 'Assign'}
                    cancelLabel="Cancel"
                    isDangerous={false}
                    isLoading={isPending}
                    onConfirm={confirmAssign}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            </div>
        </div>
    );
}