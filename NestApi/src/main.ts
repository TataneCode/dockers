import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { OtelLoggerService } from './infrastructure/observability/otel-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(OtelLoggerService));
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
