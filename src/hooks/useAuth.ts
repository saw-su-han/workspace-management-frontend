// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../Api/axiosClient";

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

// --- AUTHENTICATION HOOKS ---

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: any) => {
            const res = await api.post("/auth/login", credentials);
            const responseData = res.data;

            const token = responseData?.data?.accessToken || responseData?.accessToken || responseData?.token;

            if (token) {
                localStorage.setItem("token", token);
            }

            return responseData;
        },
        onSuccess: (responseData) => {
            const userData = responseData?.data?.user || responseData?.user;
            if (userData) {
                queryClient.setQueryData(["profile"], userData);
            }

            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useRegister = () => {
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

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            // REMOVED explicit header: Let Axios naturally process the multi-part content stream boundary
            const res = await api.patch("/auth/profile", formData);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
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