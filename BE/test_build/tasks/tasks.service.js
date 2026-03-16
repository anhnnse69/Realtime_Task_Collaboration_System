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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const app_gateway_1 = require("../gateway/app.gateway");
const events_1 = require("../gateway/events");
let TasksService = class TasksService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async list(workspaceId) {
        return this.prisma.task.findMany({
            where: { workspaceId },
            orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async create(params) {
        const task = await this.prisma.task.create({
            data: {
                workspaceId: params.workspaceId,
                title: params.title,
                description: params.description,
                status: params.status ?? client_1.TaskStatus.TODO,
                position: params.position ?? 0,
                createdById: params.userId,
                updatedById: params.userId,
            },
        });
        this.gateway.emitToWorkspace(params.workspaceId, events_1.RealtimeEvents.TaskCreated, {
            task,
        });
        return task;
    }
    async assertTaskInWorkspace(workspaceId, taskId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.workspaceId !== workspaceId)
            throw new common_1.ForbiddenException();
        return task;
    }
    async update(params) {
        await this.assertTaskInWorkspace(params.workspaceId, params.taskId);
        if (typeof params.patch.expectedVersion === 'number') {
            const result = await this.prisma.task.updateMany({
                where: {
                    id: params.taskId,
                    workspaceId: params.workspaceId,
                    version: params.patch.expectedVersion,
                },
                data: {
                    title: params.patch.title,
                    description: params.patch.description,
                    status: params.patch.status,
                    position: params.patch.position,
                    updatedById: params.userId,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) {
                throw new common_1.ConflictException('Task was updated by someone else');
            }
        }
        else {
            await this.prisma.task.update({
                where: { id: params.taskId },
                data: {
                    title: params.patch.title,
                    description: params.patch.description,
                    status: params.patch.status,
                    position: params.patch.position,
                    updatedById: params.userId,
                    version: { increment: 1 },
                },
            });
        }
        const task = await this.prisma.task.findUnique({ where: { id: params.taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        this.gateway.emitToWorkspace(params.workspaceId, events_1.RealtimeEvents.TaskUpdated, {
            task,
        });
        return task;
    }
    async remove(params) {
        const task = await this.assertTaskInWorkspace(params.workspaceId, params.taskId);
        await this.prisma.task.delete({ where: { id: params.taskId } });
        this.gateway.emitToWorkspace(params.workspaceId, events_1.RealtimeEvents.TaskDeleted, {
            taskId: task.id,
        });
        return { ok: true };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_gateway_1.AppGateway])
], TasksService);
//# sourceMappingURL=tasks.service.js.map