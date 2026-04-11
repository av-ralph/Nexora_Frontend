import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

const server = express();
let handler: any;

async function bootstrap() {
  const { AppModule } = await import('../dist/app.module');

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  await app.init();
}

export default async function (req: any, res: any) {
  try {
    if (!handler) {
      await bootstrap();
      handler = serverlessExpress({ app: server });
    }

    return handler(req, res);
  } catch (error) {
    console.error('🔥 SERVER ERROR:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error?.message || error,
    });
  }
}