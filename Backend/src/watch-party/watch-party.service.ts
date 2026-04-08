import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchPartyService {
  constructor(private prisma: PrismaService) {}

  async createRoom(data: {
    hostId: string;
    hostName: string;
    mediaTitle: string;
    mediaPoster?: string;
  }) {
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

  async getRoom(roomId: string) {
    const room = await this.prisma.watchPartyRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
        messages: { orderBy: { created_at: 'asc' }, take: 100 },
      },
    });

    if (!room) throw new NotFoundException('Room not found');
    return this.formatRoom(room);
  }

  async joinRoom(
    roomId: string,
    data: { userId: string; userName: string },
  ) {
    const room = await this.prisma.watchPartyRoom.findUnique({
      where: { id: roomId },
      include: { participants: true, messages: true },
    });

    if (!room) throw new NotFoundException('Room not found');

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

    return this.formatRoom(updated!);
  }

  async leaveRoom(roomId: string, userId: string) {
    const room = await this.prisma.watchPartyRoom.findUnique({
      where: { id: roomId },
      include: { participants: true, messages: true },
    });

    if (!room) throw new NotFoundException('Room not found');

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

    return this.formatRoom(updated!);
  }

  async updatePlayback(
    roomId: string,
    data: { state: 'playing' | 'paused'; position: number },
  ) {
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

  async sendChatMessage(
    roomId: string,
    data: { userId: string; userName: string; text: string },
  ) {
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

  async getChatMessages(roomId: string) {
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

  private formatRoom(room: any) {
    return {
      roomId: room.id,
      hostId: room.host_id,
      hostName: room.host_name,
      mediaTitle: room.media_title,
      mediaPoster: room.media_poster,
      createdAt: room.created_at.toISOString(),
      participants: room.participants.map((p: any) => ({
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
      chatMessages: (room.messages || []).map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        userName: m.user_name,
        text: m.text,
        createdAt: m.created_at.toISOString(),
      })),
    };
  }
}
