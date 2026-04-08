import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    private readonly logger;
    constructor(appService: AppService);
    getHello(): string;
    getStatus(): {
        status: string;
        message: string;
        timestamp: string;
    };
    getReels(username?: string, user_id?: string, continuation?: string): Promise<any>;
}
