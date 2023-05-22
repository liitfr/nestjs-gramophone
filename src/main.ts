// import { ValidationPipe } from '@nestjs/common';
// import { useContainer } from 'class-validator';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

function setupCors(app: INestApplication) {
  app.enableCors({
    origin: environment.frontReferrer,
    credentials: true,
    exposedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Set-Cookie',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Set-Cookie',
      'Apollo-Require-Preflight',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cors
  setupCors(app);

  // FIXME : make ValidationPipe work
  /*
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: false,
      // transform: true,
      // expectedType: Input,
    })
  );
  // useContainer(app, { fallback: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  */

  const port = process.env?.['PORT'] || 3456;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
