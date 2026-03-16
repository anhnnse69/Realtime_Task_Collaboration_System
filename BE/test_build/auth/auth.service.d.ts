import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly config;
    constructor(users: UsersService, jwt: JwtService, config: ConfigService);
    private signTokens;
    register(params: {
        email: string;
        password: string;
        name?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(params: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    refresh(params: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    logout(userId: string): Promise<{
        ok: boolean;
    }>;
}
