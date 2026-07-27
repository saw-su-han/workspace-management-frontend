import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: {
        Accept: "application/json",
    },
});

let isRefreshing = false;

let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// Attach access token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Refresh token when access token expires
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");

                const response = await api.post("/api/auth/refresh", {
                    refreshToken,
                });

                const newToken = response.data.data.token;

                localStorage.setItem("token", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                processQueue(null, newToken);
                isRefreshing = false;

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;

                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                window.location.href = "/login";

                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);