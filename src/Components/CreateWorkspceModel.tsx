// src/Components/CreateWorkspaceModal.tsx
import React, { useState } from 'react';
import { useCreateWorkspace } from '../hooks/useAuth';
import { Icon } from "@iconify/react";

interface CreateWorkspaceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ onClose, onSuccess }) => {
    const { mutate: createWorkspace, isPending } = useCreateWorkspace();
    const [name, setName] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Workspace name is required.");
            return;
        }

        const formData = new FormData();
        // ⚡ CRITICAL FIX: Matches your backend service data object validator precisely
        formData.append('workspaceName', name.trim());

        if (logoFile) {
            // ⚡ CRITICAL FIX: Matches upload.single("logo") exactly
            formData.append('logo', logoFile);
        }

        createWorkspace(formData, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
            onError: (err: any) => {
                setError(
                    err?.response?.data?.message ||
                    "Failed to create workspace. Please try again."
                );
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Icon icon="lucide:building-2" className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create New Workspace</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                            Workspace Name
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                <Icon icon="lucide:folder-dot" className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl text-xs focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                                placeholder="e.g. Acme Corp"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                            Workspace Logo (Optional)
                        </label>
                        <input
                            type="file"
                            id="modal-logo-upload"
                            accept="image/*"
                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        {/* ⚡ Built a clean label trigger so you can actually click and see selection confirmation details */}
                        <label
                            htmlFor="modal-logo-upload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all text-center"
                        >
                            <Icon icon={logoFile ? "lucide:file-check" : "lucide:upload-cloud"} className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-full">
                                {logoFile ? logoFile.name : "Click to select workspace logo"}
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPending ? "Creating..." : "Create Workspace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};