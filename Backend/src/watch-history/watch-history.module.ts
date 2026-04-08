import { Module } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService],
  imports: [PrismaModule],
})
export class WatchHistoryModule {}