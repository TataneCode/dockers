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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PowersService } from '../../application/powers/powers.service';
import { PowerApiMapper } from './mappers/power-api.mapper';
import { PowerRequestDto } from './requests/power-request.dto';
import { PowerResponseDto } from './responses/power-response.dto';

@ApiTags('Powers')
@Controller('api/powers')
export class PowersController {
  constructor(private readonly powersService: PowersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all powers', description: 'Returns a list of all powers.' })
  @ApiOkResponse({ type: PowerResponseDto, isArray: true })
  async findAll(): Promise<PowerResponseDto[]> {
    return (await this.powersService.findAll()).map((power) =>
      PowerApiMapper.toResponse(power),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a power by ID', description: 'Returns the power with the specified ID.' })
  @ApiOkResponse({ type: PowerResponseDto })
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string): Promise<PowerResponseDto> {
    const power = await this.powersService.findById(id);
    if (!power) {
      throw new NotFoundException();
    }

    return PowerApiMapper.toResponse(power);
  }

  @Post()
  @ApiOperation({ summary: 'Create a power', description: 'Creates a new power and returns the created resource.' })
  @ApiCreatedResponse({ type: PowerResponseDto })
  async create(@Body() request: PowerRequestDto): Promise<PowerResponseDto> {
    const power = await this.powersService.create(
      PowerApiMapper.toModel(request),
    );
    return PowerApiMapper.toResponse(power);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a power', description: 'Updates an existing power and returns the updated resource.' })
  @ApiOkResponse({ type: PowerResponseDto })
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() request: PowerRequestDto,
  ): Promise<PowerResponseDto> {
    const power = await this.powersService.update(
      id,
      PowerApiMapper.toModel(request),
    );
    if (!power) {
      throw new NotFoundException();
    }

    return PowerApiMapper.toResponse(power);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a power', description: 'Deletes the power with the specified ID.' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.powersService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
  }
}
