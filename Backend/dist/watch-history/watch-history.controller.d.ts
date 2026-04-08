import { WatchHistoryService } from './watch-history.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
export declare class WatchHistoryController {
    private readonly watchHistoryService;
    constructor(watchHistoryService: WatchHistoryService);
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
    removeByUserAndMovie(userId: string, movieId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
