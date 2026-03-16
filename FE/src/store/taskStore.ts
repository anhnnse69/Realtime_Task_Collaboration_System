import { create } from 'zustand';
import type { Task } from '../api/task.api';

type TaskState = {
    tasksByWorkspace: Record<string, Task[]>;
    seenEventIds: Record<string, true>;
    setTasks: (workspaceId: string, tasks: Task[]) => void;
    upsertTask: (workspaceId: string, task: Task) => void;
    removeTask: (workspaceId: string, taskId: string) => void;
    markEventSeen: (eventId: string) => boolean;
};

export const useTaskStore = create<TaskState>((set, get) => ({
    tasksByWorkspace: {},
    seenEventIds: {},

    markEventSeen: (eventId: string) => {
        const seen = get().seenEventIds[eventId];
        if (seen) return false;
        set((s) => ({ seenEventIds: { ...s.seenEventIds, [eventId]: true } }));
        return true;
    },

    setTasks: (workspaceId, tasks) => {
        set((s) => ({ tasksByWorkspace: { ...s.tasksByWorkspace, [workspaceId]: tasks } }));
    },

    upsertTask: (workspaceId, task) => {
        const current = get().tasksByWorkspace[workspaceId] ?? [];
        const idx = current.findIndex((t) => t.id === task.id);
        const next = idx === -1 ? [task, ...current] : current.map((t) => (t.id === task.id ? task : t));
        set((s) => ({ tasksByWorkspace: { ...s.tasksByWorkspace, [workspaceId]: next } }));
    },

    removeTask: (workspaceId, taskId) => {
        const current = get().tasksByWorkspace[workspaceId] ?? [];
        const next = current.filter((t) => t.id !== taskId);
        set((s) => ({ tasksByWorkspace: { ...s.tasksByWorkspace, [workspaceId]: next } }));
    },
}));
