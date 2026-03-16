import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findAuthByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, passwordHash: true, refreshTokenHash: true },
        });
    }

    async findAuthById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, passwordHash: true, refreshTokenHash: true },
        });
    }

    async createUser(params: { email: string; name?: string; passwordHash: string }) {
        try {
            return await this.prisma.user.create({
                data: {
                    email: params.email,
                    name: params.name,
                    passwordHash: params.passwordHash,
                },
                select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
            });
        } catch (e: any) {
            if (e?.code === 'P2002') {
                throw new ConflictException('Email already exists');
            }
            throw e;
        }
    }

    async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash },
        });
    }
}
