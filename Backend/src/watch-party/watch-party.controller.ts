import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { WatchPartyService } from './watch-party.service';

@Controller('watch-party')
export class WatchPartyController {
  constructor(private readonly watchPartyService: WatchPartyService) {}

  @Post('rooms')
  async createRoom(
    @Body() data: { hostId: string; hostName: string; mediaTitle: string; mediaPoster?: string },
  ) {
    return this.watchPartyService.createRoom(data);
  }

  @Get('rooms/:roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.watchPartyService.getRoom(roomId);
  }

  @Post('rooms/:roomId/join')
  async joinRoom(
    @Param('roomId') roomId: string,
    @Body() data: { userId: string; userName: string },
  ) {
    return this.watchPartyService.joinRoom(roomId, data);
  }

  @Post('rooms/:roomId/leave')
  async leaveRoom(
    @Param('roomId') roomId: string,
    @Body() data: { userId: string },
  ) {
    return this.watchPartyService.leaveRoom(roomId, data.userId);
  }

  @Patch('rooms/:roomId/playback')
  async updatePlayback(
    @Param('roomId') roomId: string,
    @Body() data: { state: 'playing' | 'paused'; position: number },
  ) {
    return this.watchPartyService.updatePlayback(roomId, data);
  }

  @Post('rooms/:roomId/chat')
  async sendChatMessage(
    @Param('roomId') roomId: string,
    @Body() data: { userId: string; userName: string; text: string },
  ) {
    return this.watchPartyService.sendChatMessage(roomId, data);
  }

  @Get('rooms/:roomId/messages')
  async getChatMessages(
    @Param('roomId') roomId: string,
  ) {
    return this.watchPartyService.getChatMessages(roomId);
  }
}
