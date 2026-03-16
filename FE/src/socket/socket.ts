import { io } from 'socket.io-client';
import { getAccessToken } from '../store/authStore';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3001';

export const socket = io(WS_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: {
        token: getAccessToken(),
    },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export function setSocketToken(token: string | null) {
    socket.auth = { token: token ?? '' };
}
