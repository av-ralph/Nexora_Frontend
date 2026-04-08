import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
export declare class WatchHistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createWatchHistoryDto: CreateWatchHistoryDto): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        watched_at: Date;
    }>;
    findAll(userId?: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        watched_at: Date;
    }[]>;
    findOne(id: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        watched_at: Date;
    } | null>;
    remove(id: string): Promise<{
        user_id: string;
        id: string;
        movie_id: bigint;
        movie_title: string | null;
        movie_poster: string | null;
        media_type: string | null;
        watched_at: Date;
    }>;
    removeByUserAndMovie(userId: string, movieId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
