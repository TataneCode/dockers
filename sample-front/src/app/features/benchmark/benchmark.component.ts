import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  BenchmarkApiService,
  BACKENDS,
  BENCHMARK_ENDPOINTS,
  BenchmarkRunResult,
  BenchmarkStats,
  type BackendKey,
} from '../../core/api/benchmark-api.service';

interface BackendResultView {
  key: BackendKey;
  label: string;
  done: boolean;
  running: boolean;
  error?: string;
  stats: BenchmarkStats | null;
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

  readonly resultViews = computed<BackendResultView[]>(() => {
    const current = this.results();
    return this.backends.map((backend) => {
      const result = current[backend.key];
      const stats = result ? BenchmarkApiService.stats(result.serverDurationsMs) : null;
      return {
        key: backend.key,
        label: backend.label,
        done: !!result && !result.error,
        running: this.running() && result === undefined && this.inProgress === backend.key,
        error: result?.error,
        stats,
        samples: result?.serverDurationsMs.length ?? 0,
      };
    });
  });

  private inProgress: BackendKey | null = null;

  async runBenchmark(): Promise<void> {
    if (this.running()) {
      return;
    }
    const endpoint = this.endpoints[this.selectedEndpointIndex];
    this.running.set(true);
    this.results.set({});
    try {
      for (const backend of this.backends) {
        this.inProgress = backend.key;
        const result = await this.benchmarkApi.run(backend, endpoint, this.iterations);
        this.results.update((prev) => ({ ...prev, [backend.key]: result }));
      }
    } finally {
      this.inProgress = null;
      this.running.set(false);
    }
  }
}
