import {
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
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
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
  @ApiOperation({
    summary: 'Get all heroes',
    description: 'Returns a list of all heroes.',
  })
  @ApiOkResponse({ type: HeroResponseDto, isArray: true })
  async findAll(): Promise<HeroResponseDto[]> {
    return (await this.heroesService.findAll()).map((hero) =>
      HeroApiMapper.toResponse(hero),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a hero by ID',
    description: 'Returns the hero with the specified ID.',
  })
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
  @ApiOperation({
    summary: 'Create a hero',
    description: 'Creates a new hero and returns the created resource.',
  })
  @ApiCreatedResponse({ type: HeroResponseDto })
  @ApiUnprocessableEntityResponse({ description: 'Invalid power references' })
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
  @ApiOperation({
    summary: 'Update a hero',
    description: 'Updates an existing hero and returns the updated resource.',
  })
  @ApiOkResponse({ type: HeroResponseDto })
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse({ description: 'Invalid power references' })
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
  @ApiOperation({
    summary: 'Delete a hero',
    description: 'Deletes the hero with the specified ID.',
  })
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
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: error.missingPowerIds.map(
          (powerId) => `Unknown power id: ${powerId}`,
        ),
        error: 'Unprocessable Entity',
      });
    }

    throw error;
  }
}
