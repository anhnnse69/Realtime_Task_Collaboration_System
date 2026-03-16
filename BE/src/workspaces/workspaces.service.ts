import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceMemberStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
    constructor(private readonly prisma: PrismaService) { }

    async isMember(workspaceId: string, userId: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: { userId: true },
        });
        return !!member;
    }

    async isActiveMember(workspaceId: string, userId: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: { status: true },
        });
        return member?.status === WorkspaceMemberStatus.ACTIVE;
    }

    async isOwner(workspaceId: string, userId: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: { role: true },
        });
        return member?.role === WorkspaceRole.OWNER;
    }

    async createWorkspace(userId: string, params: { name: string }) {
        return this.prisma.workspace.create({
            data: {
                name: params.name,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: WorkspaceRole.OWNER,
                        status: WorkspaceMemberStatus.ACTIVE,
                    },
                },
            },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
    }

    async listMyWorkspaces(userId: string) {
        return this.prisma.workspace.findMany({
            where: { members: { some: { userId, status: WorkspaceMemberStatus.ACTIVE } } },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async listMyInvitations(userId: string) {
        const invites = await this.prisma.workspaceMember.findMany({
            where: { userId, status: WorkspaceMemberStatus.PENDING },
            select: {
                workspaceId: true,
                createdAt: true,
                role: true,
                workspace: { select: { id: true, name: true, createdAt: true, updatedAt: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return invites.map((i) => ({
            workspaceId: i.workspaceId,
            role: i.role,
            invitedAt: i.createdAt,
            workspace: i.workspace,
        }));
    }

    async getWorkspace(workspaceId: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, createdAt: true, updatedAt: true, createdById: true },
        });
        if (!workspace) throw new NotFoundException('Workspace not found');
        return workspace;
    }

    async inviteMember(params: { workspaceId: string; inviterId: string; email: string }) {
        const isOwner = await this.isOwner(params.workspaceId, params.inviterId);
        if (!isOwner) throw new ForbiddenException('Only OWNER can invite');

        const user = await this.prisma.user.findUnique({
            where: { email: params.email },
            select: { id: true, email: true, name: true },
        });
        if (!user) throw new NotFoundException('User not found');

        const existing = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId: params.workspaceId, userId: user.id } },
            select: { status: true },
        });

        if (existing?.status === WorkspaceMemberStatus.ACTIVE) {
            return { ok: true, user, alreadyMember: true };
        }

        if (!existing) {
            try {
                await this.prisma.workspaceMember.create({
                    data: {
                        workspaceId: params.workspaceId,
                        userId: user.id,
                        role: WorkspaceRole.MEMBER,
                        status: WorkspaceMemberStatus.PENDING,
                    },
                });
            } catch (e: any) {
                if (e?.code !== 'P2002') throw e;
            }
        }

        const workspace = await this.prisma.workspace.findUnique({
            where: { id: params.workspaceId },
            select: { id: true, name: true },
        });

        return {
            ok: true,
            user,
            invited: true,
            workspace: workspace ?? { id: params.workspaceId, name: 'Workspace' },
        };
    }

    async acceptInvitation(params: { workspaceId: string; userId: string }) {
        const result = await this.prisma.workspaceMember.updateMany({
            where: {
                workspaceId: params.workspaceId,
                userId: params.userId,
                status: WorkspaceMemberStatus.PENDING,
            },
            data: { status: WorkspaceMemberStatus.ACTIVE },
        });

        if (result.count === 0) throw new NotFoundException('Invitation not found');

        const [workspace, user] = await Promise.all([
            this.prisma.workspace.findUnique({
                where: { id: params.workspaceId },
                select: { id: true, name: true, createdAt: true, updatedAt: true },
            }),
            this.prisma.user.findUnique({
                where: { id: params.userId },
                select: { id: true, email: true, name: true },
            }),
        ]);

        return { ok: true, workspace, user };
    }

    async declineInvitation(params: { workspaceId: string; userId: string }) {
        await this.prisma.workspaceMember.deleteMany({
            where: {
                workspaceId: params.workspaceId,
                userId: params.userId,
                status: WorkspaceMemberStatus.PENDING,
            },
        });
        return { ok: true };
    }

    async getWorkspaceMembers(workspaceId: string) {
        const members = await this.prisma.workspaceMember.findMany({
            where: {
                workspaceId,
                status: WorkspaceMemberStatus.ACTIVE,
            },
            select: {
                user: { select: { id: true, email: true, name: true } },
            },
        });
        return members.map((m) => m.user);
    }
}
