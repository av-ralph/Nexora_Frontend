"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMovieReviews(movieId, sortBy = 'newest') {
        const reviews = await this.prisma.review.findMany({
            where: { movie_id: movieId },
            orderBy: sortBy === 'top' ? [{ likes: 'desc' }, { created_at: 'desc' }] : { created_at: 'desc' },
        });
        return reviews.map((r) => ({
            id: r.id,
            movieId: r.movie_id,
            authorId: r.author_id,
            authorName: r.author_name,
            rating: r.rating,
            content: r.content,
            createdAt: r.created_at.toISOString(),
            updatedAt: r.updated_at.toISOString(),
            likes: r.likes,
            likedBy: r.liked_by || [],
        }));
    }
    async getMovieStats(movieId) {
        const reviews = await this.prisma.review.findMany({
            where: { movie_id: movieId },
        });
        if (reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return {
            averageRating: Number(averageRating.toFixed(1)),
            totalReviews: reviews.length,
        };
    }
    async createReview(data) {
        const review = await this.prisma.review.create({
            data: {
                movie_id: data.movieId,
                author_id: data.authorId,
                author_name: data.authorName,
                rating: data.rating,
                content: data.content,
            },
        });
        return {
            id: review.id,
            movieId: review.movie_id,
            authorId: review.author_id,
            authorName: review.author_name,
            rating: review.rating,
            content: review.content,
            createdAt: review.created_at.toISOString(),
            updatedAt: review.updated_at.toISOString(),
            likes: review.likes,
            likedBy: review.liked_by || [],
        };
    }
    async updateReview(id, data) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.author_id !== data.authorId)
            throw new common_1.ForbiddenException('Cannot edit another user\'s review');
        const updated = await this.prisma.review.update({
            where: { id },
            data: { rating: data.rating, content: data.content },
        });
        return {
            id: updated.id,
            movieId: updated.movie_id,
            authorId: updated.author_id,
            authorName: updated.author_name,
            rating: updated.rating,
            content: updated.content,
            createdAt: updated.created_at.toISOString(),
            updatedAt: updated.updated_at.toISOString(),
            likes: updated.likes,
            likedBy: updated.liked_by || [],
        };
    }
    async deleteReview(id, authorId) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.author_id !== authorId)
            throw new common_1.ForbiddenException('Cannot delete another user\'s review');
        await this.prisma.review.delete({ where: { id } });
        return { success: true };
    }
    async toggleLike(id, userId) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const likedBy = review.liked_by || [];
        const hasLiked = likedBy.includes(userId);
        const updatedLikedBy = hasLiked ? likedBy.filter((uid) => uid !== userId) : [...likedBy, userId];
        const updated = await this.prisma.review.update({
            where: { id },
            data: {
                likes: hasLiked ? Math.max(0, review.likes - 1) : review.likes + 1,
                liked_by: updatedLikedBy,
            },
        });
        return {
            id: updated.id,
            movieId: updated.movie_id,
            authorId: updated.author_id,
            authorName: updated.author_name,
            rating: updated.rating,
            content: updated.content,
            createdAt: updated.created_at.toISOString(),
            updatedAt: updated.updated_at.toISOString(),
            likes: updated.likes,
            likedBy: updated.liked_by || [],
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map