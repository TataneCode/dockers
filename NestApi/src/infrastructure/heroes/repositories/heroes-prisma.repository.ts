import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { HeroRepository } from '../../../domain/repositories/hero.repository';
import type { HeroModel } from '../../../domain/models/hero.model';
import { HeroPersistenceMapper } from '../mappers/hero-persistence.mapper';

@Injectable()
export class HeroesPrismaRepository implements HeroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<HeroModel[]> {
    const heroes = await this.prisma.hero.findMany({
      include: {
        heroPowers: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return heroes.map((hero) =>
      HeroPersistenceMapper.toModel(HeroPersistenceMapper.toEntity(hero)),
    );
  }

  async findById(id: string): Promise<HeroModel | null> {
    const hero = await this.prisma.hero.findUnique({
      where: { id },
      include: {
        heroPowers: true,
      },
    });

    if (!hero) {
      return null;
    }

    return HeroPersistenceMapper.toModel(HeroPersistenceMapper.toEntity(hero));
  }

  async create(hero: HeroModel): Promise<HeroModel> {
    const createdHero = await this.prisma.hero.create({
      data: {
        id: hero.id,
        name: hero.name,
        alias: hero.alias,
        origin: hero.origin,
        heroPowers: {
          create: hero.powerIds.map((powerId, index) => ({
            powerId,
            position: index,
          })),
        },
      },
      include: {
        heroPowers: true,
      },
    });

    return HeroPersistenceMapper.toModel(
      HeroPersistenceMapper.toEntity(createdHero),
    );
  }

  async update(hero: HeroModel): Promise<HeroModel | null> {
    const existingHero = await this.prisma.hero.findUnique({
      where: { id: hero.id },
      select: { id: true },
    });

    if (!existingHero) {
      return null;
    }

    await this.prisma.$transaction([
      this.prisma.hero.update({
        where: { id: hero.id },
        data: {
          name: hero.name,
          alias: hero.alias,
          origin: hero.origin,
        },
      }),
      this.prisma.heroPower.deleteMany({
        where: { heroId: hero.id },
      }),
      ...(hero.powerIds.length === 0
        ? []
        : [
            this.prisma.heroPower.createMany({
              data: hero.powerIds.map((powerId, index) => ({
                heroId: hero.id,
                powerId,
                position: index,
              })),
            }),
          ]),
    ]);

    return this.findById(hero.id);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.prisma.hero.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }
}
