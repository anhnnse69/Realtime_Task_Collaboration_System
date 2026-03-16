import { create } from 'zustand';
import * as workspaceApi from '../api/workspace.api';

type WorkspaceState = {
    workspaces: workspaceApi.Workspace[];
    invitations: workspaceApi.WorkspaceInvitation[];
    loading: boolean;
    error: string | null;
    loadMine: () => Promise<void>;
    loadInvitations: () => Promise<void>;
    create: (name: string) => Promise<workspaceApi.Workspace | null>;
    acceptInvitation: (workspaceId: string) => Promise<workspaceApi.Workspace | null>;
    declineInvitation: (workspaceId: string) => Promise<void>;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
    workspaces: [],
    invitations: [],
    loading: false,
    error: null,
    loadMine: async () => {
        set({ loading: true, error: null });
        try {
            const items = await workspaceApi.listMyWorkspaces();
            set({ workspaces: items, loading: false });
        } catch (e: any) {
            set({ loading: false, error: e?.message ?? 'Failed to load workspaces' });
        }
    },
    loadInvitations: async () => {
        try {
            const items = await workspaceApi.listMyInvitations();
            set({ invitations: items });
        } catch {
            // keep silent; invitations are optional UI
        }
    },
    create: async (name: string) => {
        try {
            const ws = await workspaceApi.createWorkspace(name);
            set({ workspaces: [ws, ...get().workspaces] });
            return ws;
        } catch {
            return null;
        }
    },
    acceptInvitation: async (workspaceId: string) => {
        try {
            const res = await workspaceApi.acceptInvitation(workspaceId);
            const ws = res.workspace;
            set((s) => ({
                invitations: s.invitations.filter((i) => i.workspaceId !== workspaceId),
                workspaces: [ws, ...s.workspaces.filter((w) => w.id !== ws.id)],
            }));
            return ws;
        } catch {
            return null;
        }
    },
    declineInvitation: async (workspaceId: string) => {
        try {
            await workspaceApi.declineInvitation(workspaceId);
        } finally {
            set((s) => ({ invitations: s.invitations.filter((i) => i.workspaceId !== workspaceId) }));
        }
    },
}));
