import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import { useAuthStore } from './store/authStore';

function RequireAuth({ children }: { children: ReactNode }) {
    const token = useAuthStore((s) => s.accessToken);
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default function App() {
    const token = useAuthStore((s) => s.accessToken);

    return (
        <Routes>
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route
                path="/"
                element={
                    <RequireAuth>
                        <DashboardPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/workspaces/:workspaceId"
                element={
                    <RequireAuth>
                        <WorkspacePage />
                    </RequireAuth>
                }
            />
            <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
    );
}
