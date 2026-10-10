import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  BenchmarkApiService,
  BACKENDS,
  BENCHMARK_ENDPOINTS,
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
  selector: 'app-benchmark',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './benchmark.component.html',
  styleUrl: './benchmark.component.scss',
})
export class BenchmarkComponent {
  private readonly benchmarkApi = inject(BenchmarkApiService);

  readonly backends = BACKENDS;
  readonly endpoints = BENCHMARK_ENDPOINTS;
  readonly iterationChoices = [1, 5, 10, 25, 50, 100];

  selectedEndpointIndex = 0;
  iterations = 10;

  readonly running = signal(false);
  private readonly results = signal<Record<string, BenchmarkRunResult>>({});
  private readonly inProgress = signal<BackendKey | null>(null);

  readonly resultViews = computed<BackendResultView[]>(() => {
    const current = this.results();
    const inProgress = this.inProgress();
    return this.backends.map((backend) => {
      const result = current[backend.key];
      const stats = result ? computeTimingStats(result.serverDurationsMs) : null;
      return {
        key: backend.key,
        label: backend.label,
        running: this.running() && inProgress === backend.key,
        error: result?.error,
        stats,
        samples: result?.serverDurationsMs.length ?? 0,
      };
    });
  });

  async runBenchmark(): Promise<void> {
    if (this.running()) {
      return;
    }
    const endpoint = this.endpoints[this.selectedEndpointIndex];
    this.running.set(true);
    this.results.set({});
    this.inProgress.set(this.backends[0].key);
    try {
      for (const backend of this.backends) {
        this.inProgress.set(backend.key);
        const result = await this.benchmarkApi.run(backend, endpoint, this.iterations);
        this.results.update((prev) => ({ ...prev, [backend.key]: result }));
      }
    } finally {
      this.inProgress.set(null);
      this.running.set(false);
    }
  }
}
