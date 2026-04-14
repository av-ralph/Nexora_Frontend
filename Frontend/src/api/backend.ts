import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const fetchBackendStatus = async () => {
  try {
    const res = await api.get("/status");
    return res.data;
  } catch (error) {
    console.error("Error connecting to backend:", error);
    throw error;
  }
};

// User API
export const createUser = async (userData: any) => {
  const res = await api.post("/users", userData);
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getUser = async (id: number) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const updateUser = async (id: number, userData: any) => {
  const res = await api.patch(`/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Favorites API
export const addFavorite = async (favoriteData: any) => {
  const res = await api.post("/favorites", favoriteData);
  return res.data;
};

export const getFavorites = async (userId?: string) => {
  const res = await api.get("/favorites", { params: { userId } });
  return res.data;
};

export const removeFavorite = async (id: string) => {
  const res = await api.delete(`/favorites/${id}`);
  return res.data;
};

export const removeFavoriteByUserAndMovie = async (userId: string, movieId: number) => {
  const res = await api.delete(`/favorites/user/${userId}/movie/${movieId}`);
  return res.data;
};

// Watch History API
export const addToWatchHistory = async (historyData: any) => {
  const res = await api.post("/watch-history", historyData);
  return res.data;
};

export const getWatchHistory = async (userId?: string) => {
  const res = await api.get("/watch-history", { params: { userId } });
  return res.data;
};

export const removeFromWatchHistory = async (id: string) => {
  const res = await api.delete(`/watch-history/${id}`);
  return res.data;
};

export const removeWatchHistoryByUserAndMovie = async (userId: string, movieId: number) => {
  const res = await api.delete(`/watch-history/user/${userId}/movie/${movieId}`);
  return res.data;
};

export default api;
