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
export interface updateRole {
    workspaceId: number;
    targetId: number,
    newRole: "ADMIN" | "MEMBER",

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
}

export interface ProjectUser {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}
export interface ProjectMember {
    user: ProjectUser;
}

export interface ProjectItem {
    id: number;
    name: string;
    description?: string | null;
    status: "PLANNING" | "ACTIVE" | "COMPLETED";
    startDate?: string | null;
    endDate?: string | null;
    workspaceId: number;
    members: ProjectMember[];
    tasks: TaskItem[];
    createdAt: string;
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
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskItem {
    id: number;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    projectId?: number;
}

export interface TaskDetail extends TaskItem {
    assignee?: {
        id: number;
        name: string;
        email: string;
        avatar?: string | null;
    } | null;
    project: {
        id: number;
        name: string;
    }
}

export interface UpdateTaskPayload {
    workspaceId: number;
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    assignedTo?: number;
}
export interface CreateTaskPayload {
    workspaceId: number;
    projectId: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface TaskFilters {
    projectId?: number;
    search?: string;
    status?: TaskStatus;
    assignedTo?: number;
}



export const useWorkspaceMembers = (workspaceId: number) => {
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
            return res.data.data;
        },
        onSuccess: (updatedData) => {
            queryClient.setQueryData(["profile"], updatedData);

            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}; export const useRegister = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
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
export const useProjectDetails = (projectId: number, workspaceId: number) => {
    return useQuery<ProjectItem>({
        queryKey: ["projectDetails", workspaceId, projectId],
        queryFn: async () => {
            const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}`);
            console.log(res.data.data);
            return res.data.data;
        },
        enabled: !!projectId && !!workspaceId,
    });
}; export interface InvitePayload {
    email: string;
    role: "MEMBER" | "ADMIN";
}



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

export const useUpdateMemberRoleService = (workspaceId: number, targetId: number, ownerId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updateRole: updateRole) => {
            const res = await api.patch(`/invitations/members/roles`, {
                targetId: updateRole.targetId,
                role: updateRole.newRole,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaceMembers", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["WorkspaceTargetMembers", targetId] });
            queryClient.invalidateQueries({ queryKey: ["WorkspaceOwner", ownerId] })
        }
    })
}
export const useRemoveMember = (workspaceId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (targetId: number) => {
            const res = await api.delete("/invitations/members", {
                data: { targetId },
            })
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaceMembers", workspaceId] });
        }
    })
}

export const useAssignProjectMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { workspaceId: number; projectId: number; userId: number }) => {
            const res = await api.post("/members", payload);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["projectDetails", variables.workspaceId, variables.projectId]
            });
            queryClient.invalidateQueries({ queryKey: ["projectMembers", variables.projectId] });
        },
    });
};

// --- TASK HOOKS ---

// GET /tasks?projectId=&search=&status=&assignedTo=
// Works both scoped to a single project (pass projectId) and workspace-wide
// (omit it) — the backend derives the workspace from the authenticated user.
export const useTasksQuery = (filters?: TaskFilters, enabled = true) => {
    return useQuery<TaskItem[]>({
        queryKey: ['tasks', 'list', filters],
        queryFn: async () => {
            const { data } = await api.get('/tasks', { params: filters });
            return data.data;
        },
        enabled,
    });
};

export const useTaskDetails = (workspaceId: number, taskId: number | null) => {
    return useQuery({
        queryKey: ['tasks', 'detail', workspaceId, taskId],
        queryFn: async (): Promise<TaskDetail> => {
            const { data } = await api.get(`/workspaces/${workspaceId}/tasks/${taskId}`);
            return data.data;
        },
        enabled: !!workspaceId && !!taskId,
    });
};


export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateTaskPayload) => {
            const { data } = await api.post('/tasks', payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
        },
    });
};

export const useAssignTask = (workspaceId: number, taskId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (assignedTo: number) => {
            const { data } = await api.patch(
                `/workspaces/${workspaceId}/tasks/${taskId}/assign`,
                { assignedTo },
            );
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', workspaceId, taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
        },
    });
};

// PATCH /tasks/:taskId  (title, description, priority, status, dueDate, assignedTo)
export const useUpdateTask = (taskId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateTaskPayload) => {
            const { data } = await api.patch(`/tasks/${taskId}`, payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'detail'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
        },
    });
};

// PATCH /workspaces/:workspaceId/tasks/:taskId/status  (assignee-only quick toggle)
export const useUpdateTaskStatus = (workspaceId: number, taskId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: 'todo' | 'in-progress' | 'done') => {
            const { data } = await api.patch(
                `/workspaces/${workspaceId}/tasks/${taskId}/status`,
                { status },
            );
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', workspaceId, taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
        },
    });
};

// DELETE /workspaces/:workspaceId/tasks/:taskId
export const useDeleteTask = (workspaceId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: number) => {
            const { data } = await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
        },
    });
};