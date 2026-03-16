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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async signTokens(user) {
        const accessSecret = this.config.getOrThrow('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.getOrThrow('JWT_REFRESH_SECRET');
        const accessTtl = (this.config.get('JWT_ACCESS_TTL') ?? '15m');
        const refreshTtl = (this.config.get('JWT_REFRESH_TTL') ?? '7d');
        const payload = { sub: user.id, email: user.email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, { secret: accessSecret, expiresIn: accessTtl }),
            this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: refreshTtl }),
        ]);
        return { accessToken, refreshToken };
    }
    async register(params) {
        const passwordHash = await bcrypt.hash(params.password, 10);
        const user = await this.users.createUser({
            email: params.email,
            name: params.name,
            passwordHash,
        });
        const tokens = await this.signTokens({ id: user.id, email: user.email });
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setRefreshTokenHash(user.id, refreshTokenHash);
        return { user, ...tokens };
    }
    async login(params) {
        const user = await this.users.findAuthByEmail(params.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(params.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = await this.signTokens({ id: user.id, email: user.email });
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setRefreshTokenHash(user.id, refreshTokenHash);
        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }
    async refresh(params) {
        const refreshSecret = this.config.getOrThrow('JWT_REFRESH_SECRET');
        let payload;
        try {
            payload = await this.jwt.verifyAsync(params.refreshToken, {
                secret: refreshSecret,
            });
        }
        catch {
            throw new common_1.ForbiddenException('Invalid refresh token');
        }
        const user = await this.users.findAuthById(payload.sub);
        if (!user)
            throw new common_1.ForbiddenException('Invalid refresh token');
        if (!user.refreshTokenHash)
            throw new common_1.ForbiddenException('Invalid refresh token');
        const ok = await bcrypt.compare(params.refreshToken, user.refreshTokenHash);
        if (!ok)
            throw new common_1.ForbiddenException('Invalid refresh token');
        const tokens = await this.signTokens({ id: user.id, email: user.email });
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setRefreshTokenHash(user.id, refreshTokenHash);
        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }
    async logout(userId) {
        await this.users.setRefreshTokenHash(userId, null);
        return { ok: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map