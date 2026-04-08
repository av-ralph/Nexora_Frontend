import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMovieReviews(movieId: number, sortBy?: 'newest' | 'top'): Promise<{
        id: string;
        movieId: bigint;
        authorId: string;
        authorName: string;
        rating: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        likes: number;
        likedBy: string[];
    }[]>;
    getMovieStats(movieId: number): Promise<{
        averageRating: number;
        totalReviews: number;
    }>;
    createReview(data: {
        movieId: number;
        authorId: string;
        authorName: string;
        rating: number;
        content: string;
    }): Promise<{
        id: string;
        movieId: bigint;
        authorId: string;
        authorName: string;
        rating: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        likes: number;
        likedBy: string[];
    }>;
    updateReview(id: string, data: {
        authorId: string;
        rating: number;
        content: string;
    }): Promise<{
        id: string;
        movieId: bigint;
        authorId: string;
        authorName: string;
        rating: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        likes: number;
        likedBy: string[];
    }>;
    deleteReview(id: string, authorId: string): Promise<{
        success: boolean;
    }>;
    toggleLike(id: string, userId: string): Promise<{
        id: string;
        movieId: bigint;
        authorId: string;
        authorName: string;
        rating: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        likes: number;
        likedBy: string[];
    }>;
}
