import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../Components/ConfirmModel';
import { TaskBoard } from '../Components/TaskBoard';
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
    useUserNotifications,
    type ProjectItem,
    type WorkspaceMemberItem
} from '../hooks/useAuth';
import { useUpdateMemberRoleService } from '../hooks/useAuth';

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    PLANNING: {
        label: 'Planning',
        dot: 'bg-amber-400',
        text: 'text-amber-600 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-400/10',
        border: 'border-amber-200 dark:border-amber-400/20',
    },
    ACTIVE: {
        label: 'Active',
        dot: 'bg-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-400/10',
        border: 'border-emerald-200 dark:border-emerald-400/20',
    },
    COMPLETED: {
        label: 'Completed',
        dot: 'bg-sky-400',
        text: 'text-sky-600 dark:text-sky-300',
        bg: 'bg-sky-50 dark:bg-sky-400/10',
        border: 'border-sky-200 dark:border-sky-400/20',
    },
};

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

    const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'members' | 'settings'>('projects');
    const [nameDraft, setNameDraft] = useState('');

    // --- NOTIFICATIONS ---
    const { data: notifications } = useUserNotifications(workspaceId);
    const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

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

    // Workspace owner's userId — used to identify the owner regardless of
    // their stored `role` value and regardless of who is currently viewing.
    // Different backends expose this under different keys, so check the
    // common variants rather than assuming one exact shape.
    const workspaceOwnerId =
        (workspace as any)?.ownerId ??
        (workspace as any)?.owner?.userId ??
        (workspace as any)?.owner?.id ??
        (workspace as any)?.createdById ??
        (workspace as any)?.createdBy;

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
            <div className="flex h-screen flex-col items-center justify-center bg-mint-50 dark:bg-mint-950 gap-6 transition-colors duration-300 relative overflow-hidden font-sans">
                <FontFaces />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(3,48,39,0.06)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(11,238,194,0.05)_0%,_transparent_60%)]" />

                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_9s_linear_infinite] opacity-40 dark:opacity-60" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" className="text-mint-700 dark:text-mint-400" strokeWidth="0.75" strokeDasharray="1 5" />
                        <path d="M50 8 L54 46 L50 50 L46 46 Z" className="fill-mint-700 dark:fill-mint-400" />
                    </svg>
                    <div className="relative inline-flex rounded-full h-9 w-9 bg-gradient-to-tr from-mint-900 to-mint-600 shadow-lg shadow-mint-500/30 items-center justify-center">
                        <span className="text-mint-50 text-sm font-bold">≈</span>
                    </div>
                </div>
                <div className="space-y-1 text-center relative">
                    <p className="font-display text-base font-bold tracking-tight text-mint-900 dark:text-mint-50">Synchronizing Workspace Core</p>
                    <p className="font-mono-nav text-[10px] text-mint-800/50 dark:text-mint-300/60 uppercase tracking-[0.25em]">Loading workspace data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mint-50 dark:bg-mint-950 text-mint-900 dark:text-mint-50 transition-colors duration-300 flex flex-col antialiased relative overflow-hidden font-sans">
            <FontFaces />

            {/* Chart-paper texture / depth lines */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(3,48,39,0.035) 0px, rgba(3,48,39,0.035) 1px, transparent 1px, transparent 32px)',
                }}
            />
            {/* Atmospheric Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-300/20 dark:bg-mint-500/10 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-mint-400/15 dark:bg-mint-600/10 blur-[160px] rounded-full pointer-events-none" />

            {/* JIRA-STYLE GLOBAL NAVIGATION HEADER */}
            <header className="flex h-14 items-center justify-between border-b border-mint-900/10 dark:border-mint-300/15 bg-mint-50/90 dark:bg-mint-950/90 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40 transition-colors">
                <div className="flex items-center gap-6">
                    {/* Jira-style Branding & Home/Dashboard Nav */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-mint-900 to-mint-600 shadow-sm shadow-mint-500/20">
                            <span className="text-xs text-mint-50 font-bold">≈</span>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-display font-bold text-sm tracking-tight text-mint-900 dark:text-mint-50 hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5"
                        >
                            <span>Home</span>
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-mint-900/15 dark:bg-mint-300/20" />

                    {/* WORKSPACE SWITCHER NAVIGATION PILLS */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-900/5 dark:bg-mint-300/10 hover:bg-mint-900/10 dark:hover:bg-mint-300/15 border border-mint-900/10 dark:border-mint-300/15 rounded-lg text-[11px] font-bold text-mint-800 dark:text-mint-300 transition-all flex-shrink-0 cursor-pointer"
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
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 cursor-pointer ${isCurrent
                                            ? 'bg-mint-900/10 dark:bg-mint-300/15 text-mint-900 dark:text-mint-50 border border-mint-900/20 dark:border-mint-300/30'
                                            : 'bg-mint-900/5 dark:bg-mint-300/10 hover:bg-mint-900/10 dark:hover:bg-mint-300/15 text-mint-800/70 dark:text-mint-300/70 border border-mint-900/10 dark:border-mint-300/15'
                                            }`}
                                    >
                                        <div className="w-4 h-4 rounded bg-gradient-to-tr from-mint-900 to-mint-600 flex items-center justify-center text-[9px] font-black text-mint-50">
                                            {wsInfo.name?.charAt(0).toUpperCase() || 'W'}
                                        </div>
                                        <span className="truncate max-w-[100px]">{wsInfo.name}</span>
                                    </button>
                                );
                            })}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* NOTIFICATIONS BUTTON */}
                    <button
                        onClick={() => navigate(`/workspaces/${workspaceId}/notifications`)}
                        className="relative p-2 bg-mint-900/5 dark:bg-mint-300/10 hover:bg-mint-900/10 dark:hover:bg-mint-300/15 border border-mint-900/10 dark:border-mint-300/15 rounded-xl text-mint-900 dark:text-mint-50 transition-all cursor-pointer shadow-sm"
                        title="View Notifications"
                    >
                        <Icon icon="lucide:bell" className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {activeTab === 'projects' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/workspaces/${workspaceId}/invite`)}
                                className="px-3.5 py-1.5 bg-mint-900/5 dark:bg-mint-300/10 border border-mint-900/10 dark:border-mint-300/15 hover:bg-mint-900/10 dark:hover:bg-mint-300/15 text-mint-900 dark:text-mint-50 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                <Icon icon="lucide:mail-plus" className="w-3.5 h-3.5 text-mint-700 dark:text-mint-400" /> Invite Member
                            </button>
                            <button
                                onClick={() => setIsCreateFormOpen((prev) => !prev)}
                                className="px-3.5 py-1.5 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-mint-500/20 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Icon icon={isCreateFormOpen ? "lucide:x" : "lucide:plus"} className="w-3.5 h-3.5" /> {isCreateFormOpen ? 'Cancel' : 'Create Project'}
                            </button>
                        </div>
                    )}
                    <ThemeToggle />
                    <div className="flex items-center pl-2 border-l border-mint-900/10 dark:border-mint-300/15">
                        <UserAvatar
                            userProfile={userProfile}
                            className="h-8 w-8 rounded-full object-cover border border-mint-700/40 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* INTERACTIVE NAVIGATION CONTROL PANEL */}
                <aside className="w-full lg:w-64 flex flex-col gap-1.5 flex-shrink-0">
                    {/* Workspace Identity Mini Card */}
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 shadow-sm backdrop-blur-md mb-4 flex items-center gap-3">
                        {previewUrl || logoUrl ? (
                            <img
                                src={previewUrl || logoUrl || ""}
                                alt="Logo"
                                onError={() => setLogoImgBroken(true)}
                                className="w-10 h-10 rounded-xl object-cover border border-mint-900/15 dark:border-mint-300/30 shadow-inner flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/20 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                                <Icon icon="lucide:waves" className="w-5 h-5 text-mint-700 dark:text-mint-400" />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <h1 className="font-display font-extrabold text-xs tracking-tight text-mint-900 dark:text-mint-50 truncate">{workspace?.name || workspace?.workspaceName}</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="font-mono-nav text-[9px] text-mint-800/60 dark:text-mint-300/60 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 shadow-sm backdrop-blur-md">
                        <div className="font-mono-nav text-[10px] font-bold uppercase tracking-widest text-mint-800/50 dark:text-mint-300/50 px-2 mb-3">Navigation</div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono-nav text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'projects' ? 'bg-mint-900/10 dark:bg-mint-300/15 text-mint-950 dark:text-mint-50 shadow-sm' : 'hover:bg-mint-900/5 dark:hover:bg-mint-300/10 text-mint-950/80 dark:text-mint-200'}`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Icon icon="lucide:folder-kanban" className="w-4 h-4 text-mint-900 dark:text-mint-300" /> Projects
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono-nav text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'tasks' ? 'bg-mint-900/10 dark:bg-mint-300/15 text-mint-950 dark:text-mint-50 shadow-sm' : 'hover:bg-mint-900/5 dark:hover:bg-mint-300/10 text-mint-950/80 dark:text-mint-200'}`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Icon icon="lucide:check-square" className="w-4 h-4 text-mint-900 dark:text-mint-300" /> Tasks
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono-nav text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'members' ? 'bg-mint-900/10 dark:bg-mint-300/15 text-mint-950 dark:text-mint-50 shadow-sm' : 'hover:bg-mint-900/5 dark:hover:bg-mint-300/10 text-mint-950/80 dark:text-mint-200'}`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Icon icon="lucide:users" className="w-4 h-4 text-mint-900 dark:text-mint-300" /> Members
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono-nav text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'settings' ? 'bg-mint-900/10 dark:bg-mint-300/15 text-mint-950 dark:text-mint-50 shadow-sm' : 'hover:bg-mint-900/5 dark:hover:bg-mint-300/10 text-mint-950/80 dark:text-mint-200'}`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <Icon icon="lucide:settings" className="w-4 h-4 text-mint-900 dark:text-mint-300" /> Settings
                                </span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* WORKSPACE OPERATIONS VIEWPORT */}
                <main className="flex-1 bg-white/80 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 p-6 md:p-8 rounded-2xl min-h-[480px] shadow-sm backdrop-blur-md transition-all">

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-base font-extrabold tracking-tight text-mint-900 dark:text-mint-50">Workspace Projects</h2>
                                    <p className="text-xs text-mint-900/60 dark:text-mint-100/60 mt-1">Manage, view, and organize project tracks within this workspace.</p>
                                </div>
                                <div className="relative max-w-xs w-full">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-mint-800/50 dark:text-mint-300/50">
                                        <Icon icon="lucide:search" className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
                                        className="font-mono-nav w-full pl-9 pr-3 py-2 text-xs bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl outline-none text-mint-900 dark:text-mint-50 placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30 focus:border-mint-600 focus:ring-4 focus:ring-mint-500/15 transition-all"
                                    />
                                </div>
                            </div>

                            {/* INLINE CREATE PROJECT FORM */}
                            {isCreateFormOpen && (
                                <div className="p-5 border border-mint-700/30 bg-mint-500/[0.03] rounded-2xl space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Project name"
                                            className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 transition-all placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30"
                                        />
                                        <input
                                            type="text"
                                            value={newProjectDescription}
                                            onChange={(e) => setNewProjectDescription(e.target.value)}
                                            placeholder="Short description (optional)"
                                            className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 transition-all placeholder:text-mint-900/35 dark:placeholder:text-mint-300/30"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60 pl-1">Start date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectStartDate}
                                                onChange={(e) => setNewProjectStartDate(e.target.value)}
                                                className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60 pl-1">End date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectEndDate}
                                                min={newProjectStartDate || undefined}
                                                onChange={(e) => setNewProjectEndDate(e.target.value)}
                                                className="font-mono-nav px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                    {createError && <p className="font-mono-nav text-[11px] text-rose-500 dark:text-rose-400 font-semibold">{createError}</p>}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={isCreatingProject}
                                            className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {isCreatingProject ? 'Initializing...' : 'Save Project'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PROJECTS LIST OR GRID */}
                            {isProjectsLoading ? (
                                <div className="p-12 text-center">
                                    <p className="font-mono-nav text-xs text-mint-800/50 dark:text-mint-300/50 uppercase tracking-widest">Loading projects...</p>
                                </div>
                            ) : !projects || projects.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-mint-900/15 dark:border-mint-300/15 rounded-2xl bg-white/40 dark:bg-mint-900/20">
                                    <Icon icon="lucide:folder-open" className="w-8 h-8 mx-auto text-mint-800/30 dark:text-mint-300/30 mb-3" />
                                    <p className="font-display font-bold text-sm text-mint-900 dark:text-mint-50">No projects found</p>
                                    <p className="font-mono-nav text-xs text-mint-800/50 dark:text-mint-300/50 mt-1">Get started by creating your first project track.</p>
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
                                                className="group relative p-5 rounded-2xl bg-white/60 dark:bg-mint-900/30 border border-mint-900/10 dark:border-mint-300/15 hover:border-mint-500/40 transition-all flex flex-col justify-between shadow-sm cursor-pointer"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-mint-900/5 dark:bg-mint-300/10 border border-mint-900/10 dark:border-mint-300/15 flex items-center justify-center text-mint-900 dark:text-mint-50 font-bold text-xs">
                                                                {project.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <h3 className="font-display font-bold text-sm text-mint-900 dark:text-mint-50 group-hover:text-mint-600 dark:group-hover:text-mint-300 transition-colors">
                                                                {project.name}
                                                            </h3>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${style.bg} ${style.text} border ${style.border}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-xs text-mint-900/70 dark:text-mint-100/70 line-clamp-2 mt-1 mb-3">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-mint-900/5 dark:border-mint-300/10">
                                                    <span className="font-mono-nav text-[10px] text-mint-800/50 dark:text-mint-300/50">
                                                        {project.startDate ? `Starts ${project.startDate.slice(0, 10)}` : 'No start date'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditProject(project);
                                                            }}
                                                            className="p-1.5 rounded-lg bg-mint-900/5 dark:bg-mint-300/10 hover:bg-mint-900/10 text-mint-800 dark:text-mint-200 transition-colors cursor-pointer"
                                                            title="Edit project"
                                                        >
                                                            <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProjectToDelete(project);
                                                            }}
                                                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                            title="Delete project"
                                                        >
                                                            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                                                        </button>
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-display text-base font-extrabold tracking-tight text-mint-900 dark:text-mint-50">Workspace Members</h2>
                                    <p className="text-xs text-mint-900/60 dark:text-mint-100/60 mt-1">Manage permissions and team collaborator access levels.</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/workspaces/${workspaceId}/invite`)}
                                    className="px-3.5 py-1.5 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 text-mint-50 dark:text-mint-950 font-bold text-xs rounded-xl shadow-md shadow-mint-500/20 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Icon icon="lucide:user-plus" className="w-3.5 h-3.5" /> Invite Member
                                </button>
                            </div>

                            {isMembersLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 rounded-full border-2 border-mint-600 border-t-transparent animate-spin" />
                                </div>
                            ) : !members || members.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-mint-900/15 dark:border-mint-300/20 rounded-3xl bg-white/30 dark:bg-mint-900/20">
                                    <p className="text-xs text-mint-900/60 dark:text-mint-100/60">No additional members found in this workspace.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {members.map((member) => {
                                        const isCurrentUser = member.userId === currentUserId;
                                        const isOwner =
                                            workspaceOwnerId !== undefined &&
                                            workspaceOwnerId !== null &&
                                            Number(member.userId) === Number(workspaceOwnerId);
                                        const isUpdatingThisRole = isUpdatingRole && roleUpdateTargetId === member.userId;

                                        return (
                                            <div key={member.userId} className="p-4 bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mint-900 to-mint-600 flex items-center justify-center text-mint-50 text-xs font-black shadow-inner">
                                                        {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-display text-xs font-extrabold text-mint-900 dark:text-mint-50">
                                                                {member.name || 'Unnamed Collaborator'}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-mint-900/10 dark:bg-mint-300/20 text-mint-900 dark:text-mint-200 border border-mint-900/20 dark:border-mint-300/30">You</span>
                                                            )}
                                                        </div>
                                                        <p className="font-mono-nav text-[11px] text-mint-900/60 dark:text-mint-100/60">{member.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {isOwner ? (
                                                        <span className="font-mono-nav px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                                            <Icon icon="lucide:crown" className="w-3.5 h-3.5" />
                                                            Owner
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={member.role}
                                                            disabled={isCurrentUser || isUpdatingThisRole}
                                                            onChange={(e) => handleRoleChange(member.userId, e.target.value as "ADMIN" | "MEMBER")}
                                                            className="font-mono-nav px-3 py-1.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs font-bold text-mint-900 dark:text-mint-50 outline-none disabled:opacity-60 cursor-pointer shadow-sm"
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
                                                            <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
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

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="font-display text-base font-extrabold tracking-tight text-mint-900 dark:text-mint-50">Workspace Settings</h2>
                                <p className="text-xs text-mint-900/60 dark:text-mint-100/60 mt-1">Configure general workspace preferences, branding identity, and safety controls.</p>
                            </div>

                            {/* Branding Section */}
                            <div className="p-6 bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl space-y-4 backdrop-blur-md">
                                <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-mint-800/70 dark:text-mint-300/70">Workspace Logo Identity</h3>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-mint-950/40 to-mint-900/40 border border-mint-700/20 overflow-hidden flex items-center justify-center shadow-inner">
                                        {previewUrl || logoUrl ? (
                                            <img
                                                src={previewUrl || logoUrl || ""}
                                                alt="Workspace Logo"
                                                onError={() => setLogoImgBroken(true)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Icon icon="lucide:waves" className="w-6 h-6 text-mint-700 dark:text-mint-400" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 hover:bg-white dark:hover:bg-mint-900 border border-mint-900/15 dark:border-mint-300/15 text-mint-900 dark:text-mint-50 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1.5">
                                                <Icon icon="iconify-solar:pen-bold" className="w-3.5 h-3.5 text-mint-700 dark:text-mint-400" /> Edit Logo
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <p className="font-mono-nav text-[10px] text-mint-800/50 dark:text-mint-300/50">Recommended: Square PNG, JPG under 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rename Section */}
                            <div className="p-6 bg-white/60 dark:bg-mint-900/40 border border-mint-900/10 dark:border-mint-300/15 rounded-2xl space-y-4 backdrop-blur-md">
                                <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-mint-800/70 dark:text-mint-300/70">Workspace Name</h3>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="font-mono-nav flex-1 px-3.5 py-2.5 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none focus:ring-4 focus:ring-mint-500/15 focus:border-mint-600 shadow-sm transition-all"
                                    />
                                    <button
                                        onClick={handleNameUpdate}
                                        disabled={!nameDraft.trim() || nameDraft === (workspace?.name || workspace?.workspaceName)}
                                        className="font-mono-nav px-5 py-2.5 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 dark:hover:bg-mint-300 disabled:opacity-50 text-mint-50 dark:text-mint-950 text-xs font-bold uppercase tracking-wide rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Icon icon="lucide:check" className="w-3.5 h-3.5" /> Save Name
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-4 backdrop-blur-md">
                                <h3 className="font-mono-nav text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Danger Zone</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-display text-xs font-bold text-mint-900 dark:text-mint-50">Delete this workspace</h4>
                                        <p className="text-[11px] text-mint-900/60 dark:text-mint-100/60 mt-0.5">Once deleted, all internal projects, tracks, and associated tasks will be permanently removed.</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteWorkspace}
                                        className="font-mono-nav px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-md shadow-rose-500/20 transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Icon icon="iconify-solar:trash-bin-trash-bold" className="w-3.5 h-3.5" /> Delete Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* EDIT PROJECT MODAL */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-mint-950/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md p-6 rounded-2xl bg-mint-50 dark:bg-mint-950 border border-mint-900/20 dark:border-mint-300/25 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-base text-mint-900 dark:text-mint-50">Edit Project</h3>
                            <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg hover:bg-mint-900/10 text-mint-900 dark:text-mint-50 cursor-pointer">
                                <Icon icon="lucide:x" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60">Project Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="font-mono-nav w-full px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={2}
                                    className="font-mono-nav w-full px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60">Start Date</label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="font-mono-nav w-full px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60">End Date</label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        min={editStartDate || undefined}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="font-mono-nav w-full px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-mono-nav text-[10px] font-bold text-mint-800/60 dark:text-mint-300/60">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as any)}
                                    className="font-mono-nav w-full px-3.5 py-2 bg-white/50 dark:bg-mint-900/40 border border-mint-900/15 dark:border-mint-300/15 rounded-xl text-xs text-mint-900 dark:text-mint-50 outline-none cursor-pointer"
                                >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            {editError && <p className="font-mono-nav text-[11px] text-rose-500 font-semibold">{editError}</p>}
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                            <button
                                onClick={() => setEditingProject(null)}
                                className="font-mono-nav px-4 py-2 bg-mint-900/5 hover:bg-mint-900/10 text-mint-900 dark:text-mint-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProject}
                                disabled={isUpdatingProject}
                                className="font-mono-nav px-4 py-2 bg-mint-900 dark:bg-mint-400 hover:bg-mint-800 text-mint-50 dark:text-mint-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
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
                isDangerous={true}
                onConfirm={confirmDeleteWorkspace}
                onCancel={() => setIsDeleteWorkspaceModalOpen(false)}
            />
        </div>
    );
};