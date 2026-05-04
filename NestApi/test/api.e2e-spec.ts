import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { HeroesController } from '../src/api/heroes/heroes.controller';
import { PowersController } from '../src/api/powers/powers.controller';
import { HeroesService } from '../src/application/heroes/heroes.service';
import { PowersService } from '../src/application/powers/powers.service';
import { configureApp } from '../src/bootstrap';
import type { HeroModel } from '../src/domain/models/hero.model';
import type { PowerModel } from '../src/domain/models/power.model';
import {
  HERO_REPOSITORY,
  POWER_REPOSITORY,
} from '../src/domain/repositories/repository.tokens';
import type { HeroRepository } from '../src/domain/repositories/hero.repository';
import type { PowerRepository } from '../src/domain/repositories/power.repository';

describe('Heroes & Powers API (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let heroRepository: HeroRepository;
  let powerRepository: PowerRepository;

  beforeAll(async () => {
    const heroes: HeroModel[] = [
      {
        id: 'h1',
        name: 'John Steel',
        alias: 'Ironclad',
        origin: 'Enhanced soldier experiment',
        powerIds: ['p1'],
      },
    ];
    const powers: PowerModel[] = [
      {
        id: 'p1',
        name: 'Super Strength',
        description: 'Ability to exert greater-than-normal physical force',
        type: 'Physical',
        level: 8,
      },
    ];

    heroRepository = {
      findAll: () => Promise.resolve(heroes),
      findById: (id) =>
        Promise.resolve(heroes.find((hero) => hero.id === id) ?? null),
      create: (hero) => {
        heroes.push(hero);
        return Promise.resolve(hero);
      },
      update: (hero) => {
        const index = heroes.findIndex(
          (currentHero) => currentHero.id === hero.id,
        );
        if (index === -1) {
          return Promise.resolve(null);
        }

        heroes[index] = hero;
        return Promise.resolve(hero);
      },
      remove: (id) => {
        const index = heroes.findIndex((hero) => hero.id === id);
        if (index === -1) {
          return Promise.resolve(false);
        }

        heroes.splice(index, 1);
        return Promise.resolve(true);
      },
    };

    powerRepository = {
      findAll: () => Promise.resolve(powers),
      findById: (id) =>
        Promise.resolve(powers.find((power) => power.id === id) ?? null),
      create: (power) => {
        powers.push(power);
        return Promise.resolve(power);
      },
      update: (power) => {
        const index = powers.findIndex(
          (currentPower) => currentPower.id === power.id,
        );
        if (index === -1) {
          return Promise.resolve(null);
        }

        powers[index] = power;
        return Promise.resolve(power);
      },
      remove: (id) => {
        const index = powers.findIndex((power) => power.id === id);
        if (index === -1) {
          return Promise.resolve(false);
        }

        powers.splice(index, 1);
        return Promise.resolve(true);
      },
      findMissingIds: (ids) =>
        Promise.resolve(
          ids.filter((id) => !powers.some((power) => power.id === id)),
        ),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [HeroesController, PowersController],
      providers: [
        HeroesService,
        PowersService,
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

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await moduleRef?.close();
  });

  it('returns heroes from the seeded dataset', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    ).get('/api/heroes');
    const heroes = response.body as Array<{ id: string; alias: string }>;

    expect(response.status).toBe(200);
    expect(
      heroes.some((hero) => hero.id === 'h1' && hero.alias === 'Ironclad'),
    ).toBe(true);
  });

  it('returns powers from the seeded dataset', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    ).get('/api/powers');
    const powers = response.body as Array<{ id: string; name: string }>;

    expect(response.status).toBe(200);
    expect(
      powers.some(
        (power) => power.id === 'p1' && power.name === 'Super Strength',
      ),
    ).toBe(true);
  });
});
