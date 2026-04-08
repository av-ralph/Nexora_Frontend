import * as reviewsAPI from '../api/reviews';

export interface Review {
  id: string;
  movieId: number;
  authorId: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy: string[];
}

export const getReviews = async (movieId: number, sortBy: 'newest' | 'top' = 'newest') => {
  try {
    const reviews = await reviewsAPI.getMovieReviews(movieId, sortBy);
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getReviewStats = async (movieId: number) => {
  try {
    const stats = await reviewsAPI.getMovieStats(movieId);
    return stats;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
};

export const addReview = async (
  movieId: number,
  authorId: string,
  authorName: string,
  rating: number,
  content: string
) => {
  try {
    const review = await reviewsAPI.createReview({
      movieId,
      authorId,
      authorName,
      rating,
      content,
    });
    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: string,
  authorId: string,
  rating: number,
  content: string
) => {
  try {
    const review = await reviewsAPI.updateReview(reviewId, {
      rating,
      content,
    });
    return review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string, authorId: string) => {
  try {
    await reviewsAPI.deleteReview(reviewId);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const toggleReviewLike = async (reviewId: string, userId: string) => {
  try {
    const review = await reviewsAPI.toggleReviewLike(reviewId, userId);
    return review;
  } catch (error) {
    console.error('Error toggling review like:', error);
    throw error;
  }
};
