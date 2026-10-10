import { ConsoleLogger } from '@nestjs/common';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const emit = vi.fn();
const enabled = vi.fn();

vi.mock('@opentelemetry/api-logs', async () => {
  const actual = await vi.importActual<
    typeof import('@opentelemetry/api-logs')
  >('@opentelemetry/api-logs');

  return {
    ...actual,
    logs: {
      getLogger: vi.fn(() => ({
        emit,
        enabled,
      })),
    },
  };
});

import { OtelLoggerService } from './otel-logger.service';

describe('OtelLoggerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enabled.mockReturnValue(true);
    vi.spyOn(ConsoleLogger.prototype, 'log').mockImplementation(
      () => undefined,
    );
    vi.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(
      () => undefined,
    );
  });

  it('emits info log records with Nest context', () => {
    const logger = new OtelLoggerService();

    logger.log('Started app', 'Bootstrap');

    expect(emit).toHaveBeenCalledWith({
      eventName: 'log',
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: 'Started app',
      attributes: {
        'nestjs.context': 'Bootstrap',
        'nestjs.level': 'log',
      },
      exception: undefined,
    });
  });

  it('emits error records with stack traces', () => {
    const logger = new OtelLoggerService();

    logger.error('Boom', 'Error: Boom\n    at bootstrap', 'Bootstrap');

    expect(emit).toHaveBeenCalledWith({
      eventName: 'error',
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: 'Boom',
      attributes: {
        'nestjs.context': 'Bootstrap',
        'nestjs.level': 'error',
        'exception.stacktrace': 'Error: Boom\n    at bootstrap',
      },
      exception: undefined,
    });
  });
});
