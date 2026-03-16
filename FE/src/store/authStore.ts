import { create } from 'zustand';

export type AuthUser = {
    id: string;
    email: string;
    name?: string | null;
};

type AuthState = {
    accessToken: string | null;
    user: AuthUser | null;
    setSession: (accessToken: string, user: AuthUser) => void;
    clearSession: () => void;
};

const ACCESS_TOKEN_KEY = 'rtc:accessToken';
const USER_KEY = 'rtc:user';
const TOUCH_KEY = 'rtc:touch';

function readInitial(): Pick<AuthState, 'accessToken' | 'user'> {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    return { accessToken, user };
}

export const useAuthStore = create<AuthState>((set) => ({
    ...readInitial(),
    setSession: (accessToken, user) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOUCH_KEY, String(Date.now()));
        set({ accessToken, user });
    },
    clearSession: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.setItem(TOUCH_KEY, String(Date.now()));
        set({ accessToken: null, user: null });
    },
}));

export function getAccessToken() {
    return useAuthStore.getState().accessToken;
}

export function initAuthStorageSync() {
    window.addEventListener('storage', (e) => {
        if (e.key !== TOUCH_KEY) return;
        const { accessToken, user } = readInitial();
        useAuthStore.setState({ accessToken, user });
    });
}
