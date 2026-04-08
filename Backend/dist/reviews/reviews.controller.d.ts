import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getMovieReviews(movieId: string, sortBy?: 'newest' | 'top'): Promise<{
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
    getMovieStats(movieId: string): Promise<{
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
    toggleLike(id: string, data: {
        userId: string;
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
}
