import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SeedRequestDto {
  @ApiProperty({ description: 'Number of heroes to create', example: 10 })
  @IsInt()
  @Min(0)
  heroCount!: number;

  @ApiProperty({ description: 'Number of powers to create', example: 20 })
  @IsInt()
  @Min(0)
  powerCount!: number;
}
