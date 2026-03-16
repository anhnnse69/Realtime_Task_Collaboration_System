import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class TasksService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: AppGateway);
    list(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        createdById: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        position: number;
        version: number;
        updatedById: string | null;
    }[]>;
    create(params: {
        workspaceId: string;
        userId: string;
        title: string;
        description?: string;
        status?: TaskStatus;
        position?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        createdById: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        position: number;
        version: number;
        updatedById: string | null;
    }>;
    private assertTaskInWorkspace;
    update(params: {
        workspaceId: string;
        taskId: string;
        userId: string;
        patch: {
            title?: string;
            description?: string;
            status?: TaskStatus;
            position?: number;
            expectedVersion?: number;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        createdById: string;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        position: number;
        version: number;
        updatedById: string | null;
    }>;
    remove(params: {
        workspaceId: string;
        taskId: string;
    }): Promise<{
        ok: boolean;
    }>;
}
