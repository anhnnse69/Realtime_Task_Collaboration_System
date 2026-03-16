"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspacesService = class WorkspacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async isMember(workspaceId, userId) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: { userId: true },
        });
        return !!member;
    }
    async isOwner(workspaceId, userId) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: { role: true },
        });
        return member?.role === client_1.WorkspaceRole.OWNER;
    }
    async createWorkspace(userId, params) {
        return this.prisma.workspace.create({
            data: {
                name: params.name,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: client_1.WorkspaceRole.OWNER,
                    },
                },
            },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
    }
    async listMyWorkspaces(userId) {
        return this.prisma.workspace.findMany({
            where: { members: { some: { userId } } },
            select: { id: true, name: true, createdAt: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getWorkspace(workspaceId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, createdAt: true, updatedAt: true, createdById: true },
        });
        if (!workspace)
            throw new common_1.NotFoundException('Workspace not found');
        return workspace;
    }
    async inviteMember(params) {
        const isOwner = await this.isOwner(params.workspaceId, params.inviterId);
        if (!isOwner)
            throw new common_1.ForbiddenException('Only OWNER can invite');
        const user = await this.prisma.user.findUnique({
            where: { email: params.email },
            select: { id: true, email: true, name: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: params.workspaceId, userId: user.id } },
            update: {},
            create: { workspaceId: params.workspaceId, userId: user.id, role: client_1.WorkspaceRole.MEMBER },
        });
        return { ok: true, user };
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map