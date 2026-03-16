import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/types/jwt-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspacesService } from './workspaces.service';
import { AppGateway } from '../gateway/app.gateway';
import { RealtimeEvents } from '../gateway/events';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
    constructor(
        private readonly workspaces: WorkspacesService,
        private readonly gateway: AppGateway,
    ) { }

    @Post()
    async create(@CurrentUser() user: JwtUser, @Body() dto: CreateWorkspaceDto) {
        return this.workspaces.createWorkspace(user.sub, dto);
    }

    @Get()
    async listMine(@CurrentUser() user: JwtUser) {
        return this.workspaces.listMyWorkspaces(user.sub);
    }

    @Get('invitations')
    async listInvitations(@CurrentUser() user: JwtUser) {
        return this.workspaces.listMyInvitations(user.sub);
    }

    @UseGuards(WorkspaceMemberGuard)
    @Get(':workspaceId')
    async get(@Param('workspaceId') workspaceId: string) {
        return this.workspaces.getWorkspace(workspaceId);
    }

    @UseGuards(WorkspaceMemberGuard)
    @Get(':workspaceId/members')
    async getMembers(@Param('workspaceId') workspaceId: string) {
        return this.workspaces.getWorkspaceMembers(workspaceId);
    }

    @Post(':workspaceId/decline')
    async decline(@CurrentUser() user: JwtUser, @Param('workspaceId') workspaceId: string) {
        return this.workspaces.declineInvitation({ workspaceId, userId: user.sub });
    }

    @UseGuards(WorkspaceMemberGuard)
    @Post(':workspaceId/invite')
    async invite(
        @CurrentUser() user: JwtUser,
        @Param('workspaceId') workspaceId: string,
        @Body() dto: InviteMemberDto,
    ) {
        const result = await this.workspaces.inviteMember({
            workspaceId,
            inviterId: user.sub,
            email: dto.email,
        });

        if ((result as any)?.user?.id) {
            this.gateway.emitToUser((result as any).user.id, RealtimeEvents.InviteCreated, {
                workspace: (result as any).workspace,
            });
        }

        return result;
    }

    @Post(':workspaceId/accept')
    async accept(@CurrentUser() user: JwtUser, @Param('workspaceId') workspaceId: string) {
        const result = await this.workspaces.acceptInvitation({ workspaceId, userId: user.sub });
        this.gateway.emitToWorkspace(workspaceId, RealtimeEvents.MemberJoined, {
            user: (result as any).user,
        });
        return { ok: true, workspace: (result as any).workspace };
    }
}
