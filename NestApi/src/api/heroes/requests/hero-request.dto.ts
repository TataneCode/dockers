import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class HeroRequestDto {
  @ApiProperty({ description: 'Full name of the hero', example: 'Peter Parker' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Superhero alias', example: 'Spider-Man' })
  @IsString()
  alias!: string;

  @ApiProperty({ description: 'Origin story or birthplace of the hero', example: 'New York City' })
  @IsString()
  origin!: string;

  @ApiProperty({ type: [String], description: 'IDs of the powers assigned to the hero' })
  @IsArray()
  @IsString({ each: true })
  powerIds!: string[];
}
