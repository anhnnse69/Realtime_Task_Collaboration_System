import type { Request, Response } from 'express';
import type { JwtUser } from '../common/types/jwt-user.type';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly auth;
    private readonly users;
    constructor(auth: AuthService, users: UsersService);
    private setRefreshCookie;
    private clearRefreshCookie;
    register(dto: RegisterDto, res: Response): Promise<{
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
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    refresh(dto: RefreshDto, req: Request, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    logout(user: JwtUser, res: Response): Promise<{
        ok: boolean;
    }>;
    me(user: JwtUser): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
