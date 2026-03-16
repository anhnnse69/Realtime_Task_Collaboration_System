export declare const RealtimeEvents: {
    readonly TaskCreated: "task:created";
    readonly TaskUpdated: "task:updated";
    readonly TaskDeleted: "task:deleted";
};
export type RealtimeEventName = (typeof RealtimeEvents)[keyof typeof RealtimeEvents];
