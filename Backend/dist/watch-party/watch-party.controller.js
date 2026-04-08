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
exports.WatchPartyController = void 0;
const common_1 = require("@nestjs/common");
const watch_party_service_1 = require("./watch-party.service");
let WatchPartyController = class WatchPartyController {
    watchPartyService;
    constructor(watchPartyService) {
        this.watchPartyService = watchPartyService;
    }
    async createRoom(data) {
        return this.watchPartyService.createRoom(data);
    }
    async getRoom(roomId) {
        return this.watchPartyService.getRoom(roomId);
    }
    async joinRoom(roomId, data) {
        return this.watchPartyService.joinRoom(roomId, data);
    }
    async leaveRoom(roomId, data) {
        return this.watchPartyService.leaveRoom(roomId, data.userId);
    }
    async updatePlayback(roomId, data) {
        return this.watchPartyService.updatePlayback(roomId, data);
    }
    async sendChatMessage(roomId, data) {
        return this.watchPartyService.sendChatMessage(roomId, data);
    }
    async getChatMessages(roomId) {
        return this.watchPartyService.getChatMessages(roomId);
    }
};
exports.WatchPartyController = WatchPartyController;
__decorate([
    (0, common_1.Post)('rooms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms/:roomId'),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/join'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/leave'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "leaveRoom", null);
__decorate([
    (0, common_1.Patch)('rooms/:roomId/playback'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "updatePlayback", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/chat'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "sendChatMessage", null);
__decorate([
    (0, common_1.Get)('rooms/:roomId/messages'),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WatchPartyController.prototype, "getChatMessages", null);
exports.WatchPartyController = WatchPartyController = __decorate([
    (0, common_1.Controller)('watch-party'),
    __metadata("design:paramtypes", [watch_party_service_1.WatchPartyService])
], WatchPartyController);
//# sourceMappingURL=watch-party.controller.js.map