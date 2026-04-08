"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchPartyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WatchPartyService = class WatchPartyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom(data) {
        const room = await this.prisma.watchPartyRoom.create({
            data: {
                host_id: data.hostId,
                host_name: data.hostName,
                media_title: data.mediaTitle,
                media_poster: data.mediaPoster,
                participants: {
                    create: {
                        user_id: data.hostId,
                        user_name: data.hostName,
                        is_host: true,
                    },
                },
            },
            include: {
                participants: true,
                messages: true,
            },
        });
        return this.formatRoom(room);
    }
    async getRoom(roomId) {
        const room = await this.prisma.watchPartyRoom.findUnique({
            where: { id: roomId },
            include: {
                participants: true,
                messages: { orderBy: { created_at: 'asc' }, take: 100 },
            },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return this.formatRoom(room);
    }
    async joinRoom(roomId, data) {
        const room = await this.prisma.watchPartyRoom.findUnique({
            where: { id: roomId },
            include: { participants: true, messages: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const existing = room.participants.find((p) => p.user_id === data.userId);
        if (!existing) {
            await this.prisma.watchPartyParticipant.create({
                data: {
                    room_id: roomId,
                    user_id: data.userId,
                    user_name: data.userName,
                    is_host: false,
                },
            });
        }
        const updated = await this.prisma.watchPartyRoom.findUnique({
            where: { id: roomId },
            include: {
                participants: true,
                messages: { orderBy: { created_at: 'asc' }, take: 100 },
            },
        });
        return this.formatRoom(updated);
    }
    async leaveRoom(roomId, userId) {
        const room = await this.prisma.watchPartyRoom.findUnique({
            where: { id: roomId },
            include: { participants: true, messages: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        await this.prisma.watchPartyParticipant.deleteMany({
            where: { room_id: roomId, user_id: userId },
        });
        const isHost = room.participants.some((p) => p.user_id === userId && p.is_host);
        if (isHost && room.participants.length > 1) {
            const newHost = room.participants.find((p) => p.user_id !== userId);
            if (newHost) {
                await this.prisma.watchPartyRoom.update({
                    where: { id: roomId },
                    data: {
                        host_id: newHost.user_id,
                        host_name: newHost.user_name,
                    },
                });
                await this.prisma.watchPartyParticipant.updateMany({
                    where: { room_id: roomId, user_id: newHost.user_id },
                    data: { is_host: true },
                });
            }
        }
        const updated = await this.prisma.watchPartyRoom.findUnique({
            where: { id: roomId },
            include: {
                participants: true,
                messages: { orderBy: { created_at: 'asc' }, take: 100 },
            },
        });
        return this.formatRoom(updated);
    }
    async updatePlayback(roomId, data) {
        const updated = await this.prisma.watchPartyRoom.update({
            where: { id: roomId },
            data: {
                playback_state: data.state,
                playback_position: data.position,
                playback_updated_at: new Date(),
            },
            include: {
                participants: true,
                messages: { orderBy: { created_at: 'asc' }, take: 100 },
            },
        });
        return this.formatRoom(updated);
    }
    async sendChatMessage(roomId, data) {
        const message = await this.prisma.watchPartyChatMessage.create({
            data: {
                room_id: roomId,
                user_id: data.userId,
                user_name: data.userName,
                text: data.text,
            },
        });
        return {
            id: message.id,
            userId: message.user_id,
            userName: message.user_name,
            text: message.text,
            createdAt: message.created_at.toISOString(),
        };
    }
    async getChatMessages(roomId) {
        const messages = await this.prisma.watchPartyChatMessage.findMany({
            where: { room_id: roomId },
            orderBy: { created_at: 'asc' },
            take: 100,
        });
        return messages.map((m) => ({
            id: m.id,
            userId: m.user_id,
            userName: m.user_name,
            text: m.text,
            createdAt: m.created_at.toISOString(),
        }));
    }
    formatRoom(room) {
        return {
            roomId: room.id,
            hostId: room.host_id,
            hostName: room.host_name,
            mediaTitle: room.media_title,
            mediaPoster: room.media_poster,
            createdAt: room.created_at.toISOString(),
            participants: room.participants.map((p) => ({
                id: p.user_id,
                name: p.user_name,
                joinedAt: p.joined_at.toISOString(),
                isHost: p.is_host,
            })),
            playback: {
                state: room.playback_state,
                position: room.playback_position,
                updatedAt: room.playback_updated_at.toISOString(),
            },
            chatMessages: (room.messages || []).map((m) => ({
                id: m.id,
                userId: m.user_id,
                userName: m.user_name,
                text: m.text,
                createdAt: m.created_at.toISOString(),
            })),
        };
    }
};
exports.WatchPartyService = WatchPartyService;
exports.WatchPartyService = WatchPartyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WatchPartyService);
//# sourceMappingURL=watch-party.service.js.map