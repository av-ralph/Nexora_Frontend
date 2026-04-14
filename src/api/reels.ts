import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export interface ReelItem {
  id: string;
  code: string;
  thumbnail_url: string;
  video_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  play_count: number;
  duration: number;
  timestamp: number;
  caption: string;
}

export interface ParseiumReelsResponse {
  user_id: string;
  reels: ReelItem[];
  pagination: {
    continuation: string;
    has_more_reels: boolean;
  };
}

export const fetchInstagramReels = async (params: {
  username?: string; 
  user_id?: string; 
  continuation?: string 
} = {}): Promise<ParseiumReelsResponse> => {
  try {
    const res = await axios.get<ParseiumReelsResponse>(`${VITE_API_URL}/reels`, {
      params: params && typeof params === 'object' ? params : {}
    });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch Instagram reels:', error);
    throw new Error('Could not load reels. Please try again later.');
  }
};
