import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { useContainer } from 'class-validator';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FIXME : make it work
  /*
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
  */

  // useContainer(app, { fallback: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const port = process.env?.['PORT'] || 3456;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
