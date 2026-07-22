import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../Components/ConfirmModel';
import { TaskBoard } from '../Components/TaskBoard';
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
    const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'members' | 'settings'>('projects');
    const [nameDraft, setNameDraft] = useState('');

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

    // Dates from the API may come back as full ISO datetimes (e.g. "2026-07-22T00:00:00.000Z"),
    // but a <input type="date"> needs exactly "yyyy-mm-dd" or it'll silently show blank.
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

    // need the current user's id to pass as ownerId
    const currentUserId = userProfile?.userId ?? userProfile?.id;

    const [roleUpdateTargetId, setRoleUpdateTargetId] = useState<number | null>(null);

    const { mutate: updateMemberRole, isPending: isUpdatingRole } = useUpdateMemberRoleService(
        workspaceId,
        roleUpdateTargetId ?? 0,
        currentUserId ?? 0
    );

    const handleRoleChange = (targetId: number, newRole: "ADMIN" | "MEMBER") => {
        setRoleUpdateTargetId(targetId);
        updateMemberRole({ workspaceId, targetId, newRole });
    };    // Preview URL systems for local image staging
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (workspace?.workspaceName) {
            setNameDraft(workspace.workspaceName);
        }
    }, [workspace?.workspaceName]);

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
        if (!nameDraft.trim() || nameDraft === workspace?.workspaceName) return;
        const fd = new FormData();
        fd.append("name", nameDraft.trim());
        updateWorkspace(fd, { onSuccess: () => refetch() });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col gap-4 items-center justify-center bg-sky-50 dark:bg-[#051923] text-sky-900 dark:text-cyan-50 transition-colors duration-300">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 dark:border-cyan-400/10"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400 animate-pulse">
                    Synchronizing Workspace Core...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50 dark:bg-[#051923] text-sky-950 dark:text-cyan-50 flex flex-col transition-colors duration-300 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.07)_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(15,107,168,0.2)_0%,_transparent_55%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-cyan-400/[0.05] dark:bg-cyan-400/[0.06] blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-teal-400/[0.05] dark:bg-teal-400/[0.05] blur-[150px] rounded-full pointer-events-none" />

            {/* SUB-NAVBAR HEADER */}
            <header className="border-b border-sky-200/70 dark:border-cyan-400/10 bg-white/70 dark:bg-[#051923]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
                <div className="flex items-center gap-5">
                    {/* WORKSPACE SWITCHER DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setIsWorkspaceDropdownOpen((prev) => !prev)}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0a2f4e]/60 hover:bg-sky-50 dark:hover:bg-[#0a2f4e] border border-sky-200 dark:border-cyan-400/15 rounded-lg text-[11px] font-bold text-sky-700 dark:text-cyan-200 shadow-sm transition-all hover:border-cyan-400/50 dark:hover:border-cyan-400/40"
                        >
                            Switch Workspace
                            <span className={`text-[9px] transition-transform ${isWorkspaceDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {isWorkspaceDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceDropdownOpen(false)} />

                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#0a2f4e] border border-sky-200 dark:border-cyan-400/15 rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="max-h-64 overflow-y-auto">
                                        {allWorkspaces
                                            .filter((ws: any) => ws.isDeleted !== true)
                                            .map((ws: any) => {
                                                const wsInfo = ws.workspace || ws;
                                                const isCurrent = wsInfo.id === workspaceId;
                                                return (
                                                    <button
                                                        key={wsInfo.id}
                                                        onClick={() => {
                                                            setIsWorkspaceDropdownOpen(false);
                                                            if (!isCurrent) navigate(`/workspaces/${wsInfo.id}`);
                                                        }}
                                                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${isCurrent
                                                            ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300'
                                                            : 'text-sky-700 dark:text-cyan-200 hover:bg-sky-50 dark:hover:bg-[#0e3a5c]'
                                                            }`}
                                                    >
                                                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-cyan-400 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                                                            {wsInfo.name?.charAt(0).toUpperCase() || 'W'}
                                                        </div>
                                                        <span className="truncate flex-1">{wsInfo.name}</span>
                                                        {isCurrent && <span className="text-cyan-500 text-[10px]">●</span>}
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    <div className="border-t border-sky-100 dark:border-cyan-400/10">
                                        <button
                                            onClick={() => {
                                                setIsWorkspaceDropdownOpen(false);
                                                navigate('/dashboard');
                                            }}
                                            className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-sky-500 dark:text-cyan-400/70 hover:bg-sky-50 dark:hover:bg-[#0e3a5c] transition-colors"
                                        >
                                            ← All Workspaces (Dashboard)
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-[1px] h-6 bg-sky-200 dark:bg-cyan-400/10" />
                    <div className="flex items-center gap-3">
                        {previewUrl || logoUrl ? (
                            <img
                                src={previewUrl || logoUrl || ""}
                                alt="Logo"
                                onError={() => setLogoImgBroken(true)}
                                className="w-10 h-10 rounded-xl object-cover border border-sky-200 dark:border-cyan-400/20 shadow-inner"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-100 to-cyan-100 dark:from-cyan-950/40 dark:to-teal-950/40 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-lg shadow-sm">🌊</div>
                        )}
                        <div>
                            <h1 className="font-extrabold text-sm tracking-tight text-sky-950 dark:text-cyan-50">{workspace?.workspaceName}</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-widest">Workspace Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {activeTab === 'projects' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}/invite`)}
                            className="px-4 py-2 bg-white dark:bg-[#0a2f4e]/60 border border-sky-200 dark:border-cyan-400/15 hover:bg-sky-50 dark:hover:bg-[#0a2f4e] text-sky-700 dark:text-cyan-200 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                            ✉️ Invite Member
                        </button>
                        <button
                            onClick={() => setIsCreateFormOpen((prev) => !prev)}
                            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                        >
                            <span className="text-sm font-light">+</span> {isCreateFormOpen ? 'Cancel' : 'Create Project'}
                        </button>
                    </div>
                )}
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* INTERACTIVE NAVIGATION CONTROL PANEL */}
                <aside className="w-full lg:w-64 flex flex-col gap-1.5 flex-shrink-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-sky-400 dark:text-cyan-400/50 px-3 mb-1">Navigation</div>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'projects' ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-400/20 shadow-sm' : 'hover:bg-sky-100/60 dark:hover:bg-[#0a2f4e]/40 text-sky-500 dark:text-cyan-400/50 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"> Projects</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-sky-100 dark:bg-[#0a2f4e]/60 text-sky-500 dark:text-cyan-400/50">{workspace?.totalProjects || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'tasks' ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-400/20 shadow-sm' : 'hover:bg-sky-100/60 dark:hover:bg-[#0a2f4e]/40 text-sky-500 dark:text-cyan-400/50 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">Tasks</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-sky-100 dark:bg-[#0a2f4e]/60 text-sky-500 dark:text-cyan-400/50">{workspace?.totalTasks || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'members' ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-400/20 shadow-sm' : 'hover:bg-sky-100/60 dark:hover:bg-[#0a2f4e]/40 text-sky-500 dark:text-cyan-400/50 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2"> Members</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-sky-100 dark:bg-[#0a2f4e]/60 text-sky-500 dark:text-cyan-400/50">{workspace?.totalMembers || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'settings' ? 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-400/20 shadow-sm' : 'hover:bg-sky-100/60 dark:hover:bg-[#0a2f4e]/40 text-sky-500 dark:text-cyan-400/50 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">⚙️ Settings</span>
                    </button>
                </aside>

                {/* WORKSPACE OPERATIONS VIEWPORT */}
                <main className="flex-1 bg-white dark:bg-[#0a2f4e]/30 border border-sky-200/70 dark:border-cyan-400/10 p-6 sm:p-8 rounded-2xl min-h-[480px] shadow-sm transition-all">

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-extrabold tracking-tight text-sky-950 dark:text-cyan-50">Workspace Projects</h2>
                                    <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mt-1">Manage, view, and organize project tracks within this workspace.</p>
                                </div>
                                <div className="relative max-w-xs w-full">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sky-400 dark:text-cyan-400/50">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl outline-none text-sky-950 dark:text-cyan-50 placeholder:text-sky-400 dark:placeholder:text-cyan-400/30 focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* INLINE CREATE PROJECT FORM */}
                            {isCreateFormOpen && (
                                <div className="p-5 border border-cyan-300/50 dark:border-cyan-400/20 bg-cyan-50/50 dark:bg-cyan-400/[0.04] rounded-2xl space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Project name"
                                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all placeholder:text-sky-400 dark:placeholder:text-cyan-400/30"
                                        />
                                        <input
                                            type="text"
                                            value={newProjectDescription}
                                            onChange={(e) => setNewProjectDescription(e.target.value)}
                                            placeholder="Short description (optional)"
                                            className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all placeholder:text-sky-400 dark:placeholder:text-cyan-400/30"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-sky-400 dark:text-cyan-400/50 pl-1">Start date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectStartDate}
                                                onChange={(e) => setNewProjectStartDate(e.target.value)}
                                                className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-sky-400 dark:text-cyan-400/50 pl-1">End date (optional)</label>
                                            <input
                                                type="date"
                                                value={newProjectEndDate}
                                                min={newProjectStartDate || undefined}
                                                onChange={(e) => setNewProjectEndDate(e.target.value)}
                                                className="px-3.5 py-2.5 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none focus:ring-2 focus:ring-cyan-400/25 focus:border-cyan-500 dark:focus:border-cyan-400/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    {createError && <p className="text-[11px] text-rose-500 dark:text-rose-300 font-semibold">{createError}</p>}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={isCreatingProject}
                                            className="px-5 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20"
                                        >
                                            {isCreatingProject ? "Creating..." : "Create Project"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PROJECTS LIST */}
                            {isProjectsLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin" />
                                </div>
                            ) : !projects || projects.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-sky-300/60 dark:border-cyan-400/20 rounded-3xl bg-sky-50/50 dark:bg-[#0a2f4e]/20">
                                    <p className="text-xs text-sky-500/70 dark:text-cyan-400/50">No projects yet — cast the first line with "Create Project".</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {projects.map((project) => {
                                        const style = STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING;
                                        const isEditingThis = editingProject?.id === project.id;

                                        if (isEditingThis) {
                                            return (
                                                <div key={project.id} className="p-5 border border-cyan-300/60 dark:border-cyan-400/25 bg-cyan-50/60 dark:bg-cyan-400/[0.05] rounded-2xl space-y-3">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-3.5 py-2 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        className="w-full px-3.5 py-2 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-bold text-sky-400 dark:text-cyan-400/50 pl-1">Start date</label>
                                                            <input
                                                                type="date"
                                                                value={editStartDate}
                                                                onChange={(e) => setEditStartDate(e.target.value)}
                                                                className="w-full px-3.5 py-2 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-bold text-sky-400 dark:text-cyan-400/50 pl-1">End date</label>
                                                            <input
                                                                type="date"
                                                                value={editEndDate}
                                                                min={editStartDate || undefined}
                                                                onChange={(e) => setEditEndDate(e.target.value)}
                                                                className="w-full px-3.5 py-2 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value as any)}
                                                        className="w-full px-3.5 py-2 bg-white dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-xs text-sky-950 dark:text-cyan-50 outline-none"
                                                    >
                                                        <option value="PLANNING">Planning</option>
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="COMPLETED">Completed</option>
                                                    </select>
                                                    {editError && <p className="text-[11px] text-rose-500 font-semibold">{editError}</p>}
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingProject(null)} className="px-3 py-1.5 bg-white dark:bg-[#0a2f4e] text-xs font-bold rounded-xl border border-sky-200 dark:border-cyan-400/15">Cancel</button>
                                                        <button onClick={handleUpdateProject} disabled={isUpdatingProject} className="px-4 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm">{isUpdatingProject ? "Saving..." : "Save"}</button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={project.id}
                                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project.id}`)}
                                                className="group relative p-5 border border-sky-200 dark:border-cyan-400/10 bg-sky-50/60 dark:bg-[#051923]/60 rounded-2xl flex flex-col gap-3 overflow-hidden hover:border-cyan-400/50 dark:hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-sm shadow-sm">📊</div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-extrabold text-xs text-sky-950 dark:text-cyan-50 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{project.name}</h3>
                                                            {project.description && <p className="text-[10px] text-sky-500/70 dark:text-cyan-400/50 truncate mt-0.5">{project.description}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openEditProject(project); }}
                                                            className="p-1.5 hover:bg-sky-200 dark:hover:bg-cyan-400/10 text-xs rounded-lg"
                                                            title="Edit Project"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/workspaces/${workspaceId}/projects/${project.id}/assign`); }}
                                                            className="p-1.5 hover:bg-sky-200 dark:hover:bg-cyan-400/10 text-xs rounded-lg"
                                                            title="Assign Member"
                                                        >
                                                            👥
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProjectToDelete(project);
                                                            }}
                                                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs rounded-lg text-rose-500"
                                                            title="Delete Project"
                                                        >
                                                            🗑️
                                                        </button>
                                                        <ConfirmModal
                                                            isOpen={!!projectToDelete}
                                                            title="Delete project"
                                                            message={`Delete "${projectToDelete?.name}"? This action cannot be undone.`}
                                                            confirmLabel="Delete"
                                                            onConfirm={confirmDeleteProject}
                                                            onCancel={() => setProjectToDelete(null)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-sky-100 dark:border-cyan-400/5 pt-3 mt-auto relative z-10">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1.5 border ${style.bg} ${style.text} ${style.border}`}>
                                                        <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                                                        {style.label}
                                                    </span>
                                                    {(project.startDate || project.endDate) && (
                                                        <span className="text-[9px] font-bold text-sky-400 dark:text-cyan-400/40">
                                                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                                                            {' → '}
                                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                                                        </span>
                                                    )}
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
                        <TaskBoard workspaceId={workspaceId} projects={projects} />
                    )}

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-extrabold text-sky-950 dark:text-cyan-50">Workspace Members</h2>
                                <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mt-1">
                                    Manage who has access to this workspace.
                                </p>
                            </div>

                            {isMembersLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent animate-spin" />
                                </div>
                            ) : !members || members.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-sky-300/60 dark:border-cyan-400/20 rounded-3xl bg-sky-50/50 dark:bg-[#0a2f4e]/20">
                                    <p className="text-xs text-sky-500/70 dark:text-cyan-400/50">No members yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-sky-100 dark:divide-cyan-400/10 border border-sky-200 dark:border-cyan-400/10 rounded-2xl overflow-hidden">
                                    {members.map((member) => {
                                        return (
                                            <div key={member.userId} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#051923]/60">        <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                                                    {member.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-sky-950 dark:text-cyan-50 truncate">{member.name}</p>
                                                    <p className="text-[10px] text-sky-500/70 dark:text-cyan-400/50 truncate">{member.email}</p>
                                                </div>
                                            </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {member.role === 'OWNER' ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-50 dark:bg-cyan-400/10 text-sky-600 dark:text-cyan-300 border border-sky-200 dark:border-cyan-400/20">
                                                            OWNER
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={member.role}
                                                            disabled={isUpdatingRole && roleUpdateTargetId === member.userId}
                                                            onChange={(e) => handleRoleChange(member.userId, e.target.value as "ADMIN" | "MEMBER")}
                                                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/20 text-sky-700 dark:text-cyan-200 outline-none disabled:opacity-50"
                                                        >
                                                            <option value="MEMBER">MEMBER</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>

                                                    )}

                                                    {member.role !== 'OWNER' && (
                                                        <button
                                                            onClick={() => setMemberToRemove(member)}
                                                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-xs rounded-lg text-rose-500"
                                                            title="Remove member"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>                                        </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6 max-w-xl">
                            <div>
                                <h2 className="text-base font-extrabold text-sky-950 dark:text-cyan-50">Workspace Settings</h2>
                                <p className="text-xs text-sky-500/80 dark:text-cyan-400/50 mt-1">Configure workspace parameters, update dynamic vanity logos, or delete this environment.</p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-sky-400 dark:text-cyan-400/50">Workspace Logo</label>
                                    <div className="flex items-center gap-4">
                                        {previewUrl || logoUrl ? (
                                            <img src={previewUrl || logoUrl || ""} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-sky-200 dark:border-cyan-400/20 shadow-md" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-cyan-950/40 border border-sky-200 dark:border-cyan-500/20 flex items-center justify-center text-xl">🌊</div>
                                        )}
                                        <label className="px-3 py-1.5 bg-white dark:bg-[#0a2f4e] border border-sky-200 dark:border-cyan-400/20 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-sky-50 transition-colors">
                                            Choose File
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-sky-400 dark:text-cyan-400/50">Workspace Identity Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={nameDraft}
                                            onChange={(e) => setNameDraft(e.target.value)}
                                            className="flex-1 px-3 py-2 text-xs bg-sky-50 dark:bg-[#051923] border border-sky-200 dark:border-cyan-400/15 rounded-xl text-sky-950 dark:text-cyan-50 outline-none"
                                        />
                                        <button onClick={handleNameUpdate} className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm">Update</button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-sky-100 dark:border-cyan-400/10 mt-6">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-500">Danger Zone</h4>
                                    <p className="text-[11px] text-sky-500/70 dark:text-cyan-400/40 mt-1 mb-3">Deleting this workspace destroys all nested data pipelines, team links, and logs permanently.</p>
                                    <button onClick={handleDeleteWorkspace} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors">
                                        Delete Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* CONFIRM MODALS */}
            <ConfirmModal
                isOpen={!!memberToRemove}
                title="Remove member"
                message={`Remove ${memberToRemove?.name ?? 'this member'} from the workspace? They'll lose access immediately.`}
                confirmLabel="Remove"
                isLoading={isRemovingMember}
                onConfirm={confirmRemoveMember}
                onCancel={() => setMemberToRemove(null)}
            />

            <ConfirmModal
                isOpen={isDeleteWorkspaceModalOpen}
                title="Delete workspace"
                message="This permanently deletes the workspace and all nested projects, tasks, and members. This cannot be undone."
                confirmLabel="Delete Workspace"
                onConfirm={() => {
                    setIsDeleteWorkspaceModalOpen(false);
                    confirmDeleteWorkspace();
                }}
                onCancel={() => setIsDeleteWorkspaceModalOpen(false)}
            />
        </div>
    );
};