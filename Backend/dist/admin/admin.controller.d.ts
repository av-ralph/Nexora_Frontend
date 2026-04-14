import { AdminService } from './admin.service';
import { UpdateUserDto, AdminLoginDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(dto: AdminLoginDto): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string | null;
            email: string | null;
            isAdmin: boolean;
        };
        message: string;
    } | {
        success: boolean;
        user: null;
        message: string;
    }>;
    getStats(): Promise<{
        userCount: number;
        activeWatchParties: number;
        reviewCount: number;
        favoriteCount: number;
        recentUsers: {
            status: string | null;
            email: string | null;
            name: string | null;
            id: bigint;
            createdAt: Date | null;
        }[];
        recentReviews: {
            id: string;
            movie_id: bigint;
            created_at: Date;
            author_id: string;
            author_name: string;
            rating: number;
            content: string;
            likes: number;
            updated_at: Date;
        }[];
    }>;
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        users: {
            status: string | null;
            email: string | null;
            name: string | null;
            isAdmin: boolean | null;
            id: bigint;
            createdAt: Date | null;
            profileUrl: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUser(id: string): Promise<{
        status: string | null;
        email: string | null;
        name: string | null;
        isAdmin: boolean | null;
        id: bigint;
        createdAt: Date | null;
        profileUrl: string | null;
        authId: string | null;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: bigint;
        name: string | null;
        email: string | null;
        isAdmin: boolean | null;
        status: string | null;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
    getReviews(page?: number, limit?: number, search?: string, movieId?: string): Promise<{
        reviews: {
            id: string;
            movie_id: bigint;
            created_at: Date;
            author_id: string;
            author_name: string;
            rating: number;
            content: string;
            likes: number;
            liked_by: string[];
            updated_at: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    deleteReview(id: string): Promise<{
        success: boolean;
    }>;
    getWatchParties(page?: number, limit?: number): Promise<{
        rooms: ({
            participants: {
                id: string;
                user_name: string;
                is_host: boolean;
            }[];
            _count: {
                participants: number;
                messages: number;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            host_id: string;
            host_name: string;
            media_title: string;
            media_poster: string | null;
            playback_state: string;
            playback_position: number;
            playback_updated_at: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    endWatchParty(id: string): Promise<{
        success: boolean;
    }>;
    getFavorites(page?: number, limit?: number, userId?: string): Promise<{
        favorites: {
            user_id: string;
            id: string;
            movie_id: bigint;
            movie_title: string | null;
            movie_poster: string | null;
            media_type: string | null;
            created_at: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getWatchHistory(page?: number, limit?: number, userId?: string): Promise<{
        history: {
            user_id: string;
            id: string;
            movie_id: bigint;
            movie_title: string | null;
            movie_poster: string | null;
            media_type: string | null;
            watched_at: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
