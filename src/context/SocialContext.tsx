import { createContext, useContext, type ReactNode } from 'react';
import {
  addReview,
  deleteReview,
  getReviewStats,
  getReviews,
  toggleReviewLike,
  updateReview,
  type Review,
} from '../services/reviewService';

interface SocialContextValue {
  getMovieReviews: (movieId: number, sortBy?: 'newest' | 'top') => Promise<Review[]>;
  getMovieStats: (movieId: number) => Promise<{ averageRating: number; totalReviews: number }>;
  createReview: (movieId: number, authorId: string, authorName: string, rating: number, content: string) => Promise<Review>;
  editReview: (reviewId: string, authorId: string, rating: number, content: string) => Promise<Review>;
  removeReview: (reviewId: string, authorId: string) => Promise<boolean>;
  likeReview: (reviewId: string, userId: string) => Promise<Review>;
}

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const value: SocialContextValue = {
    getMovieReviews: async (movieId: number, sortBy: 'newest' | 'top' = 'newest') => {
      return getReviews(movieId, sortBy);
    },
    getMovieStats: async (movieId: number) => {
      return getReviewStats(movieId);
    },
    createReview: async (movieId: number, authorId: string, authorName: string, rating: number, content: string) => {
      return addReview(movieId, authorId, authorName, rating, content);
    },
    editReview: async (reviewId: string, authorId: string, rating: number, content: string) => {
      return updateReview(reviewId, authorId, rating, content);
    },
    removeReview: async (reviewId: string, authorId: string) => {
      return deleteReview(reviewId, authorId);
    },
    likeReview: async (reviewId: string, userId: string) => {
      return toggleReviewLike(reviewId, userId);
    },
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within SocialProvider');
  }
  return context;
};
