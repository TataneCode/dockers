import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PowerModel } from '../../domain/models/power.model';
import { POWER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import type { PowerRepository } from '../../domain/repositories/power.repository';

@Injectable()
export class PowersService {
  constructor(
    @Inject(POWER_REPOSITORY)
    private readonly powerRepository: PowerRepository,
  ) {}

  findAll(): Promise<PowerModel[]> {
    return this.powerRepository.findAll();
  }

  findById(id: string): Promise<PowerModel | null> {
    return this.powerRepository.findById(id);
  }

  create(power: Omit<PowerModel, 'id'>): Promise<PowerModel> {
    return this.powerRepository.create({
      ...power,
      id: randomUUID(),
    });
  }

  update(
    id: string,
    power: Omit<PowerModel, 'id'>,
  ): Promise<PowerModel | null> {
    return this.powerRepository.update({
      ...power,
      id,
    });
  }

  remove(id: string): Promise<boolean> {
    return this.powerRepository.remove(id);
  }
}
