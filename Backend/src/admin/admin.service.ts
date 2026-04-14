import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ReviewActionDto, MediaContentDto } from './dto/admin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async verifyAdmin(email: string, password: string) {
    const adminEmails = this.configService
      .get<string>('ADMIN_EMAILS')
      ?.split(',')
      .map((e) => e.trim()) || [];

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials or not an admin');
    }

    if (!user.isAdmin && !adminEmails.includes(email)) {
      throw new UnauthorizedException('Invalid credentials or not an admin');
    }

    const updatedUser = !user.isAdmin
      ? await this.prisma.user.update({
          where: { email },
          data: { isAdmin: true },
        })
      : user;

    return {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: true,
    };
  }

  async getStats() {
    const [userCount, activeWatchParties, reviewCount, favoriteCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.watchPartyRoom.count(),
        this.prisma.review.count(),
        this.prisma.favorite.count(),
      ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    const recentReviews = await this.prisma.review.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        movie_id: true,
        author_id: true,
        author_name: true,
        rating: true,
        content: true,
        likes: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      userCount,
      activeWatchParties,
      reviewCount,
      favoriteCount,
      recentUsers,
      recentReviews,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          status: true,
          createdAt: true,
          profileUrl: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        status: true,
        createdAt: true,
        profileUrl: true,
        authId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin,
        status: data.status,
        profileUrl: data.profileUrl,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
    };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({
      where: { id: BigInt(id) },
    });
    return { success: true };
  }

  async getReviews(page = 1, limit = 20, search?: string, movieId?: number) {
    const where: any = {};
    
    if (movieId) {
      where.movie_id = movieId;
    }
    
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' as const } },
        { author_name: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  async deleteReview(id: string) {
    await this.prisma.review.delete({
      where: { id },
    });
    return { success: true };
  }

  async getWatchParties(page = 1, limit = 20) {
    const [rooms, total] = await Promise.all([
      this.prisma.watchPartyRoom.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          participants: {
            select: { id: true, user_name: true, is_host: true },
          },
          _count: {
            select: { messages: true, participants: true },
          },
        },
      }),
      this.prisma.watchPartyRoom.count(),
    ]);

    return { rooms, total, page, limit };
  }

  async endWatchParty(id: string) {
    await this.prisma.watchPartyRoom.delete({
      where: { id },
    });
    return { success: true };
  }

  async getFavorites(page = 1, limit = 20, userId?: string) {
    const where = userId ? { user_id: userId } : {};

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.favorite.count({ where }),
    ]);

    return { favorites, total, page, limit };
  }

  async getWatchHistory(page = 1, limit = 20, userId?: string) {
    const where = userId ? { user_id: userId } : {};

    const [history, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { watched_at: 'desc' },
      }),
      this.prisma.watchHistory.count({ where }),
    ]);

    return { history, total, page, limit };
  }
}
