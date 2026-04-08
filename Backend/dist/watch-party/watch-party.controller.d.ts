import { WatchPartyService } from './watch-party.service';
export declare class WatchPartyController {
    private readonly watchPartyService;
    constructor(watchPartyService: WatchPartyService);
    createRoom(data: {
        hostId: string;
        hostName: string;
        mediaTitle: string;
        mediaPoster?: string;
    }): Promise<{
        roomId: any;
        hostId: any;
        hostName: any;
        mediaTitle: any;
        mediaPoster: any;
        createdAt: any;
        participants: any;
        playback: {
            state: any;
            position: any;
            updatedAt: any;
        };
        chatMessages: any;
    }>;
    getRoom(roomId: string): Promise<{
        roomId: any;
        hostId: any;
        hostName: any;
        mediaTitle: any;
        mediaPoster: any;
        createdAt: any;
        participants: any;
        playback: {
            state: any;
            position: any;
            updatedAt: any;
        };
        chatMessages: any;
    }>;
    joinRoom(roomId: string, data: {
        userId: string;
        userName: string;
    }): Promise<{
        roomId: any;
        hostId: any;
        hostName: any;
        mediaTitle: any;
        mediaPoster: any;
        createdAt: any;
        participants: any;
        playback: {
            state: any;
            position: any;
            updatedAt: any;
        };
        chatMessages: any;
    }>;
    leaveRoom(roomId: string, data: {
        userId: string;
    }): Promise<{
        roomId: any;
        hostId: any;
        hostName: any;
        mediaTitle: any;
        mediaPoster: any;
        createdAt: any;
        participants: any;
        playback: {
            state: any;
            position: any;
            updatedAt: any;
        };
        chatMessages: any;
    }>;
    updatePlayback(roomId: string, data: {
        state: 'playing' | 'paused';
        position: number;
    }): Promise<{
        roomId: any;
        hostId: any;
        hostName: any;
        mediaTitle: any;
        mediaPoster: any;
        createdAt: any;
        participants: any;
        playback: {
            state: any;
            position: any;
            updatedAt: any;
        };
        chatMessages: any;
    }>;
    sendChatMessage(roomId: string, data: {
        userId: string;
        userName: string;
        text: string;
    }): Promise<{
        id: string;
        userId: string;
        userName: string;
        text: string;
        createdAt: string;
    }>;
    getChatMessages(roomId: string): Promise<{
        id: string;
        userId: string;
        userName: string;
        text: string;
        createdAt: string;
    }[]>;
}
