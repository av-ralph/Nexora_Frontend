import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UnauthorizedException,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserDto, AdminLoginDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    try {
      const user = await this.adminService.verifyAdmin(dto.email, dto.password);
      return {
        success: true,
        user,
        message: 'Admin login successful',
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        message:
          error instanceof UnauthorizedException
            ? error.message
            : 'Not an admin',
      };
    }
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('reviews')
  async getReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('search') search?: string,
    @Query('movieId') movieId?: string,
  ) {
    return this.adminService.getReviews(
      page,
      limit,
      search,
      movieId ? parseInt(movieId, 10) : undefined,
    );
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('watch-parties')
  async getWatchParties(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getWatchParties(page, limit);
  }

  @Delete('watch-parties/:id')
  async endWatchParty(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.endWatchParty(id);
  }

  @Get('favorites')
  async getFavorites(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getFavorites(page, limit, userId);
  }

  @Get('watch-history')
  async getWatchHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getWatchHistory(page, limit, userId);
  }
}
