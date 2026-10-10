import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SeedService {
  private static readonly POWER_PREFIXES = [
    'Flame',
    'Ice',
    'Shadow',
    'Lightning',
    'Stone',
    'Wind',
    'Void',
    'Solar',
    'Dark',
    'Aqua',
    'Iron',
    'Psychic',
  ];
  private static readonly POWER_SUFFIXES = [
    'Strike',
    'Shield',
    'Burst',
    'Wave',
    'Blast',
    'Pulse',
    'Surge',
    'Slam',
    'Ray',
    'Aura',
  ];
  private static readonly POWER_TYPES = [
    'Physical',
    'Mental',
    'Elemental',
    'Tech',
  ];
  private static readonly HERO_FIRST_NAMES = [
    'Alex',
    'Maya',
    'Jordan',
    'Sam',
    'Riley',
    'Morgan',
    'Casey',
    'Quinn',
    'Skyler',
    'Drake',
  ];
  private static readonly HERO_LAST_NAMES = [
    'Rivers',
    'Storm',
    'Blaze',
    'Shield',
    'Arrow',
    'Night',
    'Star',
    'Hunter',
    'Cross',
    'Steele',
  ];
  private static readonly ALIAS_ADJECTIVES = [
    'Mighty',
    'Dark',
    'Iron',
    'Swift',
    'Blazing',
    'Fearless',
    'Silent',
    'Cosmic',
    'Raging',
    'Steel',
  ];
  private static readonly ALIAS_NOUNS = [
    'Falcon',
    'Tiger',
    'Phoenix',
    'Wolf',
    'Dragon',
    'Eagle',
    'Shark',
    'Panther',
    'Viper',
    'Hawk',
  ];
  private static readonly ORIGINS = [
    'New York City',
    'Metropolis',
    'Gotham City',
    'Star City',
    'Central City',
    'Coast City',
    'Keystone City',
    'Hub City',
    'Midway City',
    'Gateway City',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async seed(
    heroCount: number,
    powerCount: number,
  ): Promise<{ heroesCreated: number; powersCreated: number }> {
    const powerIds: string[] = [];

    for (let i = 0; i < powerCount; i++) {
      const id = randomUUID();
      const prefix = this.pick(SeedService.POWER_PREFIXES);
      const suffix = this.pick(SeedService.POWER_SUFFIXES);
      await this.prisma.power.create({
        data: {
          id,
          name: `${prefix} ${suffix}`,
          description: `Harnesses ${prefix.toLowerCase()} energy to unleash a powerful ${suffix.toLowerCase()}.`,
          type: this.pick(SeedService.POWER_TYPES),
          level: this.randomInt(1, 10),
        },
      });
      powerIds.push(id);
    }

    for (let i = 0; i < heroCount; i++) {
      const id = randomUUID();
      const name = `${this.pick(SeedService.HERO_FIRST_NAMES)} ${this.pick(SeedService.HERO_LAST_NAMES)}`;
      const alias = `The ${this.pick(SeedService.ALIAS_ADJECTIVES)} ${this.pick(SeedService.ALIAS_NOUNS)}`;
      const origin = this.pick(SeedService.ORIGINS);
      const selectedPowers = this.samplePowerIds(powerIds);

      await this.prisma.hero.create({
        data: {
          id,
          name,
          alias,
          origin,
          heroPowers: {
            create: selectedPowers.map((powerId, index) => ({
              powerId,
              position: index,
            })),
          },
        },
      });
    }

    return { heroesCreated: heroCount, powersCreated: powerCount };
  }

  async clean(): Promise<void> {
    await this.prisma.hero.deleteMany();
    await this.prisma.power.deleteMany();
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private samplePowerIds(powerIds: string[]): string[] {
    if (powerIds.length === 0) return [];
    const count = this.randomInt(0, Math.min(3, powerIds.length));
    const shuffled = [...powerIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
