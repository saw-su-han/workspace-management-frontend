import React from 'react';
import { useWorkspaceInfo } from '../hooks/useAuth';

interface WorkspaceInfoHeaderProps {
    workspaceId: number;
}

export const WorkspaceInfoHeader: React.FC<WorkspaceInfoHeaderProps> = ({ workspaceId }) => {
    const { data: workspaceInfo, isLoading: isWorkspaceInfoLoading, isError: isWorkspaceInfoError } = useWorkspaceInfo(workspaceId);

    if (isWorkspaceInfoLoading) {
        return (
            <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl text-slate-400 font-bold tracking-widest text-xs uppercase mb-6 animate-pulse">
                Initializing Workspace Context...
            </div>
        );
    }

    if (isWorkspaceInfoError || !workspaceInfo) {
        return (
            <div className="p-6 border border-rose-500/20 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold mb-6 backdrop-blur-xl">
                Unable to load workspace details.
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-slate-950/5 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-mint-500/5 via-teal-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-center gap-4 relative z-10">
                {workspaceInfo.workspaceLogo ? (
                    <img
                        src={workspaceInfo.workspaceLogo}
                        alt={`${workspaceInfo.workspaceName} brand node`}
                        className="w-13 h-13 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-md"
                    />
                ) : (
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-mint-600 via-teal-500 to-emerald-400 flex items-center justify-center font-bold text-xl text-slate-950 shadow-md shadow-mint-500/20 glow-mint">
                        🏢
                    </div>
                )}
                <div>
                    <h2 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white truncate">
                        {workspaceInfo.workspaceName}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <p className="font-mono-nav text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                            Workspace ID #{workspaceInfo.workspaceId}
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-left sm:text-right relative z-10 bg-slate-100/70 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
                <span className="block text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-widest">
                    Authenticated As
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 justify-start sm:justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint-500"></span>
                    {workspaceInfo.userName}
                </span>
            </div>
        </div>
    );
};