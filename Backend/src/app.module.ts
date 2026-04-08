import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { FavoritesModule } from './favorites/favorites.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WatchPartyModule } from './watch-party/watch-party.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    FavoritesModule,
    WatchHistoryModule,
    ReviewsModule,
    WatchPartyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
