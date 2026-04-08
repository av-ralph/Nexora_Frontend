import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [PrismaModule],
})
export class FavoritesModule {}