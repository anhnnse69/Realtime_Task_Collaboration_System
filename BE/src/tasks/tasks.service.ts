import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { RealtimeEvents } from '../gateway/events';

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: AppGateway,
    ) { }

    async list(workspaceId: string) {
        return this.prisma.task.findMany({
            where: { workspaceId },
            include: {
                assignee: { select: { id: true, email: true, name: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
            orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
        });
    }

    async create(params: {
        workspaceId: string;
        userId: string;
        title: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        position?: number;
        dueDate?: string;
        tags?: string;
        assigneeId?: string;
    }) {
        const task = await this.prisma.task.create({
            data: {
                workspaceId: params.workspaceId,
                title: params.title,
                description: params.description,
                status: params.status ?? TaskStatus.TODO,
                priority: params.priority ?? TaskPriority.MEDIUM,
                position: params.position ?? 0,
                dueDate: params.dueDate ? new Date(params.dueDate) : null,
                tags: params.tags,
                assigneeId: params.assigneeId,
                createdById: params.userId,
                updatedById: params.userId,
            },
            include: {
                assignee: { select: { id: true, email: true, name: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });

        this.gateway.emitToWorkspace(params.workspaceId, RealtimeEvents.TaskCreated, {
            task,
        });

        return task;
    }

    private async assertTaskInWorkspace(workspaceId: string, taskId: string) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        if (task.workspaceId !== workspaceId) throw new ForbiddenException();
        return task;
    }

    async update(params: {
        workspaceId: string;
        taskId: string;
        userId: string;
        patch: {
            title?: string;
            description?: string;
            status?: TaskStatus;
            priority?: TaskPriority;
            position?: number;
            dueDate?: string | null;
            tags?: string | null;
            assigneeId?: string | null;
            expectedVersion?: number;
        };
    }) {
        await this.assertTaskInWorkspace(params.workspaceId, params.taskId);

        const updateData: any = {};
        if (params.patch.title !== undefined) updateData.title = params.patch.title;
        if (params.patch.description !== undefined) updateData.description = params.patch.description;
        if (params.patch.status !== undefined) updateData.status = params.patch.status;
        if (params.patch.priority !== undefined) updateData.priority = params.patch.priority;
        if (params.patch.position !== undefined) updateData.position = params.patch.position;
        if (params.patch.dueDate !== undefined) updateData.dueDate = params.patch.dueDate ? new Date(params.patch.dueDate) : null;
        if (params.patch.tags !== undefined) updateData.tags = params.patch.tags;
        if (params.patch.assigneeId !== undefined) updateData.assigneeId = params.patch.assigneeId;
        updateData.updatedById = params.userId;
        updateData.version = { increment: 1 };

        if (typeof params.patch.expectedVersion === 'number') {
            const result = await this.prisma.task.updateMany({
                where: {
                    id: params.taskId,
                    workspaceId: params.workspaceId,
                    version: params.patch.expectedVersion,
                },
                data: updateData,
            });

            if (result.count === 0) {
                throw new ConflictException('Task was updated by someone else');
            }
        } else {
            await this.prisma.task.update({
                where: { id: params.taskId },
                data: updateData,
            });
        }

        const task = await this.prisma.task.findUnique({ 
            where: { id: params.taskId },
            include: {
                assignee: { select: { id: true, email: true, name: true } },
                createdBy: { select: { id: true, email: true, name: true } },
            },
        });
        if (!task) throw new NotFoundException('Task not found');

        this.gateway.emitToWorkspace(params.workspaceId, RealtimeEvents.TaskUpdated, {
            task,
        });

        return task;
    }

    async remove(params: { workspaceId: string; taskId: string }) {
        const task = await this.assertTaskInWorkspace(params.workspaceId, params.taskId);
        await this.prisma.task.delete({ where: { id: params.taskId } });

        this.gateway.emitToWorkspace(params.workspaceId, RealtimeEvents.TaskDeleted, {
            taskId: task.id,
        });

        return { ok: true };
    }
}

