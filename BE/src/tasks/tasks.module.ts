import { Module } from '@nestjs/common';
import { GatewayModule } from '../gateway/gateway.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
    imports: [GatewayModule, WorkspacesModule],
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule { }
