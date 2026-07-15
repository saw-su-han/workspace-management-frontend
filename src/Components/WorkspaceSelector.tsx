import React from 'react';
import { useProfile } from '../hooks/useAuth';

interface WorkspaceSelectorProps {
    selectedId: number | null;
    onSelect: (id: number) => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ selectedId, onSelect }) => {
    const { data: userProfile } = useProfile();

    // Fallback array mapping incoming nodes safely
    const workspaces = userProfile?.workspaces || [];

    return (
        <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Target Workspace Destination
            </label>
            <select
                value={selectedId || ""}
                onChange={(e) => onSelect(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-colors"
            >
                <option value="" disabled>Choose target workspace scope...</option>
                {workspaces.map((ws: any) => (
                    <option key={ws.id} value={ws.id}>
                        🏢 {ws.name}
                    </option>
                ))}
            </select>
        </div>
    );
};