/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedServer: express.Application;

async function bootstrap() {
  // @ts-expect-error
  const { AppModule } = await import('../src/app.module');

  const nestApp = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(express()),
  );

  await nestApp.init();

  return nestApp.getHttpAdapter().getInstance();
}

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }

    return cachedServer(req, res);
  } catch (error: any) {
    console.error('🔥 SERVER ERROR:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error?.message || error,
    });
  }
}
