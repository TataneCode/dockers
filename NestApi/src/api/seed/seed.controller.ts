import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { SeedRequestDto } from './requests/seed-request.dto';
import { SeedResponseDto } from './responses/seed-response.dto';

@ApiTags('Seed')
@Controller('api/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({
    summary: 'Seed the database',
    description: 'Creates the specified number of random heroes and powers.',
  })
  @ApiOkResponse({ type: SeedResponseDto })
  async seed(@Body() request: SeedRequestDto): Promise<SeedResponseDto> {
    return this.seedService.seed(request.heroCount, request.powerCount);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clean the database',
    description: 'Deletes all heroes and powers from the database.',
  })
  @ApiNoContentResponse()
  async clean(): Promise<void> {
    return this.seedService.clean();
  }
}
