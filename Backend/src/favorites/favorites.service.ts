import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async create(createFavoriteDto: CreateFavoriteDto) {
    try {
      return await this.prisma.favorite.create({
        data: createFavoriteDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Favorite already exists for this user and movie');
      }
      throw error;
    }
  }

  async findAll(userId?: string) {
    return this.prisma.favorite.findMany({
      where: userId ? { user_id: userId } : {},
    });
  }

  async findOne(id: string) {
    return this.prisma.favorite.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.favorite.delete({
      where: { id },
    });
  }

  async removeByUserAndMovie(userId: string, movieId: number) {
    return this.prisma.favorite.deleteMany({
      where: { user_id: userId, movie_id: movieId },
    });
  }
}