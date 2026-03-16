import { OnGatewayInit } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { RealtimeEventName } from './events';
export declare class AppGateway implements OnGatewayInit {
    private readonly jwt;
    private readonly config;
    private readonly workspaces;
    server: Server;
    constructor(jwt: JwtService, config: ConfigService, workspaces: WorkspacesService);
    afterInit(server: Server): void;
    emitToWorkspace(workspaceId: string, event: RealtimeEventName, data: any): void;
    joinWorkspace(client: Socket, body: {
        workspaceId?: string;
    }): Promise<{
        ok: boolean;
        error: string;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
    leaveWorkspace(client: Socket, body: {
        workspaceId?: string;
    }): Promise<{
        ok: boolean;
        error: string;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
}
