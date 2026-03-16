import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';

type Tokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    private async signTokens(user: { id: string; email: string }): Promise<Tokens> {
        const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        const accessTtl = (this.config.get<string>('JWT_ACCESS_TTL') ?? '15m') as StringValue;
        const refreshTtl = (this.config.get<string>('JWT_REFRESH_TTL') ?? '7d') as StringValue;

        const payload = { sub: user.id, email: user.email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, { secret: accessSecret, expiresIn: accessTtl }),
            this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: refreshTtl }),
        ]);

        return { accessToken, refreshToken };
    }

    async register(params: { email: string; password: string; name?: string }) {
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

    async login(params: { email: string; password: string }) {
        const user = await this.users.findAuthByEmail(params.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await bcrypt.compare(params.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.signTokens({ id: user.id, email: user.email });
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setRefreshTokenHash(user.id, refreshTokenHash);

        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }

    async refresh(params: { refreshToken: string }) {
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

        let payload: { sub: string; email: string };
        try {
            payload = await this.jwt.verifyAsync(params.refreshToken, {
                secret: refreshSecret,
            });
        } catch {
            throw new ForbiddenException('Invalid refresh token');
        }

        const user = await this.users.findAuthById(payload.sub);
        if (!user) throw new ForbiddenException('Invalid refresh token');
        if (!user.refreshTokenHash) throw new ForbiddenException('Invalid refresh token');

        const ok = await bcrypt.compare(params.refreshToken, user.refreshTokenHash);
        if (!ok) throw new ForbiddenException('Invalid refresh token');

        const tokens = await this.signTokens({ id: user.id, email: user.email });
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setRefreshTokenHash(user.id, refreshTokenHash);

        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.users.setRefreshTokenHash(userId, null);
        return { ok: true };
    }
}
