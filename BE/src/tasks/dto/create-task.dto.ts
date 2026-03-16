import { TaskStatus, TaskPriority } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MinLength, IsISO8601, IsUUID } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(1)
    title!: string;

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
    dueDate?: string;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @IsUUID()
    assigneeId?: string;
}
