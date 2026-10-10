import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

export interface BenchmarkRunResult {
  backend: BackendKey;
  endpoint: BenchmarkEndpoint;
  iterations: number;
  serverDurationsMs: number[];
  error?: string;
}

export interface BenchmarkStats {
  min: number;
  avg: number;
  p95: number;
  max: number;
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

@Injectable({ providedIn: 'root' })
export class BenchmarkApiService {
  private readonly http = inject(HttpClient);

  private static parseServerTimingMs(response: HttpResponse<unknown>): number | null {
    const header = response.headers.get('Server-Timing');
    if (!header) {
      return null;
    }
    const match = header.match(/dur=([0-9]+(?:\.[0-9]+)?)/);
    return match ? Number(match[1]) : null;
  }

  async run(
    backend: BackendDefinition,
    endpoint: BenchmarkEndpoint,
    iterations: number,
  ): Promise<BenchmarkRunResult> {
    const serverDurationsMs: number[] = [];
    let error: string | undefined;
    const url = `${backend.base}${endpoint.path}`;

    for (let i = 0; i < iterations; i++) {
      try {
        const response = await firstValueFrom(
          this.http.request<unknown>(endpoint.method, url, {
            observe: 'response',
          }),
        );
        const duration = BenchmarkApiService.parseServerTimingMs(response);
        if (duration !== null) {
          serverDurationsMs.push(duration);
        }
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        break;
      }
    }

    return { backend: backend.key, endpoint, iterations, serverDurationsMs, error };
  }

  static stats(durations: number[]): BenchmarkStats | null {
    if (durations.length === 0) {
      return null;
    }
    const sorted = [...durations].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, d) => acc + d, 0);
    const p95Index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil(sorted.length * 0.95) - 1),
    );
    return {
      min: sorted[0],
      avg: sum / sorted.length,
      p95: sorted[p95Index],
      max: sorted[sorted.length - 1],
    };
  }
}
