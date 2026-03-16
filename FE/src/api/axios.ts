import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    try {
        const res = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
                withCredentials: true,
            },
        );

        const accessToken = res.data?.accessToken as string | undefined;
        const user = res.data?.user as any;
        if (accessToken && user?.id) {
            useAuthStore.getState().setSession(accessToken, user);
            return accessToken;
        }
        return null;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (r) => r,
    async (err: AxiosError) => {
        const status = err.response?.status;
        const original: any = err.config;

        if (status !== 401 || original?._retry) {
            throw err;
        }

        original._retry = true;
        refreshing = refreshing ?? refreshAccessToken();
        const token = await refreshing;
        refreshing = null;

        if (!token) {
            useAuthStore.getState().clearSession();
            throw err;
        }

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return api.request(original);
    },
);
