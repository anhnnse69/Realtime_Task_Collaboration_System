import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAuthByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        refreshTokenHash: string;
    }>;
    findAuthById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        refreshTokenHash: string;
    }>;
    createUser(params: {
        email: string;
        name?: string;
        passwordHash: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void>;
}
