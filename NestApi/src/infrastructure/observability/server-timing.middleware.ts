import type { Request, Response, NextFunction } from 'express';

export class ServerTimingMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    const originalEnd = res.end;
    res.end = ((...args: Parameters<typeof originalEnd>) => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      res.setHeader('Server-Timing', `app;dur=${durationMs.toFixed(1)}`);
      return originalEnd.apply(res, args);
    }) as typeof res.end;
    next();
  }
}
