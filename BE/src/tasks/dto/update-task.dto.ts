import { TaskStatus, TaskPriority } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MinLength, IsISO8601, IsUUID } from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsInt()
    position?: number;

    @IsOptional()
    @IsISO8601()
    dueDate?: string | null;

    @IsOptional()
    @IsString()
    tags?: string | null;

    @IsOptional()
    @IsUUID()
    assigneeId?: string | null;

    // Optional optimistic concurrency control (bonus)
    @IsOptional()
    @IsInt()
    expectedVersion?: number;
}
