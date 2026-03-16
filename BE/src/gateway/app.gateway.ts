import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { JwtUser } from '../common/types/jwt-user.type';
import type { RealtimeEventName } from './events';

const roomName = (workspaceId: string) => `workspace:${workspaceId}`;
const userRoomName = (userId: string) => `user:${userId}`;
const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*';

@WebSocketGateway({
    cors: {
        origin: corsOrigin,
        credentials: true,
    },
})
export class AppGateway implements OnGatewayInit {
    @WebSocketServer() server!: Server;

    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        private readonly workspaces: WorkspacesService,
    ) { }

    afterInit(server: Server) {
        server.use(async (socket, next) => {
            const token =
                (socket.handshake.auth?.token as string | undefined) ??
                (typeof socket.handshake.headers?.authorization === 'string'
                    ? socket.handshake.headers.authorization.replace('Bearer ', '')
                    : undefined);

            if (!token) return next(new Error('UNAUTHORIZED'));

            try {
                const payload = await this.jwt.verifyAsync<JwtUser>(token, {
                    secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                });
                socket.data.user = payload;
                socket.join(userRoomName(payload.sub));
                return next();
            } catch (e: any) {
                if (e?.name === 'TokenExpiredError') return next(new Error('TOKEN_EXPIRED'));
                return next(new Error('UNAUTHORIZED'));
            }
        });
    }

    emitToWorkspace(workspaceId: string, event: RealtimeEventName, data: any) {
        this.server.to(roomName(workspaceId)).emit(event, {
            ...data,
            meta: {
                eventId: randomUUID(),
                workspaceId,
                ts: new Date().toISOString(),
            },
        });
    }

    emitToUser(userId: string, event: RealtimeEventName, data: any) {
        this.server.to(userRoomName(userId)).emit(event, {
            ...data,
            meta: {
                eventId: randomUUID(),
                userId,
                ts: new Date().toISOString(),
            },
        });
    }

    @SubscribeMessage('join-workspace')
    async joinWorkspace(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { workspaceId?: string },
    ) {
        const workspaceId = body?.workspaceId;
        if (!workspaceId) return { ok: false, error: 'Missing workspaceId' };

        const user = client.data.user as JwtUser | undefined;
        if (!user?.sub) return { ok: false, error: 'UNAUTHORIZED' };

        const isActiveMember = await this.workspaces.isActiveMember(workspaceId, user.sub);
        if (!isActiveMember) return { ok: false, error: 'FORBIDDEN' };

        await client.join(roomName(workspaceId));
        return { ok: true };
    }

    @SubscribeMessage('leave-workspace')
    async leaveWorkspace(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { workspaceId?: string },
    ) {
        const workspaceId = body?.workspaceId;
        if (!workspaceId) return { ok: false, error: 'Missing workspaceId' };

        await client.leave(roomName(workspaceId));
        return { ok: true };
    }
}
