import type { HeroModel } from '../../../domain/models/hero.model';
import type { HeroRequestDto } from '../requests/hero-request.dto';
import { HeroResponseDto } from '../responses/hero-response.dto';

export class HeroApiMapper {
  static toModel(request: HeroRequestDto): Omit<HeroModel, 'id'> {
    return {
      name: request.name,
      alias: request.alias,
      origin: request.origin,
      powerIds: [...request.powerIds],
    };
  }

  static toResponse(model: HeroModel): HeroResponseDto {
    return {
      id: model.id,
      name: model.name,
      alias: model.alias,
      origin: model.origin,
      powerIds: [...model.powerIds],
    };
  }
}
