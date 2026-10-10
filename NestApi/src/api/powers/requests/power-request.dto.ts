import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import { powerTypes, type PowerType } from '../../../domain/models/power-type';

export class PowerRequestDto {
  @ApiProperty({ description: 'Name of the power', example: 'Web-Slinging' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Detailed description of the power',
    example: 'Ability to shoot webs and swing between buildings',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    enum: powerTypes,
    description: 'Category of the power',
    example: 'Physical',
  })
  @IsIn(powerTypes)
  type!: PowerType;

  @ApiProperty({
    minimum: 0,
    maximum: 10,
    description: 'Strength level of the power (0–10)',
    example: 8,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  level!: number;
}
