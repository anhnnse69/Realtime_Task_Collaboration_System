export const RealtimeEvents = {
    TaskCreated: 'task:created',
    TaskUpdated: 'task:updated',
    TaskDeleted: 'task:deleted',
    InviteCreated: 'workspace:invite_created',
    MemberJoined: 'workspace:member_joined',
} as const;

export type RealtimeEventName = (typeof RealtimeEvents)[keyof typeof RealtimeEvents];
