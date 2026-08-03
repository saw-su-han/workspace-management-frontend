import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAcceptInvitation } from "../hooks/useAuth";

export function AcceptInvitation() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useAcceptInvitation(token);

    useEffect(() => {
        if (!data) return;

        if (!data.success && data.redirect === "/signup") {
            navigate(`/signup-invitation/${token}?email=${encodeURIComponent(data.email || "")}`);
        } else if (data.success) {
            navigate("/login");
        }
    }, [data, token, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <span className="text-slate-600 dark:text-slate-300">Verifying your invitation...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="max-w-sm text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 text-lg">
                        ✕
                    </div>
                    <p className="text-rose-600 dark:text-rose-400 text-sm font-bold mb-1">Invitation link invalid</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(error as any)?.response?.data?.message || "This invitation link is invalid or has expired."}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}