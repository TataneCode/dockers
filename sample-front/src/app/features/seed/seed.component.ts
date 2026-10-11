import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BACKENDS, type BackendKey } from '../../core/api/benchmark-api.service';
import { SeedApiService, type SeedRunResult } from '../../core/api/seed-api.service';
import { computeTimingStats, type TimingStats } from '../../core/api/timing';

interface BackendResultView {
  key: BackendKey;
  label: string;
  running: boolean;
  error?: string;
  heroes: number;
  powers: number;
  samples: number;
  totalMs: number;
  stats: TimingStats | null;
}

@Component({
  selector: 'app-seed',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './seed.component.html',
  styleUrl: './seed.component.scss',
})
export class SeedComponent {
  private readonly seedApi = inject(SeedApiService);

  readonly backends = BACKENDS;
  readonly heroChoices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  heroCount = 5;

  readonly running = signal(false);
  private readonly results = signal<Record<string, SeedRunResult>>({});
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
        heroes: result?.heroesCreated ?? 0,
        powers: result?.powersCreated ?? 0,
        samples: result?.serverDurationsMs.length ?? 0,
        totalMs: result?.totalMs ?? 0,
        stats: result ? computeTimingStats(result.serverDurationsMs) : null,
      };
    });
  });

  async runSeed(): Promise<void> {
    if (this.running()) {
      return;
    }
    this.running.set(true);
    this.results.set({});
    this.inProgress.set(this.backends[0].key);
    try {
      for (const backend of this.backends) {
        this.inProgress.set(backend.key);
        const result = await this.seedApi.run(backend, this.heroCount);
        this.results.update((prev) => ({ ...prev, [backend.key]: result }));
      }
    } finally {
      this.inProgress.set(null);
      this.running.set(false);
    }
  }
}
