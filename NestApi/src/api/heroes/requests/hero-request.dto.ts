import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class HeroRequestDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  alias!: string;

  @ApiProperty()
  @IsString()
  origin!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  powerIds!: string[];
}
