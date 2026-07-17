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
            <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-[#070d19] text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl animate-spin text-cyan-500 font-sans">⟳</span>
                    Verifying your invitation...
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc] dark:bg-[#070d19] p-6">
                <div className="max-w-sm text-center">
                    <p className="text-rose-500 text-sm font-bold mb-2">Invitation link invalid</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(error as any)?.response?.data?.message || "This invitation link is invalid or has expired."}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}