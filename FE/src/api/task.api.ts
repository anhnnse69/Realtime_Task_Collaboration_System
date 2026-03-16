import { api } from './axios';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type User = {
    id: string;
    email: string;
    name?: string | null;
};

export type Task = {
    id: string;
    workspaceId: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    position: number;
    version: number;
    dueDate?: string | null;
    tags?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: User;
    assignee?: User | null;
};

export async function listTasks(workspaceId: string) {
    const res = await api.get<Task[]>(`/workspaces/${workspaceId}/tasks`);
    return res.data;
}

export async function createTask(
    workspaceId: string,
    data: {
        title: string;
        description?: string;
        priority?: TaskPriority;
        dueDate?: string;
        tags?: string;
        assigneeId?: string;
    },
) {
    const res = await api.post<Task>(`/workspaces/${workspaceId}/tasks`, data);
    return res.data;
}

export async function updateTask(
    workspaceId: string,
    taskId: string,
    patch: Partial<Omit<Task, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy'>> & { expectedVersion?: number },
) {
    const res = await api.patch<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`, patch);
    return res.data;
}

export async function deleteTask(workspaceId: string, taskId: string) {
    const res = await api.delete<{ ok: true }>(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return res.data;
}
