import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';
import { serverTimingMiddleware } from './infrastructure/observability/server-timing.middleware';

export function configureApp(app: INestApplication): void {
  app.use(serverTimingMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Heroes & Powers API')
      .setDescription('NestJS 11 clone of the SampleApi backend')
      .setVersion('1.0')
      .build(),
  );

  app.use('/openapi/v1.json', (_req: Request, res: Response) => {
    res.json(document);
  });

  app.use(
    '/docs',
    apiReference({
      url: '/openapi/v1.json',
    }),
  );
}
