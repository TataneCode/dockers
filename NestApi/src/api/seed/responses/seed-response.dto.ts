import { ApiProperty } from '@nestjs/swagger';

export class SeedResponseDto {
  @ApiProperty({ description: 'Number of heroes created' })
  heroesCreated!: number;

  @ApiProperty({ description: 'Number of powers created' })
  powersCreated!: number;
}
