import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFavoriteDto: CreateFavoriteDto): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        created_at: Date;
    }>;
    findAll(userId?: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        created_at: Date;
    }[]>;
    findOne(id: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        created_at: Date;
    } | null>;
    remove(id: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        created_at: Date;
    }>;
    removeByUserAndMovie(userId: string, movieId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
