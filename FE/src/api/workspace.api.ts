import { api } from './axios';

export type Workspace = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type WorkspaceInvitation = {
    workspaceId: string;
    invitedAt: string;
    role: 'OWNER' | 'MEMBER';
    workspace: Workspace;
};

export async function listMyWorkspaces() {
    const res = await api.get<Workspace[]>('/workspaces');
    return res.data;
}

export async function getWorkspace(workspaceId: string) {
    const res = await api.get<Workspace>(`/workspaces/${workspaceId}`);
    return res.data;
}

export async function createWorkspace(name: string) {
    const res = await api.post<Workspace>('/workspaces', { name });
    return res.data;
}

export async function inviteMember(workspaceId: string, email: string) {
    const res = await api.post(`/workspaces/${workspaceId}/invite`, { email });
    return res.data;
}

export async function listMyInvitations() {
    const res = await api.get<WorkspaceInvitation[]>('/workspaces/invitations');
    return res.data;
}

export async function acceptInvitation(workspaceId: string) {
    const res = await api.post<{ ok: true; workspace: Workspace }>(`/workspaces/${workspaceId}/accept`);
    return res.data;
}

export async function declineInvitation(workspaceId: string) {
    const res = await api.post<{ ok: true }>(`/workspaces/${workspaceId}/decline`);
    return res.data;
}

export async function getWorkspaceMembers(workspaceId: string) {
    const res = await api.get<{ id: string; email: string; name?: string | null }[]>(
        `/workspaces/${workspaceId}/members`,
    );
    return res.data;
}
