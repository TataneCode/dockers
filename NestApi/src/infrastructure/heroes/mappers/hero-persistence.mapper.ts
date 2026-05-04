import type { Hero, HeroPower } from '@prisma/client';
import type { HeroModel } from '../../../domain/models/hero.model';
import type { HeroEntity } from '../entities/hero.entity';

type HeroRecord = Hero & { heroPowers: HeroPower[] };

export class HeroPersistenceMapper {
  static toEntity(record: HeroRecord): HeroEntity {
    return {
      id: record.id,
      name: record.name,
      alias: record.alias,
      origin: record.origin,
      heroPowers: record.heroPowers
        .map((heroPower) => ({
          heroId: heroPower.heroId,
          powerId: heroPower.powerId,
          position: heroPower.position,
        }))
        .sort((left, right) => left.position - right.position),
    };
  }

  static toModel(entity: HeroEntity): HeroModel {
    return {
      id: entity.id,
      name: entity.name,
      alias: entity.alias,
      origin: entity.origin,
      powerIds: entity.heroPowers
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((heroPower) => heroPower.powerId),
    };
  }
}
