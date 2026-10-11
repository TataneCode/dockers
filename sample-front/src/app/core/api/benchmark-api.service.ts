import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { computeTimingStats, parseServerTimingMs, type TimingStats } from './timing';

export type BackendKey = 'nest' | 'dotnet' | 'rust';

export interface BackendDefinition {
  key: BackendKey;
  label: string;
  base: string;
}

export interface BenchmarkEndpoint {
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
}

export interface BenchmarkRunOptions {
  body?: unknown;
  /** When set, a DELETE on this path runs before each measured call. */
  cleanPath?: string;
}

export interface BenchmarkRunResult {
  backend: BackendKey;
  endpoint: BenchmarkEndpoint;
  iterations: number;
  serverDurationsMs: number[];
  error?: string;
}

export const BACKENDS: BackendDefinition[] = [
  { key: 'nest', label: 'NestJS', base: '/api' },
  { key: 'dotnet', label: '.NET', base: '/sample-api/api' },
  { key: 'rust', label: 'Rust', base: '/rust-api/api' },
];

export const BENCHMARK_ENDPOINTS: BenchmarkEndpoint[] = [
  { label: 'GET /heroes', method: 'GET', path: '/heroes' },
  { label: 'GET /powers', method: 'GET', path: '/powers' },
];

export const SEED_ENDPOINT: BenchmarkEndpoint = {
  label: 'POST /seed',
  method: 'POST',
  path: '/seed',
};

export { computeTimingStats };
export type { TimingStats };

@Injectable({ providedIn: 'root' })
export class BenchmarkApiService {
  private readonly http = inject(HttpClient);

  async run(
    backend: BackendDefinition,
    endpoint: BenchmarkEndpoint,
    iterations: number,
    options: BenchmarkRunOptions = {},
  ): Promise<BenchmarkRunResult> {
    const serverDurationsMs: number[] = [];
    let error: string | undefined;
    const url = `${backend.base}${endpoint.path}`;

    for (let i = 0; i < iterations; i++) {
      try {
        if (options.cleanPath) {
          await firstValueFrom(
            this.http.delete<void>(`${backend.base}${options.cleanPath}`),
          );
        }
        const response = await firstValueFrom(
          this.http.request<unknown>(endpoint.method, url, {
            observe: 'response',
            body: options.body,
          }),
        );
        const duration = parseServerTimingMs(response);
        if (duration !== null) {
          serverDurationsMs.push(duration);
        }
      } catch (e) {
        error =
          e instanceof HttpErrorResponse
            ? `HTTP ${e.status} ${e.statusText}`.trim()
            : e instanceof Error
              ? e.message
              : String(e);
        break;
      }
    }

    return { backend: backend.key, endpoint, iterations, serverDurationsMs, error };
  }
}
