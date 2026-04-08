import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';

@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post()
  create(@Body() createWatchHistoryDto: CreateWatchHistoryDto) {
    return this.watchHistoryService.create(createWatchHistoryDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.watchHistoryService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchHistoryService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchHistoryService.remove(id);
  }

  @Delete('user/:userId/movie/:movieId')
  removeByUserAndMovie(@Param('userId') userId: string, @Param('movieId') movieId: string) {
    return this.watchHistoryService.removeByUserAndMovie(userId, +movieId);
  }
}