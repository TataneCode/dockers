import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BACKENDS, type BackendDefinition, type BackendKey } from './benchmark-api.service';
import { parseServerTimingMs } from './timing';
import type { Power, PowerRequest } from '../models/power.model';
import type { Hero, HeroRequest } from '../models/hero.model';
import seedData from '../../../assets/seed/seed-data.json';

export interface SeedHeroData {
  name: string;
  alias: string;
  origin: string;
}

export interface SeedPowerData {
  name: string;
  description: string;
  type: PowerRequest['type'];
  level: number;
}

interface SeedData {
  heroes: SeedHeroData[];
  powers: SeedPowerData[];
}

export const SEED_DATA = seedData as SeedData;

const MAX_POWERS_PER_HERO = 3;

export interface SeedRunResult {
  backend: BackendKey;
  heroesCreated: number;
  powersCreated: number;
  totalMs: number;
  serverDurationsMs: number[];
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class SeedApiService {
  private readonly http = inject(HttpClient);

  async run(backend: BackendDefinition, heroCount: number): Promise<SeedRunResult> {
    const serverDurationsMs: number[] = [];
    let error: string | undefined;
    let heroesCreated = 0;
    let powersCreated = 0;
    const runStartedAt = performance.now();

    try {
      for (let i = 0; i < heroCount; i++) {
        const hero = SeedApiService.pickRandom(SEED_DATA.heroes);
        const powers = SeedApiService.pickRandomSubset(
          SEED_DATA.powers,
          SeedApiService.randomInt(1, MAX_POWERS_PER_HERO),
        );

        const powerIds: string[] = [];
        for (const power of powers) {
          const powerRequest: PowerRequest = {
            name: power.name,
            description: power.description,
            type: power.type,
            level: power.level,
          };
          const powerCall = await this.postCall<Power>(backend, '/powers', powerRequest);
          powerIds.push(powerCall.response.body!.id);
          powersCreated++;
          serverDurationsMs.push(powerCall.durationMs);
        }

        const heroRequest: HeroRequest = {
          name: hero.name,
          alias: hero.alias,
          origin: hero.origin,
          powerIds,
        };
        const heroCall = await this.postCall<Hero>(backend, '/heroes', heroRequest);
        heroesCreated++;
        serverDurationsMs.push(heroCall.durationMs);
      }
    } catch (e) {
      error =
        e instanceof HttpErrorResponse
          ? `HTTP ${e.status} ${e.statusText}`.trim()
          : e instanceof Error
            ? e.message
            : String(e);
    }

    return {
      backend: backend.key,
      heroesCreated,
      powersCreated,
      totalMs: performance.now() - runStartedAt,
      serverDurationsMs,
      error,
    };
  }

  private async postCall<T>(
    backend: BackendDefinition,
    path: string,
    body: unknown,
  ): Promise<{ response: HttpResponse<T>; durationMs: number }> {
    const startedAt = performance.now();
    const response = await firstValueFrom(
      this.http.post<T>(`${backend.base}${path}`, body, { observe: 'response' }),
    );
    const serverDuration = parseServerTimingMs(response);
    return { response, durationMs: serverDuration ?? performance.now() - startedAt };
  }

  private static pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private static pickRandomSubset<T>(items: T[], count: number): T[] {
    const pool = [...items];
    const picked: T[] = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return picked;
  }

  private static randomInt(minInclusive: number, maxInclusive: number): number {
    return minInclusive + Math.floor(Math.random() * (maxInclusive - minInclusive + 1));
  }
}
