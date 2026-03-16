import type { JwtUser } from '../common/types/jwt-user.type';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { WorkspacesService } from './workspaces.service';
export declare class WorkspacesController {
    private readonly workspaces;
    constructor(workspaces: WorkspacesService);
    create(user: JwtUser, dto: CreateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listMine(user: JwtUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    get(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    invite(user: JwtUser, workspaceId: string, dto: InviteMemberDto): Promise<{
        ok: boolean;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
}
