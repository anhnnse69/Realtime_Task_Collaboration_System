import { Module, forwardRef } from '@nestjs/common';
import { GatewayModule } from '../gateway/gateway.module';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';

@Module({
    imports: [forwardRef(() => GatewayModule)],
    controllers: [WorkspacesController],
    providers: [WorkspacesService, WorkspaceMemberGuard],
    exports: [WorkspacesService],
})
export class WorkspacesModule { }
