import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/types/jwt-user.type';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/tasks')
export class TasksController {
    constructor(private readonly tasks: TasksService) { }

    @Get()
    async list(@Param('workspaceId') workspaceId: string) {
        return this.tasks.list(workspaceId);
    }

    @Post()
    async create(
        @CurrentUser() user: JwtUser,
        @Param('workspaceId') workspaceId: string,
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasks.create({
            workspaceId,
            userId: user.sub,
            title: dto.title,
            description: dto.description,
            status: dto.status,
            position: dto.position,
        });
    }

    @Patch(':taskId')
    async update(
        @CurrentUser() user: JwtUser,
        @Param('workspaceId') workspaceId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasks.update({
            workspaceId,
            taskId,
            userId: user.sub,
            patch: dto,
        });
    }

    @Delete(':taskId')
    async remove(
        @Param('workspaceId') workspaceId: string,
        @Param('taskId') taskId: string,
    ) {
        return this.tasks.remove({ workspaceId, taskId });
    }
}
