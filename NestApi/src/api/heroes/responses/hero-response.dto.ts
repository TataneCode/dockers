import { ApiProperty } from '@nestjs/swagger';
import { HeroRequestDto } from '../requests/hero-request.dto';

export class HeroResponseDto extends HeroRequestDto {
  @ApiProperty()
  id!: string;
}
