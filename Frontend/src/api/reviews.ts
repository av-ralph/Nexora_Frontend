import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export interface Review {
  id: string;
  movieId: number;
  authorId: string;
  authorName: string;
  rating: number;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export const getMovieReviews = async (
  movieId: number,
  sortBy: "newest" | "top" = "newest"
) => {
  try {
    const res = await api.get(`/reviews/${movieId}`, {
      params: { sortBy },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const getMovieStats = async (movieId: number): Promise<ReviewStats> => {
  try {
    const res = await api.get(`/reviews/${movieId}/stats`);
    return res.data;
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw error;
  }
};

export const createReview = async (data: {
  movieId: number;
  authorId: string;
  authorName: string;
  rating: number;
  content: string;
}): Promise<Review> => {
  try {
    const res = await api.post("/reviews", data);
    return res.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const updateReview = async (
  id: string,
  data: {
    rating: number;
    content: string;
  }
): Promise<Review> => {
  try {
    const res = await api.patch(`/reviews/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${id}`);
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

export const toggleReviewLike = async (
  id: string,
  userId: string
): Promise<Review> => {
  try {
    const res = await api.post(`/reviews/${id}/like`, { userId });
    return res.data;
  } catch (error) {
    console.error("Error toggling review like:", error);
    throw error;
  }
};
