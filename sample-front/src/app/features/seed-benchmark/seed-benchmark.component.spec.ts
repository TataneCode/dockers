import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { SeedBenchmarkComponent } from './seed-benchmark.component';
import {
  BenchmarkApiService,
  SEED_ENDPOINT,
  type BackendDefinition,
  type BenchmarkEndpoint,
  type BenchmarkRunOptions,
  type BenchmarkRunResult,
} from '../../core/api/benchmark-api.service';

const endpoint: BenchmarkEndpoint = { ...SEED_ENDPOINT };

function resultFor(key: string, durations: number[]): BenchmarkRunResult {
  return { backend: key as BenchmarkRunResult['backend'], endpoint, iterations: 2, serverDurationsMs: durations };
}

describe('SeedBenchmarkComponent', () => {
  function setup(run: ReturnType<typeof vi.fn>) {
    const fixture = TestBed.configureTestingModule({
      imports: [SeedBenchmarkComponent],
      providers: [
        provideHttpClient(),
        { provide: BenchmarkApiService, useValue: { run } },
      ],
    }).createComponent(SeedBenchmarkComponent);
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

  it('calls POST /seed with clean and body on each backend sequentially', async () => {
    const run = vi.fn(async (backend: BackendDefinition) =>
      backend.key === 'nest'
        ? resultFor(backend.key, [1, 3])
        : resultFor(backend.key, [2, 4]),
    );
    const fixture = setup(run);
    fixture.componentInstance.heroCount = 3;
    fixture.componentInstance.powerCount = 7;
    fixture.componentInstance.iterations = 2;
    await fixture.componentInstance.runBenchmark();
    fixture.detectChanges();
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls.map((call: unknown[]) => (call[0] as BackendDefinition).key)).toEqual([
      'nest',
      'dotnet',
      'rust',
    ]);
    for (const call of run.mock.calls) {
      expect(call[1]).toEqual(SEED_ENDPOINT);
      expect(call[2]).toBe(2);
      const options = call[3] as BenchmarkRunOptions;
      expect(options.body).toEqual({ heroCount: 3, powerCount: 7 });
      expect(options.cleanPath).toBe('/seed');
    }
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
