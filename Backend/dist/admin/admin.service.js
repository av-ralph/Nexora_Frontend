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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let AdminService = class AdminService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async verifyAdmin(email, password) {
        const adminEmails = this.configService
            .get('ADMIN_EMAILS')
            ?.split(',')
            .map((e) => e.trim()) || [];
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials or not an admin');
        }
        if (!user.isAdmin && !adminEmails.includes(email)) {
            throw new common_1.UnauthorizedException('Invalid credentials or not an admin');
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
        const [userCount, activeWatchParties, reviewCount, favoriteCount] = await Promise.all([
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
    async getUsers(page = 1, limit = 20, search) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
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
    async getUserById(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUser(id, data) {
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
    async deleteUser(id) {
        await this.prisma.user.delete({
            where: { id: BigInt(id) },
        });
        return { success: true };
    }
    async getReviews(page = 1, limit = 20, search, movieId) {
        const where = {};
        if (movieId) {
            where.movie_id = movieId;
        }
        if (search) {
            where.OR = [
                { content: { contains: search, mode: 'insensitive' } },
                { author_name: { contains: search, mode: 'insensitive' } },
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
    async deleteReview(id) {
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
    async endWatchParty(id) {
        await this.prisma.watchPartyRoom.delete({
            where: { id },
        });
        return { success: true };
    }
    async getFavorites(page = 1, limit = 20, userId) {
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
    async getWatchHistory(page = 1, limit = 20, userId) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AdminService);
//# sourceMappingURL=admin.service.js.map