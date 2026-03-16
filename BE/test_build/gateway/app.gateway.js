"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const socket_io_1 = require("socket.io");
const crypto_1 = require("crypto");
const workspaces_service_1 = require("../workspaces/workspaces.service");
const roomName = (workspaceId) => `workspace:${workspaceId}`;
const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*';
let AppGateway = class AppGateway {
    constructor(jwt, config, workspaces) {
        this.jwt = jwt;
        this.config = config;
        this.workspaces = workspaces;
    }
    afterInit(server) {
        server.use(async (socket, next) => {
            const token = socket.handshake.auth?.token ??
                (typeof socket.handshake.headers?.authorization === 'string'
                    ? socket.handshake.headers.authorization.replace('Bearer ', '')
                    : undefined);
            if (!token)
                return next(new Error('UNAUTHORIZED'));
            try {
                const payload = await this.jwt.verifyAsync(token, {
                    secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
                });
                socket.data.user = payload;
                return next();
            }
            catch (e) {
                if (e?.name === 'TokenExpiredError')
                    return next(new Error('TOKEN_EXPIRED'));
                return next(new Error('UNAUTHORIZED'));
            }
        });
    }
    emitToWorkspace(workspaceId, event, data) {
        this.server.to(roomName(workspaceId)).emit(event, {
            ...data,
            meta: {
                eventId: (0, crypto_1.randomUUID)(),
                workspaceId,
                ts: new Date().toISOString(),
            },
        });
    }
    async joinWorkspace(client, body) {
        const workspaceId = body?.workspaceId;
        if (!workspaceId)
            return { ok: false, error: 'Missing workspaceId' };
        const user = client.data.user;
        if (!user?.sub)
            return { ok: false, error: 'UNAUTHORIZED' };
        const isMember = await this.workspaces.isMember(workspaceId, user.sub);
        if (!isMember)
            return { ok: false, error: 'FORBIDDEN' };
        await client.join(roomName(workspaceId));
        return { ok: true };
    }
    async leaveWorkspace(client, body) {
        const workspaceId = body?.workspaceId;
        if (!workspaceId)
            return { ok: false, error: 'Missing workspaceId' };
        await client.leave(roomName(workspaceId));
        return { ok: true };
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-workspace'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "joinWorkspace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-workspace'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "leaveWorkspace", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: corsOrigin,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        workspaces_service_1.WorkspacesService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map