import { Module } from '@nestjs/common';
import { WatchPartyController } from './watch-party.controller';
import { WatchPartyService } from './watch-party.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WatchPartyController],
  providers: [WatchPartyService],
})
export class WatchPartyModule {}
