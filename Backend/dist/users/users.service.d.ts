import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        status: string | null;
        email: string | null;
        password: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
        updatedAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<{
        status: string | null;
        email: string | null;
        password: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
        updatedAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: number): Promise<{
        status: string | null;
        email: string | null;
        password: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
        updatedAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<{
        status: string | null;
        email: string | null;
        password: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
        updatedAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: number): Promise<{
        status: string | null;
        email: string | null;
        password: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
        updatedAt: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
