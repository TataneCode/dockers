import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PowerRepository } from '../../../domain/repositories/power.repository';
import type { PowerModel } from '../../../domain/models/power.model';
import { PowerPersistenceMapper } from '../mappers/power-persistence.mapper';

@Injectable()
export class PowersPrismaRepository implements PowerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PowerModel[]> {
    const powers = await this.prisma.power.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return powers.map((power) =>
      PowerPersistenceMapper.toModel(PowerPersistenceMapper.toEntity(power)),
    );
  }

  async findById(id: string): Promise<PowerModel | null> {
    const power = await this.prisma.power.findUnique({
      where: { id },
    });

    if (!power) {
      return null;
    }

    return PowerPersistenceMapper.toModel(
      PowerPersistenceMapper.toEntity(power),
    );
  }

  async create(power: PowerModel): Promise<PowerModel> {
    const createdPower = await this.prisma.power.create({
      data: {
        id: power.id,
        name: power.name,
        description: power.description,
        type: power.type,
        level: power.level,
      },
    });

    return PowerPersistenceMapper.toModel(
      PowerPersistenceMapper.toEntity(createdPower),
    );
  }

  async update(power: PowerModel): Promise<PowerModel | null> {
    const updatedPower = await this.prisma.power.updateMany({
      where: { id: power.id },
      data: {
        name: power.name,
        description: power.description,
        type: power.type,
        level: power.level,
      },
    });

    if (updatedPower.count === 0) {
      return null;
    }

    return this.findById(power.id);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.prisma.power.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }

  async findMissingIds(ids: readonly string[]): Promise<string[]> {
    if (ids.length === 0) {
      return [];
    }

    const requestedIds = [...new Set(ids.filter(Boolean))];
    if (requestedIds.length === 0) {
      return [];
    }

    const existingPowers = await this.prisma.power.findMany({
      where: {
        id: {
          in: requestedIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existingPowers.map((power) => power.id));
    return requestedIds.filter((id) => !existingIds.has(id));
  }
}
