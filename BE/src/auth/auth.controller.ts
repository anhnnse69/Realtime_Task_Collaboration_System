import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/types/jwt-user.type';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly users: UsersService,
    ) { }

    private setRefreshCookie(res: Response, refreshToken: string) {
        res.cookie('rt', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
    }

    private clearRefreshCookie(res: Response) {
        res.clearCookie('rt', { path: '/' });
    }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.register(dto);
        this.setRefreshCookie(res, result.refreshToken);
        return result;
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.login(dto);
        this.setRefreshCookie(res, result.refreshToken);
        return result;
    }

    @Post('refresh')
    async refresh(
        @Body() dto: RefreshDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = dto.refreshToken ?? (req.cookies?.rt as string | undefined);
        if (!token) throw new BadRequestException('Missing refresh token');

        const result = await this.auth.refresh({ refreshToken: token });
        this.setRefreshCookie(res, result.refreshToken);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@CurrentUser() user: JwtUser, @Res({ passthrough: true }) res: Response) {
        this.clearRefreshCookie(res);
        return this.auth.logout(user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@CurrentUser() user: JwtUser) {
        return this.users.findById(user.sub);
    }
}
