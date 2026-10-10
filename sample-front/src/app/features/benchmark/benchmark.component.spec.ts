import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { BenchmarkComponent } from './benchmark.component';
import {
  BenchmarkApiService,
  type BackendDefinition,
  type BenchmarkEndpoint,
  type BenchmarkRunResult,
} from '../../core/api/benchmark-api.service';
import { computeTimingStats } from '../../core/api/timing';

const endpoint: BenchmarkEndpoint = {
  label: 'GET /heroes',
  method: 'GET',
  path: '/heroes',
};

function resultFor(key: string, durations: number[]): BenchmarkRunResult {
  return { backend: key as BenchmarkRunResult['backend'], endpoint, iterations: 2, serverDurationsMs: durations };
}

describe('BenchmarkComponent', () => {
  function setup(run: ReturnType<typeof vi.fn>) {
    const fixture = TestBed.configureTestingModule({
      imports: [BenchmarkComponent],
      providers: [
        provideHttpClient(),
        { provide: BenchmarkApiService, useValue: { run } },
      ],
    }).createComponent(BenchmarkComponent);
    return fixture;
  }

  it('creates', () => {
    const fixture = setup(vi.fn());
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one row per backend', () => {
    const fixture = setup(vi.fn());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('runs backends sequentially and displays sample counts', async () => {
    const run = vi.fn(async (backend: BackendDefinition) =>
      backend.key === 'nest'
        ? resultFor(backend.key, [1, 3])
        : resultFor(backend.key, [2, 4]),
    );
    const fixture = setup(run);
    fixture.componentInstance.selectedEndpointIndex = 0;
    fixture.componentInstance.iterations = 2;
    await fixture.componentInstance.runBenchmark();
    fixture.detectChanges();
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls.map((call: unknown[]) => (call[0] as BackendDefinition).key)).toEqual([
      'nest',
      'dotnet',
      'rust',
    ]);
    const firstRow = fixture.nativeElement.querySelector('tbody tr');
    expect(firstRow.textContent).toContain('2');
  });

  it('reports errors per backend', async () => {
    const run = vi.fn(async (backend: BackendDefinition) =>
      backend.key === 'nest'
        ? { ...resultFor(backend.key, []), error: 'HTTP 500 Internal Server Error' }
        : resultFor(backend.key, [2, 4]),
    );
    const fixture = setup(run);
    await fixture.componentInstance.runBenchmark();
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('tbody tr');
    expect(firstRow.textContent).toContain('HTTP 500');
  });
});

describe('computeTimingStats', () => {
  it('computes min/avg/p95/max', () => {
    expect(computeTimingStats([10, 20, 30, 40, 100])).toEqual({
      min: 10,
      avg: 40,
      p95: 100,
      max: 100,
    });
  });

  it('returns null for empty durations', () => {
    expect(computeTimingStats([])).toBeNull();
  });
});
