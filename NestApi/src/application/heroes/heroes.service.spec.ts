import { Test, TestingModule } from '@nestjs/testing';
import { InvalidPowerReferenceError } from '../errors/invalid-power-reference.error';
import { HeroesService } from './heroes.service';
import {
  HERO_REPOSITORY,
  POWER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import type { HeroRepository } from '../../domain/repositories/hero.repository';
import type { PowerRepository } from '../../domain/repositories/power.repository';

describe('HeroesService', () => {
  let moduleRef: TestingModule;
  let service: HeroesService;
  let heroRepository: jest.Mocked<HeroRepository>;
  let powerRepository: jest.Mocked<PowerRepository>;

  beforeEach(async () => {
    heroRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    powerRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findMissingIds: jest.fn(),
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

  it('creates a hero through the repository', async () => {
    powerRepository.findMissingIds.mockResolvedValue([]);
    heroRepository.create.mockImplementation((hero) => Promise.resolve(hero));

    const created = await service.create({
      name: 'Maya Rivers',
      alias: 'Mindwave',
      origin: 'Cosmic radiation exposure',
      powerIds: ['p2'],
    });

    expect(created.id).toBeDefined();
    expect(created.alias).toBe('Mindwave');
    expect(powerRepository.findMissingIds.mock.calls).toEqual([[['p2']]]);
    expect(heroRepository.create.mock.calls).toHaveLength(1);
  });

  it('rejects unknown power references', async () => {
    powerRepository.findMissingIds.mockResolvedValue(['p9']);

    await expect(
      service.create({
        name: 'Maya Rivers',
        alias: 'Mindwave',
        origin: 'Cosmic radiation exposure',
        powerIds: ['p9'],
      }),
    ).rejects.toBeInstanceOf(InvalidPowerReferenceError);
  });
});
