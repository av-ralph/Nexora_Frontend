import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to database successfully');
    } catch (error) {
      console.error('❌ Failed to connect to database. Check your .env password.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
