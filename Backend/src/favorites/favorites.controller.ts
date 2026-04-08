import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.favoritesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoritesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }

  @Delete('user/:userId/movie/:movieId')
  removeByUserAndMovie(@Param('userId') userId: string, @Param('movieId') movieId: string) {
    return this.favoritesService.removeByUserAndMovie(userId, +movieId);
  }
}