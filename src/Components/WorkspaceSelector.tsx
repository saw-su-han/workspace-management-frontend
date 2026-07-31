import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../hooks/useAuth';
import { Icon } from "@iconify/react";

interface WorkspaceSelectorProps {
    selectedId: number | null;
    onSelect: (id: number) => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ selectedId, onSelect }) => {
    const { data: userProfile } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fallback array mapping incoming nodes safely
    const workspaces = userProfile?.workspaces || [];
    const selectedWorkspace = workspaces.find((ws: any) => ws.id === selectedId);

    // Handle closing the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-1.5" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-code">
                Target Workspace Destination
            </label>

            <div className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm border outline-none transition-all shadow-sm ${isOpen
                            ? "border-emerald-500 ring-4 ring-emerald-500/10 dark:ring-emerald-500/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Icon icon="lucide:building-2" className="w-4 h-4" />
                        </div>
                        <span className={`font-medium ${selectedWorkspace ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                            {selectedWorkspace ? selectedWorkspace.name : "Choose target scope..."}
                        </span>
                    </div>
                    <Icon
                        icon="lucide:chevrons-up-down"
                        className="w-4 h-4 text-gray-400"
                    />
                </button>

                {/* Custom Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl shadow-black/[0.05] dark:shadow-black/[0.2] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {workspaces.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                No workspaces found.
                            </div>
                        ) : (
                            workspaces.map((ws: any) => (
                                <button
                                    key={ws.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(ws.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedId === ws.id
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            icon="lucide:folder-dot"
                                            className={`w-4 h-4 ${selectedId === ws.id ? "text-emerald-500" : "text-gray-400"}`}
                                        />
                                        {ws.name}
                                    </div>
                                    {selectedId === ws.id && (
                                        <Icon icon="lucide:check" className="w-4 h-4 text-emerald-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};