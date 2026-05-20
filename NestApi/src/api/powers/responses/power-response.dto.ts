import { ApiProperty } from '@nestjs/swagger';
import { PowerRequestDto } from '../requests/power-request.dto';

export class PowerResponseDto extends PowerRequestDto {
  @ApiProperty({ description: 'Unique identifier of the power' })
  id!: string;
}
