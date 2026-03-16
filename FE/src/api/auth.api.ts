import axios from 'axios';
import { api } from './axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

type LoginResponse = {
    accessToken: string;
    refreshToken?: string;
    user: { id: string; email: string; name?: string | null };
};

export async function register(email: string, password: string, name?: string) {
    const res = await api.post<LoginResponse>('/auth/register', { email, password, name });
    useAuthStore.getState().setSession(res.data.accessToken, res.data.user);
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    useAuthStore.getState().setSession(res.data.accessToken, res.data.user);
    return res.data;
}

export async function logout() {
    try {
        await api.post('/auth/logout');
    } finally {
        useAuthStore.getState().clearSession();
    }
}

export async function refresh() {
    const res = await axios.post<LoginResponse>(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
    if (res.data?.accessToken && res.data?.user?.id) {
        useAuthStore.getState().setSession(res.data.accessToken, res.data.user);
    }
    return res.data;
}
