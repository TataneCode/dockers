import { Global, Module } from '@nestjs/common';
import {
  HERO_REPOSITORY,
  POWER_REPOSITORY,
} from '../domain/repositories/repository.tokens';
import { HeroesPrismaRepository } from './heroes/repositories/heroes-prisma.repository';
import { OtelLoggerService } from './observability/otel-logger.service';
import { PowersPrismaRepository } from './powers/repositories/powers-prisma.repository';
import { DatabaseInitializationService } from './prisma/database-initialization.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    OtelLoggerService,
    DatabaseInitializationService,
    {
      provide: HERO_REPOSITORY,
      useClass: HeroesPrismaRepository,
    },
    {
      provide: POWER_REPOSITORY,
      useClass: PowersPrismaRepository,
    },
  ],
  exports: [PrismaService, OtelLoggerService, HERO_REPOSITORY, POWER_REPOSITORY],
})
export class InfrastructureModule {}
