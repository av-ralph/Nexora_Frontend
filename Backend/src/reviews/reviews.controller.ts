import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':movieId')
  async getMovieReviews(
    @Param('movieId') movieId: string,
    @Query('sortBy') sortBy: 'newest' | 'top' = 'newest',
  ) {
    return this.reviewsService.getMovieReviews(parseInt(movieId), sortBy);
  }

  @Get(':movieId/stats')
  async getMovieStats(@Param('movieId') movieId: string) {
    return this.reviewsService.getMovieStats(parseInt(movieId));
  }

  @Post()
  async createReview(
    @Body() data: { movieId: number; authorId: string; authorName: string; rating: number; content: string },
  ) {
    return this.reviewsService.createReview(data);
  }

  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() data: { authorId: string; rating: number; content: string },
  ) {
    return this.reviewsService.updateReview(id, data);
  }

  @Delete(':id')
  async deleteReview(
    @Param('id') id: string,
    @Query('authorId') authorId: string,
  ) {
    return this.reviewsService.deleteReview(id, authorId);
  }

  @Post(':id/like')
  async toggleLike(
    @Param('id') id: string,
    @Body() data: { userId: string },
  ) {
    return this.reviewsService.toggleLike(id, data.userId);
  }
}
