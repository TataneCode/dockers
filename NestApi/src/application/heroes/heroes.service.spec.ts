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
import { InvalidPowerReferenceError } from '../errors/invalid-power-reference.error';
import { HeroesService } from './heroes.service';
import {
  HERO_REPOSITORY,
  POWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import type { HeroModel } from '../../domain/models/hero.model';
import type { HeroRepository } from '../../domain/repositories/hero.repository';
import type { PowerRepository } from '../../domain/repositories/power.repository';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(),
}));

type HeroRepositoryMock = {
  findAll: MockedFunction<HeroRepository['findAll']>;
  findById: MockedFunction<HeroRepository['findById']>;
  create: MockedFunction<HeroRepository['create']>;
  update: MockedFunction<HeroRepository['update']>;
  remove: MockedFunction<HeroRepository['remove']>;
};

type PowerRepositoryMock = {
  findAll: MockedFunction<PowerRepository['findAll']>;
  findById: MockedFunction<PowerRepository['findById']>;
  create: MockedFunction<PowerRepository['create']>;
  update: MockedFunction<PowerRepository['update']>;
  remove: MockedFunction<PowerRepository['remove']>;
  findMissingIds: MockedFunction<PowerRepository['findMissingIds']>;
};

const randomUUIDMock = randomUUID as MockedFunction<typeof randomUUID>;

const buildHero = (
  overrides: Partial<Omit<HeroModel, 'id'>> = {},
): Omit<HeroModel, 'id'> => ({
  name: 'Maya Rivers',
  alias: 'Mindwave',
  origin: 'Cosmic radiation exposure',
  powerIds: ['power-1'],
  ...overrides,
});

describe('HeroesService', () => {
  let moduleRef: TestingModule;
  let service: HeroesService;
  let heroRepository: HeroRepositoryMock;
  let powerRepository: PowerRepositoryMock;

  beforeEach(async () => {
    vi.clearAllMocks();

    heroRepository = {
      findAll: vi.fn() as MockedFunction<HeroRepository['findAll']>,
      findById: vi.fn() as MockedFunction<HeroRepository['findById']>,
      create: vi.fn() as MockedFunction<HeroRepository['create']>,
      update: vi.fn() as MockedFunction<HeroRepository['update']>,
      remove: vi.fn() as MockedFunction<HeroRepository['remove']>,
    };
    powerRepository = {
      findAll: vi.fn() as MockedFunction<PowerRepository['findAll']>,
      findById: vi.fn() as MockedFunction<PowerRepository['findById']>,
      create: vi.fn() as MockedFunction<PowerRepository['create']>,
      update: vi.fn() as MockedFunction<PowerRepository['update']>,
      remove: vi.fn() as MockedFunction<PowerRepository['remove']>,
      findMissingIds: vi.fn() as MockedFunction<
        PowerRepository['findMissingIds']
      >,
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        HeroesService,
        {
          provide: HERO_REPOSITORY,
          useValue: heroRepository,
        },
        {
          provide: POWER_REPOSITORY,
          useValue: powerRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(HeroesService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('findAll returns all heroes from the repository', async () => {
    const heroes: HeroModel[] = [
      {
        id: 'hero-1',
        name: 'Maya Rivers',
        alias: 'Mindwave',
        origin: 'Cosmic radiation exposure',
        powerIds: ['power-1'],
      },
      {
        id: 'hero-2',
        name: 'Liam Stone',
        alias: 'Granite',
        origin: 'Ancient relic',
        powerIds: ['power-2'],
      },
    ];
    heroRepository.findAll.mockResolvedValue(heroes);

    await expect(service.findAll()).resolves.toEqual(heroes);
    expect(heroRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('findById returns the hero when it exists', async () => {
    const hero: HeroModel = {
      id: 'hero-1',
      name: 'Maya Rivers',
      alias: 'Mindwave',
      origin: 'Cosmic radiation exposure',
      powerIds: ['power-1'],
    };
    heroRepository.findById.mockResolvedValue(hero);

    await expect(service.findById('hero-1')).resolves.toEqual(hero);
    expect(heroRepository.findById).toHaveBeenCalledWith('hero-1');
  });

  it('findById returns null when the hero does not exist', async () => {
    heroRepository.findById.mockResolvedValue(null);

    await expect(service.findById('missing-hero')).resolves.toBeNull();
    expect(heroRepository.findById).toHaveBeenCalledWith('missing-hero');
  });

  it('create generates a new id and delegates to the repository', async () => {
    const hero = buildHero();
    const createdHero = { ...hero, id: 'hero-id-123' };
    randomUUIDMock.mockReturnValue('hero-id-123');
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.create.mockResolvedValue(createdHero);

    await expect(service.create(hero)).resolves.toEqual(createdHero);
    expect(randomUUIDMock).toHaveBeenCalledTimes(1);
    expect(powerRepository.findMissingIds).toHaveBeenCalledWith(['power-1']);
    expect(heroRepository.create).toHaveBeenCalledWith(createdHero);
  });

  it('create normalizes power IDs and removes duplicates', async () => {
    const hero = buildHero({
      powerIds: ['power-1', 'power-1', 'power-2', 'power-2'],
    });
    randomUUIDMock.mockReturnValue('hero-id-123');
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.create.mockResolvedValue({
      ...hero,
      id: 'hero-id-123',
      powerIds: ['power-1', 'power-2'],
    });

    await service.create(hero);

    expect(powerRepository.findMissingIds).toHaveBeenCalledWith([
      'power-1',
      'power-2',
    ]);
    expect(heroRepository.create).toHaveBeenCalledWith({
      ...hero,
      id: 'hero-id-123',
      powerIds: ['power-1', 'power-2'],
    });
  });

  it('create normalizes power IDs and removes blank entries', async () => {
    const hero = buildHero({
      powerIds: ['power-1', '', 'power-2', ''],
    });
    randomUUIDMock.mockReturnValue('hero-id-123');
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.create.mockResolvedValue({
      ...hero,
      id: 'hero-id-123',
      powerIds: ['power-1', 'power-2'],
    });

    await service.create(hero);

    expect(powerRepository.findMissingIds).toHaveBeenCalledWith([
      'power-1',
      'power-2',
    ]);
    expect(heroRepository.create).toHaveBeenCalledWith({
      ...hero,
      id: 'hero-id-123',
      powerIds: ['power-1', 'power-2'],
    });
  });

  it('create skips power validation when there are no power IDs', async () => {
    const hero = buildHero({ powerIds: [] });
    const createdHero = { ...hero, id: 'hero-id-123' };
    randomUUIDMock.mockReturnValue('hero-id-123');
    heroRepository.create.mockResolvedValue(createdHero);

    await expect(service.create(hero)).resolves.toEqual(createdHero);
    expect(powerRepository.findMissingIds).toHaveBeenCalledTimes(0);
    expect(heroRepository.create).toHaveBeenCalledWith(createdHero);
  });

  it('create throws InvalidPowerReferenceError when some power IDs are missing', async () => {
    powerRepository.findMissingIds.mockResolvedValue(['power-2']);

    const createPromise = service.create(
      buildHero({ powerIds: ['power-1', 'power-2'] }),
    );

    await expect(createPromise).rejects.toMatchObject({
      missingPowerIds: ['power-2'],
    });
    await expect(createPromise).rejects.toBeInstanceOf(
      InvalidPowerReferenceError,
    );
    expect(heroRepository.create).not.toHaveBeenCalled();
  });

  it('update sets the provided id on the hero before delegating', async () => {
    const hero = buildHero({ powerIds: ['power-1', 'power-2'] });
    const updatedHero = { ...hero, id: 'hero-id-123' };
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.update.mockResolvedValue(updatedHero);

    await expect(service.update('hero-id-123', hero)).resolves.toEqual(
      updatedHero,
    );
    expect(powerRepository.findMissingIds).toHaveBeenCalledWith([
      'power-1',
      'power-2',
    ]);
    expect(heroRepository.update).toHaveBeenCalledWith(updatedHero);
  });

  it('update returns null when the hero does not exist', async () => {
    const hero = buildHero();
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.update.mockResolvedValue(null);

    await expect(service.update('missing-hero', hero)).resolves.toBeNull();
    expect(heroRepository.update).toHaveBeenCalledWith({
      ...hero,
      id: 'missing-hero',
    });
  });

  it('update normalizes power IDs', async () => {
    const hero = buildHero({
      powerIds: ['power-1', '', 'power-1', 'power-2'],
    });
    const updatedHero = {
      ...hero,
      id: 'hero-id-123',
      powerIds: ['power-1', 'power-2'],
    };
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.update.mockResolvedValue(updatedHero);

    await service.update('hero-id-123', hero);

    expect(powerRepository.findMissingIds).toHaveBeenCalledWith([
      'power-1',
      'power-2',
    ]);
    expect(heroRepository.update).toHaveBeenCalledWith(updatedHero);
  });

  it('update throws InvalidPowerReferenceError when some power IDs are missing', async () => {
    powerRepository.findMissingIds.mockResolvedValue(['power-2']);

    const updatePromise = service.update(
      'hero-id-123',
      buildHero({ powerIds: ['power-1', 'power-2'] }),
    );

    await expect(updatePromise).rejects.toMatchObject({
      missingPowerIds: ['power-2'],
    });
    await expect(updatePromise).rejects.toBeInstanceOf(
      InvalidPowerReferenceError,
    );
    expect(heroRepository.update).not.toHaveBeenCalled();
  });

  it('remove returns true when the hero was deleted', async () => {
    heroRepository.remove.mockResolvedValue(true);

    await expect(service.remove('hero-1')).resolves.toBe(true);
    expect(heroRepository.remove).toHaveBeenCalledWith('hero-1');
  });

  it('remove returns false when the hero did not exist', async () => {
    heroRepository.remove.mockResolvedValue(false);

    await expect(service.remove('missing-hero')).resolves.toBe(false);
    expect(heroRepository.remove).toHaveBeenCalledWith('missing-hero');
  });
});
