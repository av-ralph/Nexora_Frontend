import * as watchPartyAPI from '../api/watchParties';

export interface WatchPartyUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface WatchPartyParticipant {
  id: string;
  name: string;
  joinedAt: string;
  isHost: boolean;
}

export interface WatchPartyPlayerState {
  state: 'paused' | 'playing';
  position: number;
  updatedAt: string;
}

export interface WatchPartyRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  mediaTitle: string;
  mediaPoster: string;
  createdAt: string;
  participants: WatchPartyParticipant[];
  playback: WatchPartyPlayerState;
  chatMessages: ChatMessage[];
}

export const createRoom = async (
  host: WatchPartyUser,
  meta: { mediaTitle: string; mediaPoster: string; roomId?: string }
) => {
  try {
    const room = await watchPartyAPI.createWatchPartyRoom({
      hostId: host.id,
      hostName: host.name,
      mediaTitle: meta.mediaTitle,
      mediaPoster: meta.mediaPoster,
    });
    return normalizeRoom(room);
  } catch (error) {
    console.error('Error creating watch party room:', error);
    throw error;
  }
};

export const joinRoom = async (
  roomId: string,
  user: WatchPartyUser,
  meta?: { mediaTitle?: string; mediaPoster?: string }
) => {
  try {
    const room = await watchPartyAPI.joinWatchPartyRoom(roomId, {
      userId: user.id,
      userName: user.name,
    });
    return normalizeRoom(room);
  } catch (error) {
    console.error('Error joining watch party room:', error);
    throw error;
  }
};

export const getRoom = async (roomId: string) => {
  try {
    const room = await watchPartyAPI.getWatchPartyRoom(roomId);
    return normalizeRoom(room);
  } catch (error) {
    console.error('Error fetching watch party room:', error);
    return null;
  }
};

export const leaveRoom = async (roomId: string, userId: string) => {
  try {
    const room = await watchPartyAPI.leaveWatchPartyRoom(roomId, userId);
    return normalizeRoom(room);
  } catch (error) {
    console.error('Error leaving watch party room:', error);
    return null;
  }
};

export const sendPlaybackEvent = async (
  roomId: string,
  playback: Partial<WatchPartyPlayerState>
) => {
  try {
    const room = await watchPartyAPI.updatePlaybackState(roomId, {
      state: (playback.state || 'paused') as 'playing' | 'paused',
      position: playback.position || 0,
    });
    return normalizeRoom(room);
  } catch (error) {
    console.error('Error updating playback state:', error);
    return null;
  }
};

export const sendChatMessage = async (
  roomId: string,
  user: WatchPartyUser,
  text: string
) => {
  try {
    const message = await watchPartyAPI.sendChatMessage(roomId, {
      userId: user.id,
      userName: user.name,
      text,
    });
    return normalizeMessage(message);
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const subscribeToRoom = (
  roomId: string,
  callback: (room: WatchPartyRoom, eventType: string, payload?: any) => void
) => {
  // Polling implementation - fetches room state every 2 seconds
  let lastState: WatchPartyRoom | null = null;
  let isSubscribed = true;

  const poll = async () => {
    if (!isSubscribed) return;

    try {
      const room = await getRoom(roomId);
      if (!room) {
        isSubscribed && callback(room!, 'ROOM_ERROR', { error: 'Room not found' });
        return;
      }

      // Detect changes and call callback with appropriate event type
      if (!lastState) {
        callback(room, 'ROOM_UPDATE', { room });
      } else {
        if (JSON.stringify(lastState.playback) !== JSON.stringify(room.playback)) {
          callback(room, 'PLAYBACK_EVENT', { playback: room.playback });
        }
        if (lastState.chatMessages.length !== room.chatMessages.length) {
          const newMessage = room.chatMessages[room.chatMessages.length - 1];
          callback(room, 'CHAT_MESSAGE', { message: newMessage });
        }
        if (lastState.participants.length !== room.participants.length) {
          callback(room, 'PARTICIPANTS_UPDATE', { participants: room.participants });
        }
      }

      lastState = room;
    } catch (error) {
      console.error('Error polling room:', error);
    }

    if (isSubscribed) {
      setTimeout(poll, 2000); // Poll every 2 seconds
    }
  };

  poll();

  return () => {
    isSubscribed = false;
  };
};

const normalizeRoom = (room: any): WatchPartyRoom => ({
  roomId: room.roomId,
  hostId: room.hostId,
  hostName: room.hostName,
  mediaTitle: room.mediaTitle,
  mediaPoster: room.mediaPoster || '',
  createdAt: room.createdAt,
  participants: room.participants || [],
  playback: room.playback || { state: 'paused', position: 0, updatedAt: new Date().toISOString() },
  chatMessages: (room.chatMessages || []).map((m: any) => normalizeMessage(m)),
});

const normalizeMessage = (message: any): ChatMessage => ({
  id: message.id,
  userId: message.userId,
  userName: message.userName,
  text: message.text,
  createdAt: message.createdAt,
});
