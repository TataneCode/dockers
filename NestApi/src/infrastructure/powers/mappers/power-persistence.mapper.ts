import type { Power } from '@prisma/client';
import type { PowerModel } from '../../../domain/models/power.model';
import type { PowerEntity } from '../entities/power.entity';

export class PowerPersistenceMapper {
  static toEntity(record: Power): PowerEntity {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      type: record.type as PowerEntity['type'],
      level: record.level,
    };
  }

  static toModel(entity: PowerEntity): PowerModel {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      level: entity.level,
    };
  }
}
