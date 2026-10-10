import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  BACKENDS,
  BenchmarkApiService,
  SEED_ENDPOINT,
  type BackendKey,
  type BenchmarkRunResult,
} from '../../core/api/benchmark-api.service';
import { computeTimingStats, type TimingStats } from '../../core/api/timing';

interface BackendResultView {
  key: BackendKey;
  label: string;
  running: boolean;
  error?: string;
  stats: TimingStats | null;
  samples: number;
}

@Component({
  selector: 'app-seed-benchmark',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './seed-benchmark.component.html',
  styleUrl: './seed-benchmark.component.scss',
})
export class SeedBenchmarkComponent {
  private readonly benchmarkApi = inject(BenchmarkApiService);

  readonly backends = BACKENDS;
  readonly heroChoices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly powerChoices = [1, 2, 3, 5, 10, 15, 20, 30];
  readonly iterationChoices = [1, 5, 10, 25, 50, 100];

  heroCount = 5;
  powerCount = 10;
  iterations = 5;

  readonly running = signal(false);
  private readonly results = signal<Record<string, BenchmarkRunResult>>({});
  private readonly inProgress = signal<BackendKey | null>(null);

  readonly resultViews = computed<BackendResultView[]>(() => {
    const current = this.results();
    const inProgress = this.inProgress();
    return this.backends.map((backend) => {
      const result = current[backend.key];
      return {
        key: backend.key,
        label: backend.label,
        running: this.running() && inProgress === backend.key,
        error: result?.error,
        stats: result ? computeTimingStats(result.serverDurationsMs) : null,
        samples: result?.serverDurationsMs.length ?? 0,
      };
    });
  });

  async runBenchmark(): Promise<void> {
    if (this.running()) {
      return;
    }
    this.running.set(true);
    this.results.set({});
    this.inProgress.set(this.backends[0].key);
    try {
      for (const backend of this.backends) {
        this.inProgress.set(backend.key);
        const result = await this.benchmarkApi.run(backend, SEED_ENDPOINT, this.iterations, {
          body: { heroCount: this.heroCount, powerCount: this.powerCount },
          cleanPath: '/seed',
        });
        this.results.update((prev) => ({ ...prev, [backend.key]: result }));
      }
    } finally {
      this.inProgress.set(null);
      this.running.set(false);
    }
  }
}
