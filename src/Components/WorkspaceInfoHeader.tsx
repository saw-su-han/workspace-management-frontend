import React from 'react';
import { useWorkspaceInfo } from '../hooks/useAuth';

interface WorkspaceInfoHeaderProps {
    workspaceId: number;
}

export const WorkspaceInfoHeader: React.FC<WorkspaceInfoHeaderProps> = ({ workspaceId }) => {
    const { data: workspaceInfo, isLoading: isWorkspaceInfoLoading, isError: isWorkspaceInfoError } = useWorkspaceInfo(workspaceId);

    if (isWorkspaceInfoLoading) {
        return (
            <div className="flex h-24 items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold tracking-widest text-xs uppercase mb-6">
                Loading Workspace Node...
            </div>
        );
    }

    if (isWorkspaceInfoError || !workspaceInfo) {
        return (
            <div className="p-6 border border-red-200 dark:border-red-950/40 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold mb-6">
                Unable to load workspace details.
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm mb-6">
            <div className="flex items-center gap-4">
                {workspaceInfo.workspaceLogo ? (
                    <img
                        src={workspaceInfo.workspaceLogo}
                        alt={`${workspaceInfo.workspaceName} brand node`}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-50 border dark:border-slate-800"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-base text-indigo-500 border border-indigo-100/40 dark:border-indigo-900/30">
                        🏢
                    </div>
                )}
                <div>
                    <h2 className="font-black text-lg tracking-tight text-slate-900 dark:text-white truncate">
                        {workspaceInfo.workspaceName}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                        Workspace ID: {workspaceInfo.workspaceId}
                    </p>
                </div>
            </div>

            <div className="text-right">
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                    Viewing As
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {workspaceInfo.userName}
                </span>
            </div>
        </div>
    );
};