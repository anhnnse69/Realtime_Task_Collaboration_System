import { useEffect } from 'react';
import { refresh } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { setSocketToken, socket } from './socket';

export function useSocketConnection() {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    setSocketToken(token);

    if (!token) {
      socket.disconnect();
      return;
    }

    const onConnectError = async (err: any) => {
      if (err?.message === 'TOKEN_EXPIRED') {
        try {
          const res = await refresh();
          setSocketToken(res.accessToken);
          socket.connect();
        } catch {
          // ignore
        }
      }
    };

    socket.on('connect_error', onConnectError);
    socket.connect();

    return () => {
      socket.off('connect_error', onConnectError);
    };
  }, [token]);

  return socket;
}
