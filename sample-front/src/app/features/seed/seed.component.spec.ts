import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { SeedComponent } from './seed.component';
import { SeedApiService, type SeedRunResult } from '../../core/api/seed-api.service';
import type { BackendDefinition } from '../../core/api/benchmark-api.service';

function resultFor(key: string, durations: number[]): SeedRunResult {
  return {
    backend: key as SeedRunResult['backend'],
    heroesCreated: 2,
    powersCreated: 5,
    totalMs: 123.4,
    serverDurationsMs: durations,
  };
}

describe('SeedComponent', () => {
  function setup(run: ReturnType<typeof vi.fn>) {
    const fixture = TestBed.configureTestingModule({
      imports: [SeedComponent],
      providers: [
        provideHttpClient(),
        { provide: SeedApiService, useValue: { run } },
      ],
    }).createComponent(SeedComponent);
    return fixture;
  }

  it('creates', () => {
    const fixture = setup(vi.fn());
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('offers between 1 and 10 heroes', () => {
    const fixture = setup(vi.fn());
    expect(fixture.componentInstance.heroChoices).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('renders one row per backend', () => {
    const fixture = setup(vi.fn());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('runs backends sequentially with the chosen hero count', async () => {
    const run = vi.fn(async (backend: BackendDefinition, heroCount: number) =>
      resultFor(backend.key, [1, 3]),
    );
    const fixture = setup(run);
    fixture.componentInstance.heroCount = 4;
    await fixture.componentInstance.runSeed();
    fixture.detectChanges();
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls.map((call: unknown[]) => call[1])).toEqual([4, 4, 4]);
    expect(run.mock.calls.map((call: unknown[]) => (call[0] as BackendDefinition).key)).toEqual([
      'nest',
      'dotnet',
      'rust',
    ]);
    const firstRow = fixture.nativeElement.querySelector('tbody tr');
    expect(firstRow.textContent).toContain('2');
    expect(firstRow.textContent).toContain('5');
  });

  it('reports errors per backend', async () => {
    const run = vi.fn(async (backend: BackendDefinition) =>
      backend.key === 'nest'
        ? { ...resultFor(backend.key, []), error: 'HTTP 500 Internal Server Error' }
        : resultFor(backend.key, [2, 4]),
    );
    const fixture = setup(run);
    await fixture.componentInstance.runSeed();
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector('tbody tr');
    expect(firstRow.textContent).toContain('HTTP 500');
  });
});
