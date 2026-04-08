import { Controller, Get, Query, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus() {
    return {
      status: 'online',
      message: 'Backend is connected to Frontend!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Proxies requests to Parseium Instagram Reels API.
   * Handles both initial fetch (username) and pagination (user_id + continuation).
   */
  @Get('reels')
  async getReels(
    @Query('username') username?: string,
    @Query('user_id') user_id?: string,
    @Query('continuation') continuation?: string,
  ) {
    const API_KEY = process.env.PARSEIUM_API_KEY;
    const BASE_URL = 'https://api.parseium.com/v1/instagram-reels';

    if (!API_KEY) {
      this.logger.error('PARSEIUM_API_KEY is not defined in backend .env');
      throw new InternalServerErrorException('Server configuration error: API Key missing');
    }

    if (!username && !user_id) {
      throw new BadRequestException('Either username or user_id is required');
    }

    this.logger.log(`Fetching reels for: ${username || user_id}`);

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          api_key: API_KEY,
          username,
          user_id,
          continuation,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Parseium API Error: ${error.response?.data?.message || error.message}`);
      throw new InternalServerErrorException(error.response?.data?.message || 'Failed to fetch reels from Parseium');
    }
  }
}
