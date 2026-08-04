import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../Components/ConfirmModel';
import { TaskBoard } from '../Components/TaskBoard';
import { InviteMember } from '../Components/ProjectInvitation';
import { Icon } from '@iconify/react';
import { ThemeToggle } from '../Components/ThemeToggle';
import { UserAvatar } from '../Components/UserAvatar';
import {
    useWorkspaceDetails,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useProjects,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
    useProfile,
    useWorkspaceMembers,
    useRemoveMember,
    type ProjectItem,
    type WorkspaceMemberItem,
    useUnreadNotificationCount,
    useUpdateMemberRoleService,
    useDashboard,
    useDashboardMember
} from '../hooks/useAuth';

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; bg: string; border: string; icon: string }> = {
    PLANNING: {
        label: 'Planning',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: 'lucide:compass',
    },
    ACTIVE: {
        label: 'Active',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: 'lucide:zap',
    },
    COMPLETED: {
        label: 'Completed',
        dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
        text: 'text-sky-700 dark:text-sky-300',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
        icon: 'lucide:check-circle-2',
    },
};

const StatCard: React.FC<{
    icon: string;
    label: string;
    value: number | string;
    accent?: string;
}> = ({ icon, label, value, accent = 'text-mint-600 dark:text-mint-400' }) => (
    <div className="relative rounded-2xl bg-gradient-to-br from-white/90 to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs overflow-hidden backdrop-blur-xl flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center flex-shrink-0 relative z-10 border border-slate-200/50 dark:border-slate-700/50">
            <Icon icon={icon} className={`w-5 h-5 ${accent}`} />
        </div>
        <div className="relative z-10">
            <p className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {label}
            </p>
            <p className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-0.5">
                {value}
            </p>
        </div>
    </div>
);

export const WorkspaceDetail: React.FC = () => {
    const { workspaceId: workspaceIdParam } = useParams<{ workspaceId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const navigate = useNavigate();

    const { data: workspace, isLoading, refetch } = useWorkspaceDetails(workspaceId);
    const { mutate: updateWorkspace } = useUpdateWorkspace(workspaceId);
    const { mutate: deleteWorkspace } = useDeleteWorkspace();

    // --- WORKSPACE SWITCHER ---
    const { data: userProfile } = useProfile();
    const allWorkspaces = userProfile?.workspaces || [];

    const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'members' | 'invite' | 'settings'>('dashboard');
    const [nameDraft, setNameDraft] = useState('');

    // --- NOTIFICATIONS ---
    const { data: unreadData } = useUnreadNotificationCount(workspaceId);
    const unreadCount = unreadData?.count ?? 0;

    // --- DASHBOARD DATA (ADMIN & MEMBER) ---
    const {
        data: adminStats,
        isLoading: isAdminLoading,
        isError: isAdminError,
    } = useDashboard(workspaceId);

    const [dashboardPage, setDashboardPage] = useState(1);
    const {
        data: myStats,
        isLoading: isMyStatsLoading,
    } = useDashboardMember(workspaceId, dashboardPage, 5);

    const isAdmin = !isAdminError && !!adminStats;

    // --- PROJECTS TAB DATA ---
    const [projectSearch, setProjectSearch] = useState('');
    const { data: projects, isLoading: isProjectsLoading, refetch: refetchProjects } = useProjects(workspaceId, projectSearch || undefined);
    const { mutate: createProject, isPending: isCreatingProject } = useCreateProject(workspaceId);

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectStartDate, setNewProjectStartDate] = useState('');
    const [newProjectEndDate, setNewProjectEndDate] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);

    // --- DELETE WORKSPACE MODAL ---
    const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] = useState(false);

    // --- MEMBERS TAB DATA ---
    const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
    const { mutate: removeMember, isPending: isRemovingMember } = useRemoveMember(workspaceId);
    const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberItem | null>(null);

    // --- MEMBERS SEARCH ---
    const [memberSearch, setMemberSearch] = useState('');
    const filteredMembers = members?.filter((member) => {
        const q = memberSearch.trim().toLowerCase();
        if (!q) return true;
        const name = (member.name || '').toLowerCase();
        const email = (member.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleCreateProject = () => {
        const trimmed = newProjectName.trim();
        if (!trimmed) {
            setCreateError("Project name can't be empty.");
            return;
        }
        if (newProjectStartDate && newProjectEndDate && newProjectEndDate < newProjectStartDate) {
            setCreateError('End date must be after the start date.');
            return;
        }
        setCreateError(null);
        createProject(
            {
                name: trimmed,
                description: newProjectDescription.trim() || undefined,
                startDate: newProjectStartDate || undefined,
                endDate: newProjectEndDate || undefined,
            },
            {
                onSuccess: () => {
                    setNewProjectName('');
                    setNewProjectDescription('');
                    setNewProjectStartDate('');
                    setNewProjectEndDate('');
                    setIsCreateFormOpen(false);
                    refetchProjects();
                },
                onError: (err: any) => {
                    setCreateError(err?.response?.data?.message || "Couldn't create project.");
                },
            }
        );
    };

    // --- EDIT PROJECT ---
    const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editStatus, setEditStatus] = useState<'PLANNING' | 'ACTIVE' | 'COMPLETED'>('PLANNING');
    const [editError, setEditError] = useState<string | null>(null);

    const { mutate: updateProject, isPending: isUpdatingProject } = useUpdateProject(editingProject?.id ?? 0);

    const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '');

    const openEditProject = (project: ProjectItem) => {
        setEditingProject(project);
        setEditName(project.name);
        setEditDescription(project.description || '');
        setEditStartDate(toDateInputValue(project.startDate));
        setEditEndDate(toDateInputValue(project.endDate));
        setEditStatus(project.status);
        setEditError(null);
        setIsCreateFormOpen(false);
    };

    const handleUpdateProject = () => {
        if (!editingProject) return;
        const trimmed = editName.trim();
        if (!trimmed) {
            setEditError("Project name can't be empty.");
            return;
        }
        if (editStartDate && editEndDate && editEndDate < editStartDate) {
            setEditError('End date must be after the start date.');
            return;
        }
        setEditError(null);

        updateProject(
            {
                workspaceId,
                name: trimmed,
                description: editDescription.trim() || undefined,
                startDate: editStartDate || undefined,
                endDate: editEndDate || undefined,
                status: editStatus,
            },
            {
                onSuccess: () => {
                    setEditingProject(null);
                    refetchProjects();
                },
                onError: (err: any) => {
                    setEditError(err?.response?.data?.message || "Couldn't update project.");
                },
            }
        );
    };

    // --- DELETE PROJECT ---
    const { mutate: deleteProject } = useDeleteProject();

    const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);
    const confirmDeleteProject = () => {
        if (!projectToDelete) return;

        deleteProject(
            {
                workspaceId,
                projectId: projectToDelete.id,
            },
            {
                onSuccess: () => {
                    setProjectToDelete(null);
                    refetchProjects();
                },
            }
        );
    };

    // --- REMOVE MEMBER ---
    const confirmRemoveMember = () => {
        if (!memberToRemove) return;
        removeMember(memberToRemove.userId, {
            onSuccess: () => setMemberToRemove(null),
        });
    };

    // --- DELETE WORKSPACE ---
    const handleDeleteWorkspace = () => {
        setIsDeleteWorkspaceModalOpen(true);
    };

    const confirmDeleteWorkspace = () => {
        deleteWorkspace(workspaceId, {
            onSuccess: () => navigate('/dashboard'),
        });
    };

    const currentUserId = userProfile?.userId ?? userProfile?.id;

    const isOwnerUser =
        members?.some(
            (member) =>
                Number(member.userId) === Number(currentUserId) &&
                member.role === "OWNER"
        ) ?? false;

    const [roleUpdateTargetId, setRoleUpdateTargetId] = useState<number | null>(null);

    const { mutate: updateMemberRole, isPending: isUpdatingRole } = useUpdateMemberRoleService(
        workspaceId,
        roleUpdateTargetId ?? 0,
        currentUserId ?? 0
    );

    const handleRoleChange = (targetId: number, newRole: "ADMIN" | "MEMBER") => {
        setRoleUpdateTargetId(targetId);
        updateMemberRole({ workspaceId, targetId, newRole });
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const wsName = workspace?.name || workspace?.workspaceName;
        if (wsName) {
            setNameDraft(wsName);
        }
    }, [workspace]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (activeTab === 'settings' && !isOwnerUser) {
            setActiveTab('projects');
        }
    }, [activeTab, isOwnerUser]);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "";

    const resolveLogoUrl = (rawUrl?: string | null) => {
        if (!rawUrl) return null;
        const isAbsolute = /^https?:\/\//i.test(rawUrl);
        const base = isAbsolute ? rawUrl : `${API_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
        const cacheKey = (workspace as any)?.updatedAt || (workspace as any)?.logoUpdatedAt;
        const separator = base.includes("?") ? "&" : "?";
        return cacheKey ? `${base}${separator}v=${cacheKey}` : base;
    };

    const [logoImgBroken, setLogoImgBroken] = useState(false);
    const logoUrl = !logoImgBroken ? resolveLogoUrl(workspace?.logo) : null;

    useEffect(() => {
        setLogoImgBroken(false);
        setPreviewUrl(null);
    }, [workspace?.logo]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoImgBroken(false);

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        const fd = new FormData();
        fd.append("logo", file);
        updateWorkspace(fd, { onSuccess: () => refetch() });
    };

    const handleNameUpdate = () => {
        const currentName = workspace?.name || workspace?.workspaceName;
        if (!nameDraft.trim() || nameDraft === currentName) return;
        const fd = new FormData();
        fd.append("name", nameDraft.trim());
        updateWorkspace(fd, { onSuccess: () => refetch() });
    };

    const FontFaces = () => (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-mono-nav { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        `}</style>
    );

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white">
                <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-mint-500/20 shadow-2xl backdrop-blur-xl">
                    <div className="relative flex items-center justify-center w-12 h-12">
                        <div className="w-12 h-12 rounded-full border-3 border-mint-500/20 border-t-mint-500 animate-spin" />
                        <Icon icon="lucide:waves" className="w-5 h-5 text-mint-500 absolute" />
                    </div>
                    <span className="font-mono-nav text-xs font-bold tracking-widest uppercase text-mint-600 dark:text-mint-400 animate-pulse">
                        Loading Workspace...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300 flex flex-col antialiased relative overflow-x-hidden font-sans">
            <FontFaces />

            {/* Ambient Background Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-mint-500/15 via-teal-500/10 to-transparent blur-[140px] rounded-full" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent blur-[140px] rounded-full" />
                <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-500/10 via-sky-500/10 to-transparent blur-[140px] rounded-full" />
                <div
                    className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(16, 185, 129, 0.25) 1px, transparent 0)',
                        backgroundSize: '36px 36px',
                    }}
                />
            </div>

            {/* Main Header */}
            <header className="relative z-40 border-b border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 transition-colors shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Brand & Workspace Switcher */}
                        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-mint-700 via-mint-600 to-teal-500 shadow-md shadow-mint-500/20 flex-shrink-0 group hover:scale-105 transition-transform duration-300">
                                    <Icon icon="lucide:layers" className="w-5 h-5 text-white" />
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="font-display font-extrabold text-sm tracking-tight text-slate-900 dark:text-white hover:text-mint-600 dark:hover:text-mint-400 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <span>Dashboard</span>
                                </button>
                            </div>

                            <div className="hidden md:block h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />

                            {/* Desktop Workspace Selector Pills */}
                            <div className="hidden md:flex items-center gap-2 overflow-x-auto max-w-lg py-1 scrollbar-none">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex-shrink-0 cursor-pointer shadow-xs"
                                >
                                    <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5" /> All Workspaces
                                </button>
                                {/* {allWorkspaces
                                    .filter((ws: any) => ws.isDeleted !== true)
                                    .map((ws: any) => {
                                        const wsInfo = ws.workspace || ws;
                                        const isCurrent = wsInfo.id === workspaceId;
                                        return (
                                            <button
                                                key={wsInfo.id}
                                                onClick={() => {
                                                    if (!isCurrent) navigate(`/workspaces/${wsInfo.id}`);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${isCurrent
                                                    ? 'bg-mint-500/15 text-mint-700 dark:text-mint-300 border border-mint-500/30 shadow-xs'
                                                    : 'bg-slate-100/70 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60'
                                                    }`}
                                            >
                                                <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-mint-600 to-teal-500 flex items-center justify-center text-[9px] font-black text-white shadow-xs">
                                                    {wsInfo.name?.charAt(0).toUpperCase() || 'W'}
                                                </div>
                                                <span className="truncate max-w-[110px]">{wsInfo.name}</span>
                                            </button>
                                        );
                                    })} */}
                            </div>
                        </div>

                        {/* Right Actions & Utilities */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/notifications`)}
                                className="relative p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs hover:scale-105"
                                title="View Notifications"
                            >
                                <Icon icon="lucide:bell" className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <ThemeToggle />

                            <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
                                <UserAvatar
                                    userProfile={userProfile}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-mint-500/30 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Mobile Header Controls */}
                        <div className="flex md:hidden items-center gap-2">
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/notifications`)}
                                className="relative p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
                                title="View Notifications"
                            >
                                <Icon icon="lucide:bell" className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <ThemeToggle />

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                                <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} className="w-4 h-4" />
                            </button>

                            <UserAvatar
                                userProfile={userProfile}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-mint-500/30"
                            />
                        </div>
                    </div>

                    {/* Mobile Menu Expansion */}
                    {isMobileMenuOpen && (
                        <div className="flex md:hidden flex-col gap-3 py-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                                <button
                                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-mint-600 dark:text-mint-400 flex-shrink-0 cursor-pointer"
                                >
                                    <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5" /> Dashboard
                                </button>
                                {allWorkspaces
                                    .filter((ws: any) => ws.isDeleted !== true)
                                    .map((ws: any) => {
                                        const wsInfo = ws.workspace || ws;
                                        const isCurrent = wsInfo.id === workspaceId;
                                        return (
                                            <button
                                                key={wsInfo.id}
                                                onClick={() => {
                                                    if (!isCurrent) navigate(`/workspaces/${wsInfo.id}`);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 cursor-pointer ${isCurrent
                                                    ? 'bg-mint-500/20 text-mint-700 dark:text-mint-300 border border-mint-500/30'
                                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                <div className="w-4 h-4 rounded bg-gradient-to-tr from-mint-600 to-teal-500 flex items-center justify-center text-[9px] font-black text-white">
                                                    {wsInfo.name?.charAt(0).toUpperCase() || 'W'}
                                                </div>
                                                <span className="truncate max-w-[120px]">{wsInfo.name}</span>
                                            </button>
                                        );
                                    })}
                            </div>


                        </div>
                    )}
                </div>
            </header>

            {/* Content Layout */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex flex-col gap-4 flex-shrink-0">
                    {/* Workspace Card Banner */}
                    <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-xl flex items-center gap-3.5 transition-all hover:border-mint-500/30">
                        {previewUrl || logoUrl ? (
                            <img
                                src={previewUrl || logoUrl || ""}
                                alt="Logo"
                                onError={() => setLogoImgBroken(true)}
                                className="w-11 h-11 rounded-xl object-cover ring-2 ring-mint-500/20 shadow-xs flex-shrink-0"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-mint-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-mint-500/20 flex-shrink-0">
                                <Icon icon="lucide:box" className="w-6 h-6" />
                            </div>
                        )}
                        <div className="overflow-hidden min-w-0">
                            <h1 className="font-display font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                                {workspace?.name || workspace?.workspaceName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="font-mono-nav text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Workspace Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Invite Member Button */}
                    <button
                        onClick={() => setActiveTab('invite')}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-mint-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                        <Icon icon="lucide:user-plus" className="w-4 h-4" /> Invite to Workspace
                    </button>

                    {/* Navigation Links */}
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-xl space-y-1">
                        <div className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-2">
                            Menu Overview
                        </div>

                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'dashboard'
                                ? 'bg-gradient-to-r from-mint-500/15 to-teal-500/10 text-mint-700 dark:text-mint-300 border-l-3 border-mint-500 shadow-xs'
                                : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon icon="lucide:layout-dashboard" className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-mint-600 dark:text-mint-400' : 'text-slate-400'}`} />
                                Dashboard
                            </span>
                            {activeTab === 'dashboard' && <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-mint-500" />}
                        </button>

                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'projects'
                                ? 'bg-gradient-to-r from-mint-500/15 to-teal-500/10 text-mint-700 dark:text-mint-300 border-l-3 border-mint-500 shadow-xs'
                                : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon icon="lucide:folder-kanban" className={`w-4 h-4 ${activeTab === 'projects' ? 'text-mint-600 dark:text-mint-400' : 'text-slate-400'}`} />
                                Projects
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {projects?.length ?? 0}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'tasks'
                                ? 'bg-gradient-to-r from-mint-500/15 to-teal-500/10 text-mint-700 dark:text-mint-300 border-l-3 border-mint-500 shadow-xs'
                                : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon icon="lucide:check-square" className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-mint-600 dark:text-mint-400' : 'text-slate-400'}`} />
                                Tasks Board
                            </span>
                            {activeTab === 'tasks' && <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-mint-500" />}
                        </button>

                        <button
                            onClick={() => setActiveTab('members')}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'members'
                                ? 'bg-gradient-to-r from-mint-500/15 to-teal-500/10 text-mint-700 dark:text-mint-300 border-l-3 border-mint-500 shadow-xs'
                                : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon icon="lucide:users" className={`w-4 h-4 ${activeTab === 'members' ? 'text-mint-600 dark:text-mint-400' : 'text-slate-400'}`} />
                                Team Members
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {members?.length ?? 0}
                            </span>
                        </button>

                        {isOwnerUser && (
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'settings'
                                    ? 'bg-gradient-to-r from-mint-500/15 to-teal-500/10 text-mint-700 dark:text-mint-300 border-l-3 border-mint-500 shadow-xs'
                                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon icon="lucide:settings" className={`w-4 h-4 ${activeTab === 'settings' ? 'text-mint-600 dark:text-mint-400' : 'text-slate-400'}`} />
                                    Settings
                                </span>
                                {activeTab === 'settings' && <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-mint-500" />}
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl min-h-[540px] shadow-xs backdrop-blur-xl transition-all">
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-10">
                            {/* SECTION 1: WORKSPACE OVERVIEW (Admin/Owner stats) */}
                            {isAdmin && (
                                <section className="space-y-4">
                                    <div>
                                        <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                            <Icon icon="lucide:shield-check" className="w-5 h-5 text-mint-600 dark:text-mint-400" />
                                            Workspace Overview
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Admin metrics and workspace activity breakdown.
                                        </p>
                                    </div>

                                    {isAdminLoading ? (
                                        <div className="py-6 font-mono-nav text-xs text-mint-600 dark:text-mint-400 animate-pulse">
                                            Loading workspace statistics...
                                        </div>
                                    ) : adminStats ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <StatCard icon="lucide:users" label="Members" value={adminStats.totalMembers} />
                                            <StatCard icon="lucide:shield" label="Admins" value={adminStats.totalAdmins} accent="text-indigo-600 dark:text-indigo-400" />
                                            <StatCard icon="lucide:crown" label="Owners" value={adminStats.totalOwners} accent="text-amber-500" />
                                            <StatCard icon="lucide:list-checks" label="Total Tasks" value={adminStats.totalTasks} accent="text-purple-600 dark:text-purple-400" />
                                            <StatCard icon="lucide:check-circle-2" label="Completed Tasks" value={adminStats.completedTasks} accent="text-emerald-600 dark:text-emerald-400" />
                                            <StatCard icon="lucide:clock" label="Pending Tasks" value={adminStats.pendingTasks} accent="text-amber-500" />
                                            <StatCard icon="lucide:alert-triangle" label="Overdue Tasks" value={adminStats.overdueTasks} accent="text-rose-500" />
                                        </div>
                                    ) : null}
                                </section>
                            )}

                            {/* SECTION 2: MY DASHBOARD (Assigned Projects & Tasks for current user) */}
                            <section className="space-y-6">
                                <div>
                                    <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                        <Icon icon="lucide:user-check" className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        My Dashboard
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Projects and tasks assigned to you in this workspace.
                                    </p>
                                </div>

                                {isMyStatsLoading ? (
                                    <div className="py-8 font-mono-nav text-xs text-mint-600 dark:text-mint-400 animate-pulse">
                                        Loading your assigned work...
                                    </div>
                                ) : myStats ? (
                                    <>
                                        {/* Personal Stat Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <StatCard icon="lucide:folder-kanban" label="Assigned Projects" value={myStats.pagination.totalProjects} accent="text-teal-600 dark:text-teal-400" />
                                            <StatCard icon="lucide:check-square" label="Assigned Tasks" value={myStats.pagination.totalTasks} accent="text-blue-600 dark:text-blue-400" />
                                            <StatCard icon="lucide:check-circle-2" label="Completed" value={myStats.completedTasks} accent="text-emerald-600 dark:text-emerald-400" />
                                            <StatCard icon="lucide:clock" label="Pending" value={myStats.pendingTasks} accent="text-amber-500" />
                                        </div>

                                        {/* Assigned Lists Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            {/* Assigned Projects */}
                                            <div className="rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs backdrop-blur-xl space-y-3">
                                                <h3 className="font-mono-nav text-xs font-bold uppercase tracking-widest text-mint-600 dark:text-mint-400 flex items-center gap-2">
                                                    <Icon icon="lucide:folder" className="w-4 h-4" />
                                                    Your Projects ({myStats.assignedProjects.length})
                                                </h3>
                                                {myStats.assignedProjects.length === 0 ? (
                                                    <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                        <p className="text-xs text-slate-400">No assigned projects yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {myStats.assignedProjects.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${p.id}`)}
                                                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-mint-500/40 transition-all shadow-xs group"
                                                            >
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors">
                                                                    {p.name}
                                                                </span>
                                                                <span className="font-mono-nav text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                                                                    {p.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assigned Tasks */}
                                            <div className="rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs backdrop-blur-xl space-y-3">
                                                <h3 className="font-mono-nav text-xs font-bold uppercase tracking-widest text-mint-600 dark:text-mint-400 flex items-center gap-2">
                                                    <Icon icon="lucide:check-circle" className="w-4 h-4" />
                                                    Your Tasks ({myStats.assignedTasks.length})
                                                </h3>
                                                {myStats.assignedTasks.length === 0 ? (
                                                    <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                        <p className="text-xs text-slate-400">No assigned tasks yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {myStats.assignedTasks.map((t) => (
                                                            <div
                                                                key={t.id}
                                                                onClick={() => navigate(`/workspaces/${workspaceId}/tasks/${t.id}`)}
                                                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shadow-xs cursor-pointer hover:border-mint-500/40 transition-all group"
                                                            >
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors truncate max-w-[180px]">
                                                                    {t.title}
                                                                </span>
                                                                <span className="font-mono-nav text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                                                                    {t.status} · {t.priority}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pagination Bar */}
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="font-mono-nav text-xs text-slate-400">
                                                Showing page {dashboardPage}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={dashboardPage <= 1}
                                                    onClick={() => setDashboardPage((p) => Math.max(1, p - 1))}
                                                    className="font-mono-nav px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer text-slate-700 dark:text-slate-300 transition-all"
                                                >
                                                    Prev
                                                </button>
                                                <button
                                                    disabled={dashboardPage >= myStats.pagination.totalTaskPages && dashboardPage >= myStats.pagination.totalProjectPages}
                                                    onClick={() => setDashboardPage((p) => p + 1)}
                                                    className="font-mono-nav px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer text-slate-700 dark:text-slate-300 transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </section>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects & Tracks</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Organize and monitor project deliverables within this workspace.</p>
                                </div>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                    <div className="relative max-w-xs w-full">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Icon icon="lucide:search" className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search projects..."
                                            value={projectSearch}
                                            onChange={(e) => setProjectSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all shadow-xs"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsCreateFormOpen((prev: boolean) => !prev)}
                                        className="px-4 py-2 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-mint-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] flex-shrink-0 whitespace-nowrap"
                                    >
                                        <Icon icon={isCreateFormOpen ? "lucide:x" : "lucide:plus"} className="w-4 h-4" /> {isCreateFormOpen ? 'Cancel' : 'New Project'}
                                    </button>
                                </div>
                            </div>

                            {/* Create Project Form Drawer */}
                            {isCreateFormOpen && (
                                <div className="p-6 border border-mint-500/30 bg-gradient-to-br from-mint-500/5 via-teal-500/5 to-transparent rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xs">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                                        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Icon icon="lucide:folder-plus" className="w-4 h-4 text-mint-600 dark:text-mint-400" />
                                            Create New Project Track
                                        </h3>
                                        <button onClick={() => setIsCreateFormOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                                            <Icon icon="lucide:x" className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Project Name *</label>
                                            <input
                                                type="text"
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                                placeholder="e.g. Website Redesign"
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Description (optional)</label>
                                            <input
                                                type="text"
                                                value={newProjectDescription}
                                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                                placeholder="Short summary of goals..."
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Start Date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectStartDate}
                                                onChange={(e) => setNewProjectStartDate(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">End Date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectEndDate}
                                                min={newProjectStartDate || undefined}
                                                onChange={(e) => setNewProjectEndDate(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {createError && <p className="font-mono-nav text-xs text-rose-500 font-semibold">{createError}</p>}

                                    <div className="flex justify-end gap-2.5 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateFormOpen(false)}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={isCreatingProject}
                                            className="px-5 py-2 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-mint-500/20 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {isCreatingProject ? 'Saving...' : 'Create Project'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Projects List Grid */}
                            {isProjectsLoading ? (
                                <div className="p-16 text-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin mx-auto mb-3" />
                                    <p className="font-mono-nav text-xs text-slate-400 uppercase tracking-widest">Loading Projects...</p>
                                </div>
                            ) : !projects || projects.length === 0 ? (
                                <div className="text-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/40">
                                    <Icon icon="lucide:folder-open" className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <p className="font-display font-extrabold text-base text-slate-900 dark:text-white">No projects found</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Get started by initializing your first project track in this workspace.</p>
                                    <button
                                        onClick={() => setIsCreateFormOpen(true)}
                                        className="mt-4 px-4 py-2 bg-mint-600 hover:bg-mint-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
                                    >
                                        <Icon icon="lucide:plus" className="w-4 h-4" /> Create Project
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map((project: ProjectItem) => {
                                        const style = STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING;
                                        return (
                                            <div
                                                key={project.id}
                                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project.id}`)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        navigate(`/workspaces/${workspaceId}/projects/${project.id}`);
                                                    }
                                                }}
                                                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-mint-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-mint-500/5 transition-all duration-300 flex flex-col justify-between shadow-xs cursor-pointer"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mint-500/20 to-teal-500/20 border border-mint-500/30 flex items-center justify-center text-mint-700 dark:text-mint-300 font-extrabold text-sm">
                                                                {project.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors">
                                                                {project.name}
                                                            </h3>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${style.bg} ${style.text} border ${style.border}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                                                    <span className="font-mono-nav text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                                        <Icon icon="lucide:calendar" className="w-3 h-3 text-slate-400" />
                                                        {project.startDate ? `Starts ${project.startDate.slice(0, 10)}` : 'No start date'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditProject(project);
                                                            }}
                                                            className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono-nav bg-slate-100 dark:bg-slate-800 hover:bg-mint-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs" title="Edit project"
                                                        >
                                                            <Icon icon="lucide:pen" className="w-3.5 h-3.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProjectToDelete(project);
                                                            }}

                                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 dark:text-slate-400 transition-all cursor-pointer shadow-xs" title="Delete project"
                                                        >
                                                            <Icon icon="lucide:trash-2" className="w-4 h-4" />                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <TaskBoard workspaceId={workspaceId} projects={projects} />
                        </div>
                    )}

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workspace Members</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage member roles and team access permissions.</p>
                                </div>
                            </div>

                            {/* Member Search */}
                            <div className="relative max-w-xs w-full">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Icon icon="lucide:search" className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search members by name or email..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all shadow-xs"
                                />
                            </div>

                            {isMembersLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
                                </div>
                            ) : !filteredMembers || filteredMembers.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/40">
                                    <p className="text-xs text-slate-400">
                                        {memberSearch
                                            ? 'No members match your search.'
                                            : 'No additional members found in this workspace.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredMembers.map((member) => {
                                        const isCurrentUser = member.userId === currentUserId;
                                        const isOwner = member.role === "OWNER";
                                        const isUpdatingThisRole = isUpdatingRole && roleUpdateTargetId === member.userId;

                                        return (
                                            <div key={member.userId} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 shadow-xs hover:border-mint-500/30 transition-all">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mint-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
                                                        {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-display text-xs font-bold text-slate-900 dark:text-white">
                                                                {member.name || 'Unnamed Collaborator'}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-mint-500/10 text-mint-700 dark:text-mint-300 border border-mint-500/20">You</span>
                                                            )}
                                                        </div>
                                                        <p className="font-mono-nav text-[11px] text-slate-400">{member.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {isOwner ? (
                                                        <span className="font-mono-nav px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shadow-xs">
                                                            <Icon icon="lucide:crown" className="w-3.5 h-3.5" />
                                                            Owner
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={member.role}
                                                            disabled={isCurrentUser || isUpdatingThisRole}
                                                            onChange={(e) =>
                                                                handleRoleChange(
                                                                    member.userId,
                                                                    e.target.value as "ADMIN" | "MEMBER"
                                                                )
                                                            }
                                                            className="font-mono-nav px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none disabled:opacity-60 cursor-pointer shadow-xs focus:ring-2 focus:ring-mint-500/20"
                                                        >
                                                            <option value="ADMIN">Admin</option>
                                                            <option value="MEMBER">Member</option>
                                                        </select>
                                                    )}

                                                    {!isCurrentUser && !isOwner && (
                                                        <button
                                                            onClick={() => setMemberToRemove(member)}
                                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors border border-rose-500/20 flex items-center justify-center cursor-pointer"
                                                            title="Remove Member"
                                                        >
                                                            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* INVITE TAB */}
                    {activeTab === 'invite' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Invite to Workspace</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send teammates a secure invitation to join this workspace.</p>
                            </div>
                            <InviteMember
                                workspaceId={workspaceId}
                                workspaceName={workspace?.name || workspace?.workspaceName}
                            />
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workspace Settings</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure general workspace preferences, brand identity, and safety controls.</p>
                            </div>

                            {/* Branding identity card */}
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-4 shadow-xs">
                                <h3 className="font-mono-nav text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace Logo Identity</h3>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-mint-600 to-teal-500 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-md">
                                        {previewUrl || logoUrl ? (
                                            <img
                                                src={previewUrl || logoUrl || ""}
                                                alt="Workspace Logo"
                                                onError={() => setLogoImgBroken(true)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Icon icon="lucide:box" className="w-8 h-8 text-white" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5">
                                                <Icon icon="lucide:pen" className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" /> Change Logo
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <p className="font-mono-nav text-[10px] text-slate-400">Recommended: Square PNG, JPG under 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Name editor card */}
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-4 shadow-xs">
                                <h3 className="font-mono-nav text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace Name</h3>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="font-mono-nav flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500 shadow-xs transition-all"
                                    />
                                    <button
                                        onClick={handleNameUpdate}
                                        disabled={!nameDraft.trim() || nameDraft === (workspace?.name || workspace?.workspaceName)}
                                        className="font-mono-nav px-5 py-2.5 bg-mint-600 hover:bg-mint-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Icon icon="lucide:check" className="w-4 h-4" /> Save
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="p-6 bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 rounded-2xl space-y-4">
                                <h3 className="font-mono-nav text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Danger Zone</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">Delete this workspace</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Once deleted, all projects and associated tasks will be permanently removed.</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteWorkspace}
                                        className="font-mono-nav px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-md shadow-rose-500/20 transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" /> Delete Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* EDIT PROJECT MODAL */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Icon icon="lucide:pen" className="w-5 h-5 text-mint-600 dark:text-mint-400" />
                                Edit Project Track
                            </h3>
                            <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                                <Icon icon="lucide:x" className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Project Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Start Date</label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">End Date</label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        min={editStartDate || undefined}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as any)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-mint-500/20 focus:border-mint-500"
                                >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            {editError && <p className="font-mono-nav text-xs text-rose-500 font-semibold">{editError}</p>}
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setEditingProject(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProject}
                                disabled={isUpdatingProject}
                                className="px-5 py-2 bg-gradient-to-r from-mint-600 to-teal-600 hover:from-mint-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-mint-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isUpdatingProject ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM MODALS */}
            <ConfirmModal
                isOpen={Boolean(projectToDelete)}
                title="Delete Project Track"
                message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isDangerous={true}
                onConfirm={confirmDeleteProject}
                onCancel={() => setProjectToDelete(null)}
            />

            <ConfirmModal
                isOpen={Boolean(memberToRemove)}
                title="Remove Member"
                message={`Are you sure you want to remove ${memberToRemove?.name || memberToRemove?.email || 'this user'} from the workspace?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                isDangerous={true}
                isLoading={isRemovingMember}
                onConfirm={confirmRemoveMember}
                onCancel={() => setMemberToRemove(null)}
            />

            <ConfirmModal
                isOpen={isDeleteWorkspaceModalOpen}
                title="Delete Entire Workspace"
                message={`Are you absolutely sure you want to delete "${workspace?.name || workspace?.workspaceName}"? All ongoing data will be lost forever.`}
                confirmLabel="Delete Workspace"
                cancelLabel="Cancel"
                onConfirm={confirmDeleteWorkspace}
                onCancel={() => setIsDeleteWorkspaceModalOpen(false)}
            />
        </div>
    );
};