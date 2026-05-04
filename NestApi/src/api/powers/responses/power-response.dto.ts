import { ApiProperty } from '@nestjs/swagger';
import { PowerRequestDto } from '../requests/power-request.dto';

export class PowerResponseDto extends PowerRequestDto {
  @ApiProperty()
  id!: string;
}
