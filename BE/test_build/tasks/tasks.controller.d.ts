import type { JwtUser } from '../common/types/jwt-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasks;
    constructor(tasks: TasksService);
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
    create(user: JwtUser, workspaceId: string, dto: CreateTaskDto): Promise<{
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
    update(user: JwtUser, workspaceId: string, taskId: string, dto: UpdateTaskDto): Promise<{
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
    remove(workspaceId: string, taskId: string): Promise<{
        ok: boolean;
    }>;
}
