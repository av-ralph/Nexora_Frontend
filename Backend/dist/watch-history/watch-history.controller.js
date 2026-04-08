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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchHistoryController = void 0;
const common_1 = require("@nestjs/common");
const watch_history_service_1 = require("./watch-history.service");
const create_watch_history_dto_1 = require("./dto/create-watch-history.dto");
let WatchHistoryController = class WatchHistoryController {
    watchHistoryService;
    constructor(watchHistoryService) {
        this.watchHistoryService = watchHistoryService;
    }
    create(createWatchHistoryDto) {
        return this.watchHistoryService.create(createWatchHistoryDto);
    }
    findAll(userId) {
        return this.watchHistoryService.findAll(userId);
    }
    findOne(id) {
        return this.watchHistoryService.findOne(id);
    }
    remove(id) {
        return this.watchHistoryService.remove(id);
    }
    removeByUserAndMovie(userId, movieId) {
        return this.watchHistoryService.removeByUserAndMovie(userId, +movieId);
    }
};
exports.WatchHistoryController = WatchHistoryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_watch_history_dto_1.CreateWatchHistoryDto]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('user/:userId/movie/:movieId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('movieId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchHistoryController.prototype, "removeByUserAndMovie", null);
exports.WatchHistoryController = WatchHistoryController = __decorate([
    (0, common_1.Controller)('watch-history'),
    __metadata("design:paramtypes", [watch_history_service_1.WatchHistoryService])
], WatchHistoryController);
//# sourceMappingURL=watch-history.controller.js.map