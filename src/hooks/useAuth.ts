// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../Api/axiosClient";
import { fa } from "zod/locales";

export interface WorkspaceDetails {
    logo: any;
    workspaceId: number;
    workspaceName: string;
    totalMembers: number;
    totalProjects: number;
    totalTasks: number;
}

export interface WorkspaceInfo {
    workspaceId: number;
    workspaceName: string;
    workspaceLogo: string | null;
    userName: string;
}

export interface AssignProjectPayload {
    workspaceId: number;
    projectId: number;
    userId: number;
    role?: "MEMBER" | "ADMIN" | "OWNER";
}// export interface UserProfile {
//     name?: string | null;
//     avatar?: string | null;
//     avatarUpdatedAt?: string | number | null;
//     updatedAt?: string | number | null;
// }

export interface ProjectItem {
    id: number;
    name: string;
    description?: string | null;
    status: "PLANNING" | "ACTIVE" | "COMPLETED";
    startDate?: string | null;
    endDate?: string | null;
    workspaceId: number;
}

// Add this interface to your useAuth.ts file
export interface WorkspaceMemberItem {
    workspaceId: number;
    name: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    status: string;
    userId: number;
}
export interface AcceptInvitationResult {
    success: boolean;
    message?: string;
    redirect?: string;
    email?: string;
    token?: string;
}export const useWorkspaceMembers = (workspaceId: number) => {
    return useQuery<WorkspaceMemberItem[]>({
        queryKey: ["workspaceMembers", workspaceId],
        queryFn: async () => {
            const res = await api.get(`/invitations/workspaces/${workspaceId}/members`);
            return res.data.data || res.data;
        },
        enabled: !!workspaceId,
    });
};
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: any) => {
            const res = await api.post("/auth/login", credentials);
            const responseData = res.data;

            const token = responseData?.data?.accessToken || responseData?.data?.token || responseData?.token;

            if (token) {
                localStorage.setItem("token", token);
            }

            return responseData;
        },
        onSuccess: (responseData) => {
            const userData = responseData?.data?.user;
            if (userData) {
                // Now sets the complete, rich user payload structure securely!
                queryClient.setQueryData(["profile"], userData);
            }
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.patch("/auth/profile", formData);
            return res.data.data; // This returns the updated getProfileService object footprint
        },
        onSuccess: (updatedData) => {
            // 🔥 THE ULTIMATE FIX: Force-overwrite the UI data cache state immediately
            // This forces React to re-render without relying on network sync delays!
            queryClient.setQueryData(["profile"], updatedData);

            // Re-verify down the pipe
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}; export const useRegister = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            // REMOVED explicit header: Passing FormData lets Axios attach the native browser boundaries perfectly
            const res = await api.post("/auth/register", formData);
            return res.data;
        }
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await api.post("/auth/logout");
            return res.data;
        },
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

// --- USER PROFILE HOOKS ---

export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await api.get("/auth/getprofile");
            return res.data.data;
        },
        retry: false,
    });
};

// --- WORKSPACE HOOKS ---

export const useWorkspaceDetails = (workspaceId: number) => {
    return useQuery<WorkspaceDetails>({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => {
            const res = await api.get(`/workspaces/${workspaceId}`);
            return res.data.data;
        },
        enabled: !!workspaceId,
    });
};

export const useWorkspaceInfo = (workspaceId: number) => {
    return useQuery<WorkspaceInfo>({
        queryKey: ["workspaceInfo", workspaceId],
        queryFn: async () => {
            const res = await api.get(`/workspaces/${workspaceId}/info`);
            return res.data.data;
        },
        enabled: !!workspaceId,
    });
};

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            // REMOVED explicit header: Clears payload corruption so multer can split variables safely
            const res = await api.post("/create", formData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useUpdateWorkspace = (workspaceId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            // REMOVED explicit header: Let the browser natively build the multipart object envelope
            const res = await api.patch(`/workspaces/${workspaceId}`, formData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workspaceId: number) => {
            const res = await api.delete(`/workspaces/${workspaceId}`, {
                data: { confirm: true },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useProjects = (workspaceId: number, search?: string, status?: String) => {
    return useQuery<ProjectItem[]>({
        queryKey: ["projects", workspaceId, search, status],
        queryFn: async () => {
            const res = await api.get("/projects", {
                params: { workspaceId, search, status },
            });
            return res.data.data;
        }, enabled: !!workspaceId,
    })
}

export const useCreateProject = (workspaceId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            startDate?: string;
            endDate?: string;
        }) => {
            const res = await api.post("/projects", { workspaceId, ...data });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
        }
    })
}

export const useUpdateProject = (projectId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name?: string;
            description?: string;
            status?: "PLANNING" | "ACTIVE" | "COMPLETED";
            startDate?: string;
            endDate?: string;
        }) => {
            const res = await api.patch(`/projects/${projectId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workspaceId, projectId }: { workspaceId: number; projectId: number }) => {
            const res = await api.delete(`/${workspaceId}/projects/${projectId}`, {
                data: { confirm: true },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
    });
};


export const useProjectDetails = (projectId: number) => {
    return useQuery<ProjectItem>({
        queryKey: ["projectDetails", projectId],
        queryFn: async () => {
            const res = await api.get(`/projects/${projectId}`);
            return res.data.data;
        },
        enabled: !!projectId,
    });
};

export interface InvitePayload {
    email: string;
    role: "MEMBER" | "ADMIN";
}

export const useInviteUser = (workspaceId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: InvitePayload) => {
            const res = await api.post("/invitations/invite", payload, {
                headers: { "x-workspace-id": String(workspaceId) },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaceMembers", workspaceId] });
        },
    });
};

export const useAcceptInvitation = (token: string | undefined) => {
    return useQuery<AcceptInvitationResult>({
        queryKey: ["acceptInvitation", token],
        queryFn: async () => {
            const res = await api.get(`/invitations/accept/${token}`);
            return res.data;
        },
        enabled: !!token,
        retry: false,
    })
}

export const useSignupWithInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ token, formData }: { token: string; formData: FormData }) => {
            const res = await api.post(`/auth/signup/invitation/${token}`, formData);
            return res.data;
        },
        onSuccess: (responseData) => {
            const authToken = responseData?.data?.token;
            const userData = responseData?.data?.user;

            if (authToken) {
                localStorage.setItem("token", authToken);
            }
            if (userData) {
                queryClient.setQueryData(["profile"], userData);
            }
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};