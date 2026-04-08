import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createWatchHistoryDto: CreateWatchHistoryDto) {
    try {
      return await this.prisma.watchHistory.create({
        data: createWatchHistoryDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Update the existing entry instead of creating new
        return this.prisma.watchHistory.update({
          where: {
            watch_history_user_id_movie_id_key: {
              user_id: createWatchHistoryDto.user_id,
              movie_id: createWatchHistoryDto.movie_id,
            },
          },
          data: {
            watched_at: new Date(),
            ...createWatchHistoryDto,
          },
        });
      }
      throw error;
    }
  }

  async findAll(userId?: string) {
    return this.prisma.watchHistory.findMany({
      where: userId ? { user_id: userId } : {},
      orderBy: { watched_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.watchHistory.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.watchHistory.delete({
      where: { id },
    });
  }

  async removeByUserAndMovie(userId: string, movieId: number) {
    return this.prisma.watchHistory.deleteMany({
      where: { user_id: userId, movie_id: movieId },
    });
  }
}