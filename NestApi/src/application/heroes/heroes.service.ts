import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InvalidPowerReferenceError } from '../errors/invalid-power-reference.error';
import type { HeroModel } from '../../domain/models/hero.model';
import {
  HERO_REPOSITORY,
  POWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import type { HeroRepository } from '../../domain/repositories/hero.repository';
import type { PowerRepository } from '../../domain/repositories/power.repository';

@Injectable()
export class HeroesService {
  constructor(
    @Inject(HERO_REPOSITORY)
    private readonly heroRepository: HeroRepository,
    @Inject(POWER_REPOSITORY)
    private readonly powerRepository: PowerRepository,
  ) {}

  findAll(): Promise<HeroModel[]> {
    return this.heroRepository.findAll();
  }

  findById(id: string): Promise<HeroModel | null> {
    return this.heroRepository.findById(id);
  }

  async create(hero: Omit<HeroModel, 'id'>): Promise<HeroModel> {
    const powerIds = this.normalizePowerIds(hero.powerIds);
    await this.ensurePowersExist(powerIds);

    return this.heroRepository.create({
      ...hero,
      id: randomUUID(),
      powerIds,
    });
  }

  async update(
    id: string,
    hero: Omit<HeroModel, 'id'>,
  ): Promise<HeroModel | null> {
    const powerIds = this.normalizePowerIds(hero.powerIds);
    await this.ensurePowersExist(powerIds);

    return this.heroRepository.update({
      ...hero,
      id,
      powerIds,
    });
  }

  remove(id: string): Promise<boolean> {
    return this.heroRepository.remove(id);
  }

  private async ensurePowersExist(powerIds: string[]): Promise<void> {
    if (powerIds.length === 0) {
      return;
    }

    const missingPowerIds = await this.powerRepository.findMissingIds(powerIds);
    if (missingPowerIds.length > 0) {
      throw new InvalidPowerReferenceError(missingPowerIds);
    }
  }

  private normalizePowerIds(powerIds: readonly string[]): string[] {
    const seen = new Set<string>();
    const normalizedPowerIds: string[] = [];

    for (const powerId of powerIds) {
      if (!powerId || seen.has(powerId)) {
        continue;
      }

      seen.add(powerId);
      normalizedPowerIds.push(powerId);
    }

    return normalizedPowerIds;
  }
}
