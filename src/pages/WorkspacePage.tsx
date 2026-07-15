import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceDetails, useUpdateWorkspace, useDeleteWorkspace } from '../hooks/useAuth';

export const WorkspaceDetail: React.FC = () => {
    const { workspaceId: workspaceIdParam } = useParams<{ workspaceId: string }>();
    const workspaceId = Number(workspaceIdParam);
    const navigate = useNavigate();

    const { data: workspace, isLoading, refetch } = useWorkspaceDetails(workspaceId);
    const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace(workspaceId);
    const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

    const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'members' | 'settings'>('projects');
    const [nameDraft, setNameDraft] = useState('');

    // 1. ADDED PREVIEW STATE FOR IMMEDIATE FILE SELECTION VISIBILITY
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
        if (workspace?.workspaceName) {
            setNameDraft(workspace.workspaceName);
        }
    }, [workspace?.workspaceName]);

    // 2. CLEAN UP MEMORY IF THE COMPONENT UNMOUNTS OR PREVIEW CHANGES
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

    React.useEffect(() => {
        setLogoImgBroken(false);
        // Clear the temporary local preview once the new server image loads successfully
        setPreviewUrl(null);
    }, [workspace?.logo]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoImgBroken(false);

        // 3. GENERATE LOCAL BLOB URL FOR INSTANT UI PREVIEW
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

    const handleDeleteWorkspace = () => {
        if (window.confirm("Are you absolutely sure you want to delete this workspace? This cannot be undone.")) {
            deleteWorkspace(workspaceId, {
                onSuccess: () => navigate('/dashboard')
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col gap-4 items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 dark:border-indigo-400/10"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-500 dark:text-indigo-400 animate-pulse">
                    Synchronizing Workspace Core...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans">

            {/* SUB-NAVBAR HEADER */}
            <header className="border-b border-slate-200/80 dark:border-slate-900 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-350 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                        <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span> Back
                    </button>

                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />

                    <div className="flex items-center gap-3">
                        {/* Modified sub-navbar logo to prefer the instant local preview if active */}
                        {previewUrl || logoUrl ? (
                            <img
                                src={previewUrl || logoUrl || ""}
                                alt="Logo"
                                onError={() => setLogoImgBroken(true)}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-inner"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-lg shadow-sm">🏢</div>
                        )}
                        <div>
                            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-50">{workspace?.workspaceName}</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">Workspace Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {(activeTab === 'projects' || activeTab === 'tasks' || activeTab === 'members') && (
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-600/10 hover:shadow-indigo-600/20 dark:shadow-[0_0_20px_rgba(79,70,229,0.15)] flex items-center gap-1.5"
                        >
                            <span className="text-sm font-light">+</span> Create {activeTab === 'projects' ? 'Project' : activeTab === 'tasks' ? 'Task' : 'Invite Member'}
                        </button>
                    </div>
                )}
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8">

                {/* INTERACTIVE NAVIGATION CONTROL PANEL */}
                <aside className="w-full lg:w-64 flex flex-col gap-1.5 flex-shrink-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 mb-1">Navigation</div>

                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'projects' ? 'bg-indigo-50/80 dark:bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">📂 Projects</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-colors ${activeTab === 'projects' ? 'bg-indigo-100/60 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200/60 dark:bg-slate-900 text-slate-500'}`}>{workspace?.totalProjects || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'tasks' ? 'bg-indigo-50/80 dark:bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">⚡ Tasks</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-colors ${activeTab === 'tasks' ? 'bg-indigo-100/60 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200/60 dark:bg-slate-900 text-slate-500'}`}>{workspace?.totalTasks || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'members' ? 'bg-indigo-50/80 dark:bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">👥 Members</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-colors ${activeTab === 'members' ? 'bg-indigo-100/60 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200/60 dark:bg-slate-900 text-slate-500'}`}>{workspace?.totalMembers || 0}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'settings' ? 'bg-indigo-50/80 dark:bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent'}`}
                    >
                        <span className="flex items-center gap-2">⚙️ Settings</span>
                    </button>
                </aside>

                {/* WORKSPACE OPERATIONS VIEWPORT */}
                <main className="flex-1 bg-white dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-900/60 p-6 sm:p-8 rounded-2xl min-h-[480px] shadow-sm transition-all">

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Workspace Projects</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage, view, and organize dynamic project tracks within this environment.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between group hover:border-slate-350 dark:hover:border-slate-700 transition-all hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-none">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-sm border border-indigo-100 dark:border-indigo-500/10">📊</div>
                                        <div>
                                            <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Analytics Pipeline</h3>
                                            <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold mt-0.5">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs transition-colors" title="Edit">✏️</button>
                                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg text-xs transition-colors" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Backlog & Execution</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track tasks and assign workflows to workspace team nodes.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-450 font-bold">✓</div>
                                        <div>
                                            <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Refactor Database Access Layers</h3>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 block">Assigned to: Developer Node</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs transition-colors">✏️</button>
                                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg text-xs transition-colors">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEMBERS TAB */}
                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Authorized Accounts</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage access privileges and user invites for this node.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-650 text-white border border-indigo-400/20 flex items-center justify-center text-[10px] font-black shadow-sm">U</div>
                                        <div>
                                            <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Admin Team Member</h3>
                                            <span className="text-[10px] text-indigo-500 dark:text-indigo-450 font-bold tracking-wide mt-0.5 block">Owner</span>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors">Revoke</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
                                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Workspace Identity Modification</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update brand imagery, logo assets, and master database descriptors.</p>
                            </div>

                            <div className="space-y-6 max-w-xl">
                                {/* Workspace Name Modifier */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">Workspace Name</label>
                                    <div className="flex gap-2.5">
                                        <input
                                            type="text"
                                            value={nameDraft}
                                            onChange={(e) => setNameDraft(e.target.value)}
                                            className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-105 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all"
                                            placeholder="Enter unique workspace name"
                                        />
                                        <button
                                            onClick={handleNameUpdate}
                                            disabled={isUpdating || !nameDraft.trim() || nameDraft === workspace?.workspaceName}
                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-450 dark:disabled:text-slate-650 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10"
                                        >
                                            {isUpdating ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>

                                {/* Brand Logo Modifier */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">Modify Logo Asset</label>
                                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/10 flex flex-col gap-2">

                                        {/* 4. UPDATED PREVIEW BLOCK TO PREFER LOCAL OBJECT BLOB BEFORE FALLING BACK TO SERVER URL */}
                                        {(previewUrl || logoUrl) && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <img
                                                    src={previewUrl || logoUrl || ""}
                                                    alt="Current workspace logo"
                                                    onError={() => setLogoImgBroken(true)}
                                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                                />
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                                    {previewUrl ? "New selection (uploading...)" : "Current logo"}
                                                </span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            id="logo-upload-input"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 dark:file:bg-slate-800 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                                        />
                                        {isUpdating && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold animate-pulse">Uploading asset stream...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-850 pt-8 mt-10">
                                    <div className="p-5 border border-red-200/50 dark:border-red-950/20 bg-red-50/20 dark:bg-red-950/5 rounded-2xl">
                                        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Danger Zone</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Permanently purge this operational workspace and all its integrated database nodes. This is an irreversible action.</p>
                                        <button
                                            onClick={handleDeleteWorkspace}
                                            disabled={isDeleting}
                                            className="px-5 py-2.5 bg-red-550 hover:bg-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-white dark:text-red-400 border border-transparent dark:border-red-900/30 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/10"
                                        >
                                            {isDeleting ? "Purging Node..." : "Delete Workspace"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};