import { PrismaService } from '../prisma/prisma.service';
export declare class WorkspacesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    isMember(workspaceId: string, userId: string): Promise<boolean>;
    isOwner(workspaceId: string, userId: string): Promise<boolean>;
    createWorkspace(userId: string, params: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listMyWorkspaces(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getWorkspace(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    inviteMember(params: {
        workspaceId: string;
        inviterId: string;
        email: string;
    }): Promise<{
        ok: boolean;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
}
