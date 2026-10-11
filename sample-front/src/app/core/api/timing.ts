import { HttpResponse } from '@angular/common/http';

export interface TimingStats {
  min: number;
  avg: number;
  p95: number;
  max: number;
}

export function parseServerTimingMs(response: HttpResponse<unknown>): number | null {
  const header = response.headers.get('Server-Timing');
  if (!header) {
    return null;
  }
  const match = header.match(/dur=([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

export function computeTimingStats(durations: number[]): TimingStats | null {
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
