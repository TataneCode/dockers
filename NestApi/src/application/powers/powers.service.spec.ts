import { randomUUID } from 'node:crypto';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';
import { PowersService } from './powers.service';
import { POWER_REPOSITORY } from '../../domain/repositories/repository.tokens';
import type { PowerModel } from '../../domain/models/power.model';
import type { PowerRepository } from '../../domain/repositories/power.repository';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(),
}));

type PowerRepositoryMock = {
  findAll: MockedFunction<PowerRepository['findAll']>;
  findById: MockedFunction<PowerRepository['findById']>;
  create: MockedFunction<PowerRepository['create']>;
  update: MockedFunction<PowerRepository['update']>;
  remove: MockedFunction<PowerRepository['remove']>;
  findMissingIds: MockedFunction<PowerRepository['findMissingIds']>;
};

const randomUUIDMock = randomUUID as MockedFunction<typeof randomUUID>;

const buildPower = (
  overrides: Partial<Omit<PowerModel, 'id'>> = {},
): Omit<PowerModel, 'id'> => ({
  name: 'Flight',
  description: 'Allows the user to fly.',
  type: 'Physical',
  level: 9,
  ...overrides,
});

describe('PowersService', () => {
  let moduleRef: TestingModule;
  let service: PowersService;
  let powerRepository: PowerRepositoryMock;

  beforeEach(async () => {
    vi.clearAllMocks();

    powerRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      findMissingIds: vi.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        PowersService,
        {
          provide: POWER_REPOSITORY,
          useValue: powerRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(PowersService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('findAll returns all powers from the repository', async () => {
    const powers: PowerModel[] = [
      {
        id: 'power-1',
        name: 'Flight',
        description: 'Allows the user to fly.',
        type: 'Physical',
        level: 9,
      },
      {
        id: 'power-2',
        name: 'Telepathy',
        description: 'Enables mind-to-mind communication.',
        type: 'Mental',
        level: 8,
      },
    ];
    powerRepository.findAll.mockResolvedValue(powers);

    await expect(service.findAll()).resolves.toEqual(powers);
    expect(powerRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('findById returns the power when it exists', async () => {
    const power: PowerModel = {
      id: 'power-1',
      name: 'Flight',
      description: 'Allows the user to fly.',
      type: 'Physical',
      level: 9,
    };
    powerRepository.findById.mockResolvedValue(power);

    await expect(service.findById('power-1')).resolves.toEqual(power);
    expect(powerRepository.findById).toHaveBeenCalledWith('power-1');
  });

  it('findById returns null when the power does not exist', async () => {
    powerRepository.findById.mockResolvedValue(null);

    await expect(service.findById('missing-power')).resolves.toBeNull();
    expect(powerRepository.findById).toHaveBeenCalledWith('missing-power');
  });

  it('create generates a new id and delegates to the repository', async () => {
    const power = buildPower();
    const createdPower = { ...power, id: '123e4567-e89b-12d3-a456-426614174000' };
    randomUUIDMock.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
    powerRepository.create.mockResolvedValue(createdPower);

    await expect(service.create(power)).resolves.toEqual(createdPower);
    expect(randomUUIDMock).toHaveBeenCalledTimes(1);
    expect(powerRepository.create).toHaveBeenCalledWith(createdPower);
  });

  it('update sets the provided id on the power before delegating', async () => {
    const power = buildPower({ name: 'Telepathy', type: 'Mental', level: 8 });
    const updatedPower = { ...power, id: '123e4567-e89b-12d3-a456-426614174000' };
    powerRepository.update.mockResolvedValue(updatedPower);

    await expect(service.update('123e4567-e89b-12d3-a456-426614174000', power)).resolves.toEqual(
      updatedPower,
    );
    expect(powerRepository.update).toHaveBeenCalledWith(updatedPower);
  });

  it('update returns null when the power does not exist', async () => {
    const power = buildPower();
    powerRepository.update.mockResolvedValue(null);

    await expect(service.update('missing-power', power)).resolves.toBeNull();
    expect(powerRepository.update).toHaveBeenCalledWith({
      ...power,
      id: 'missing-power',
    });
  });

  it('remove returns true when the power was deleted', async () => {
    powerRepository.remove.mockResolvedValue(true);

    await expect(service.remove('power-1')).resolves.toBe(true);
    expect(powerRepository.remove).toHaveBeenCalledWith('power-1');
  });

  it('remove returns false when the power did not exist', async () => {
    powerRepository.remove.mockResolvedValue(false);

    await expect(service.remove('missing-power')).resolves.toBe(false);
    expect(powerRepository.remove).toHaveBeenCalledWith('missing-power');
  });
});
