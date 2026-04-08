import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5176', 'http://127.0.0.1:5176', 'http://localhost:5177', 'http://127.0.0.1:5177'], // Allow localhost and 127.0.0.1 on various ports
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serialize BigInt values returned from Prisma into JSON-safe strings
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      const replacer = (_key: string, value: unknown) =>
        typeof value === 'bigint' ? value.toString() : value;
      return originalJson.call(this, JSON.parse(JSON.stringify(body, replacer)));
    };
    next();
  });

  const requestedPort = Number(process.env.PORT ?? 3001);
  let port = requestedPort;
  const maxRetries = 5;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      await app.listen(port, '0.0.0.0');
      console.log(`Nest application is running on http://0.0.0.0:${port}`);
      break;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'EADDRINUSE'
      ) {
        if (attempt === maxRetries) {
          throw new Error(
            `Port ${requestedPort} is in use and no free port could be found after ${maxRetries + 1} attempts.`
          );
        }
        console.warn(`Port ${port} is in use, trying ${port + 1}...`);
        port += 1;
        continue;
      }
      throw error;
    }
  }
}
bootstrap();
