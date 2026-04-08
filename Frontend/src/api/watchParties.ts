import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export interface WatchPartyParticipant {
  id: string;
  name: string;
  joinedAt: string;
  isHost: boolean;
}

export interface WatchPartyChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface WatchPartyPlayback {
  state: "playing" | "paused";
  position: number;
  updatedAt: string;
}

export interface WatchPartyRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  mediaTitle: string;
  mediaPoster?: string;
  createdAt: string;
  participants: WatchPartyParticipant[];
  playback: WatchPartyPlayback;
  chatMessages: WatchPartyChatMessage[];
}

export const createWatchPartyRoom = async (data: {
  hostId: string;
  hostName: string;
  mediaTitle: string;
  mediaPoster?: string;
}): Promise<WatchPartyRoom> => {
  try {
    const res = await api.post("/watch-party/rooms", data);
    return res.data;
  } catch (error) {
    console.error("Error creating watch party room:", error);
    throw error;
  }
};

export const getWatchPartyRoom = async (
  roomId: string
): Promise<WatchPartyRoom> => {
  try {
    const res = await api.get(`/watch-party/rooms/${roomId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching watch party room:", error);
    throw error;
  }
};

export const joinWatchPartyRoom = async (
  roomId: string,
  data: { userId: string; userName: string }
): Promise<WatchPartyRoom> => {
  try {
    const res = await api.post(`/watch-party/rooms/${roomId}/join`, data);
    return res.data;
  } catch (error) {
    console.error("Error joining watch party room:", error);
    throw error;
  }
};

export const leaveWatchPartyRoom = async (
  roomId: string,
  userId: string
): Promise<WatchPartyRoom> => {
  try {
    const res = await api.post(`/watch-party/rooms/${roomId}/leave`, {
      userId,
    });
    return res.data;
  } catch (error) {
    console.error("Error leaving watch party room:", error);
    throw error;
  }
};

export const updatePlaybackState = async (
  roomId: string,
  data: { state: "playing" | "paused"; position: number }
): Promise<WatchPartyRoom> => {
  try {
    const res = await api.patch(`/watch-party/rooms/${roomId}/playback`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating playback state:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  roomId: string,
  data: { userId: string; userName: string; text: string }
): Promise<WatchPartyChatMessage> => {
  try {
    const res = await api.post(`/watch-party/rooms/${roomId}/chat`, data);
    return res.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export const getChatMessages = async (
  roomId: string
): Promise<WatchPartyChatMessage[]> => {
  try {
    const res = await api.get(`/watch-party/rooms/${roomId}/messages`);
    return res.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};
