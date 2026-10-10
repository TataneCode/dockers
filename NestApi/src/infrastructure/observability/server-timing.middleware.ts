import type { Request, Response, NextFunction } from 'express';

export function serverTimingMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();
  const originalEnd: Response['end'] = res.end.bind(res);
  res.end = ((...args: Parameters<Response['end']>) => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    res.setHeader('Server-Timing', `app;dur=${durationMs.toFixed(1)}`);
    return originalEnd(...args);
  }) as Response['end'];
  next();
}
