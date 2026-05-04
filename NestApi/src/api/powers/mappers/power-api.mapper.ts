import type { PowerModel } from '../../../domain/models/power.model';
import type { PowerRequestDto } from '../requests/power-request.dto';
import { PowerResponseDto } from '../responses/power-response.dto';

export class PowerApiMapper {
  static toModel(request: PowerRequestDto): Omit<PowerModel, 'id'> {
    return {
      name: request.name,
      description: request.description,
      type: request.type,
      level: request.level,
    };
  }

  static toResponse(model: PowerModel): PowerResponseDto {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      type: model.type,
      level: model.level,
    };
  }
}
