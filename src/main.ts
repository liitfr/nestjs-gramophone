import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: false,
      // transform: true,
      // expectedType: Input,
    }),
  );

  // useContainer(app, { fallback: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3456);
}

bootstrap();
