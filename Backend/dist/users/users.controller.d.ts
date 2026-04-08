import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<{
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
    remove(id: string): Promise<{
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
