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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const axios_1 = __importDefault(require("axios"));
let AppController = AppController_1 = class AppController {
    appService;
    logger = new common_1.Logger(AppController_1.name);
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getStatus() {
        return {
            status: 'online',
            message: 'Backend is connected to Frontend!',
            timestamp: new Date().toISOString(),
        };
    }
    async getReels(username, user_id, continuation) {
        const API_KEY = process.env.PARSEIUM_API_KEY;
        const BASE_URL = 'https://api.parseium.com/v1/instagram-reels';
        if (!API_KEY) {
            this.logger.error('PARSEIUM_API_KEY is not defined in backend .env');
            throw new common_1.InternalServerErrorException('Server configuration error: API Key missing');
        }
        if (!username && !user_id) {
            throw new common_1.BadRequestException('Either username or user_id is required');
        }
        this.logger.log(`Fetching reels for: ${username || user_id}`);
        try {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    api_key: API_KEY,
                    username,
                    user_id,
                    continuation,
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Parseium API Error: ${error.response?.data?.message || error.message}`);
            throw new common_1.InternalServerErrorException(error.response?.data?.message || 'Failed to fetch reels from Parseium');
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('reels'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Query)('continuation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getReels", null);
exports.AppController = AppController = AppController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map