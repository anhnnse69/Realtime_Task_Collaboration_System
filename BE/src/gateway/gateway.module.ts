import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AppGateway } from './app.gateway';

@Module({
    imports: [forwardRef(() => WorkspacesModule), JwtModule.register({})],
    providers: [AppGateway],
    exports: [AppGateway],
})
export class GatewayModule { }
