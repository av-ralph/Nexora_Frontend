import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getMovieReviews(movieId: number, sortBy: 'newest' | 'top' = 'newest') {
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

  async getMovieStats(movieId: number) {
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

  async createReview(data: { movieId: number; authorId: string; authorName: string; rating: number; content: string }) {
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

  async updateReview(
    id: string,
    data: { authorId: string; rating: number; content: string },
  ) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.author_id !== data.authorId) throw new ForbiddenException('Cannot edit another user\'s review');

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

  async deleteReview(id: string, authorId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.author_id !== authorId) throw new ForbiddenException('Cannot delete another user\'s review');

    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }

  async toggleLike(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

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
}
