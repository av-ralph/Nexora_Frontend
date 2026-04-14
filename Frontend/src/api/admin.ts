import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? `${window.location.origin}/api` : "http://127.0.0.1:3001");

const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean | null;
  status: string | null;
  createdAt: string | null;
  profileUrl: string | null;
}

export interface AdminReview {
  id: string;
  movie_id: number;
  author_id: string;
  author_name: string;
  rating: number;
  content: string;
  likes: number;
  created_at: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface WatchPartyRoom {
  id: string;
  host_id: string;
  host_name: string;
  media_title: string;
  media_poster: string | null;
  playback_state: string;
  playback_position: number;
  created_at: string;
  participants: Array<{
    id: string;
    user_name: string;
    is_host: boolean;
  }>;
  _count: {
    messages: number;
    participants: number;
  };
}

export interface AdminStats {
  userCount: number;
  activeWatchParties: number;
  reviewCount: number;
  favoriteCount: number;
  recentUsers: AdminUser[];
  recentReviews: AdminReview[];
}

export const adminLogin = async (email: string, password: string) => {
  const res = await adminApi.post("/admin/login", { email, password });
  return res.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await adminApi.get("/admin/stats");
  return res.data;
};

export const getAdminUsers = async (page = 1, limit = 20, search?: string) => {
  const res = await adminApi.get("/admin/users", { params: { page, limit, search } });
  return res.data;
};

export const getAdminUserById = async (id: string): Promise<AdminUser> => {
  const res = await adminApi.get(`/admin/users/${id}`);
  return res.data;
};

export const updateAdminUser = async (id: string, data: Partial<AdminUser>) => {
  const res = await adminApi.patch(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteAdminUser = async (id: string) => {
  const res = await adminApi.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAdminReviews = async (page = 1, limit = 20, search?: string, movieId?: number) => {
  const res = await adminApi.get("/admin/reviews", { params: { page, limit, search, movieId } });
  return res.data;
};

export const deleteAdminReview = async (id: string) => {
  const res = await adminApi.delete(`/admin/reviews/${id}`);
  return res.data;
};

export const getAdminWatchParties = async (page = 1, limit = 20) => {
  const res = await adminApi.get("/admin/watch-parties", { params: { page, limit } });
  return res.data;
};

export const endAdminWatchParty = async (id: string) => {
  const res = await adminApi.delete(`/admin/watch-parties/${id}`);
  return res.data;
};

export const getAdminFavorites = async (page = 1, limit = 20, userId?: string) => {
  const res = await adminApi.get("/admin/favorites", { params: { page, limit, userId } });
  return res.data;
};

export const getAdminWatchHistory = async (page = 1, limit = 20, userId?: string) => {
  const res = await adminApi.get("/admin/watch-history", { params: { page, limit, userId } });
  return res.data;
};

export default adminApi;
