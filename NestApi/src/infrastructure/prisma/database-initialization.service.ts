import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from './prisma.service';
import type { PowerType } from '../../domain/models/power-type';

interface HeroSeedItem {
  id: string;
  name: string;
  alias: string;
  origin: string;
  powerIds: string[];
}

interface PowerSeedItem {
  id: string;
  name: string;
  description: string;
  type: PowerType;
  level: number;
}

@Injectable()
export class DatabaseInitializationService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitializationService.name);
  private readonly seedEnabled = process.env.JSON_SEED_ENABLED === 'true';
  private readonly dataPath =
    process.env.JSON_SEED_DATA_PATH ?? join(process.cwd(), '.data');

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (!this.seedEnabled) {
      return;
    }

    const [heroCount, powerCount] = await Promise.all([
      this.prisma.hero.count(),
      this.prisma.power.count(),
    ]);

    if (heroCount > 0 || powerCount > 0) {
      this.logger.log(
        'Skipping JSON seed because the database already has data.',
      );
      return;
    }

    const [heroes, powers] = await Promise.all([
      this.readJson<HeroSeedItem[]>('heroes.json'),
      this.readJson<PowerSeedItem[]>('powers.json'),
    ]);

    await this.prisma.$transaction([
      this.prisma.power.createMany({
        data: powers.map((power) => ({
          id: power.id,
          name: power.name,
          description: power.description,
          type: power.type,
          level: power.level,
        })),
      }),
      this.prisma.hero.createMany({
        data: heroes.map((hero) => ({
          id: hero.id,
          name: hero.name,
          alias: hero.alias,
          origin: hero.origin,
        })),
      }),
      this.prisma.heroPower.createMany({
        data: heroes.flatMap((hero) =>
          hero.powerIds.map((powerId, index) => ({
            heroId: hero.id,
            powerId,
            position: index,
          })),
        ),
      }),
    ]);

    this.logger.log('Seeded NestApi schema from JSON files.');
  }

  private async readJson<T>(fileName: string): Promise<T> {
    const json = await readFile(join(this.dataPath, fileName), 'utf8');
    return JSON.parse(json) as T;
  }
}
