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
exports.WatchHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WatchHistoryService = class WatchHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createWatchHistoryDto) {
        try {
            return await this.prisma.watchHistory.create({
                data: createWatchHistoryDto,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
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
    async findAll(userId) {
        return this.prisma.watchHistory.findMany({
            where: userId ? { user_id: userId } : {},
            orderBy: { watched_at: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.watchHistory.findUnique({
            where: { id },
        });
    }
    async remove(id) {
        return this.prisma.watchHistory.delete({
            where: { id },
        });
    }
    async removeByUserAndMovie(userId, movieId) {
        return this.prisma.watchHistory.deleteMany({
            where: { user_id: userId, movie_id: movieId },
        });
    }
};
exports.WatchHistoryService = WatchHistoryService;
exports.WatchHistoryService = WatchHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WatchHistoryService);
//# sourceMappingURL=watch-history.service.js.map