import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvalidPowerReferenceError } from '../../application/errors/invalid-power-reference.error';
import { HeroesService } from '../../application/heroes/heroes.service';
import { HeroApiMapper } from './mappers/hero-api.mapper';
import { HeroRequestDto } from './requests/hero-request.dto';
import { HeroResponseDto } from './responses/hero-response.dto';

@ApiTags('Heroes')
@Controller('api/heroes')
export class HeroesController {
  constructor(private readonly heroesService: HeroesService) {}

  @Get()
  @ApiOkResponse({ type: HeroResponseDto, isArray: true })
  async findAll(): Promise<HeroResponseDto[]> {
    return (await this.heroesService.findAll()).map((hero) =>
      HeroApiMapper.toResponse(hero),
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: HeroResponseDto })
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string): Promise<HeroResponseDto> {
    const hero = await this.heroesService.findById(id);
    if (!hero) {
      throw new NotFoundException();
    }

    return HeroApiMapper.toResponse(hero);
  }

  @Post()
  @ApiCreatedResponse({ type: HeroResponseDto })
  async create(@Body() request: HeroRequestDto): Promise<HeroResponseDto> {
    try {
      const hero = await this.heroesService.create(
        HeroApiMapper.toModel(request),
      );
      return HeroApiMapper.toResponse(hero);
    } catch (error) {
      this.rethrowPowerReferenceError(error);
    }
  }

  @Put(':id')
  @ApiOkResponse({ type: HeroResponseDto })
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() request: HeroRequestDto,
  ): Promise<HeroResponseDto> {
    try {
      const hero = await this.heroesService.update(
        id,
        HeroApiMapper.toModel(request),
      );
      if (!hero) {
        throw new NotFoundException();
      }

      return HeroApiMapper.toResponse(hero);
    } catch (error) {
      this.rethrowPowerReferenceError(error);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.heroesService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
  }

  private rethrowPowerReferenceError(error: unknown): never {
    if (error instanceof InvalidPowerReferenceError) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.missingPowerIds.map(
          (powerId) => `Unknown power id: ${powerId}`,
        ),
        error: 'Bad Request',
      });
    }

    throw error;
  }
}
