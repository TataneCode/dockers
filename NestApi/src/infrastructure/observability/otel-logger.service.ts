import { ConsoleLogger, Injectable } from '@nestjs/common';
import { inspect } from 'node:util';
import {
  SeverityNumber,
  logs,
  type LogAttributes,
  type Logger as OtelLogger,
} from '@opentelemetry/api-logs';

type NestLogLevel = 'log' | 'warn' | 'error' | 'debug' | 'verbose' | 'fatal';

interface NormalizedLogPayload {
  context?: string;
  extraArgs: unknown[];
  stack?: string;
}

const SEVERITY_MAP: Record<
  NestLogLevel,
  { severityNumber: SeverityNumber; severityText: string }
> = {
  verbose: {
    severityNumber: SeverityNumber.TRACE,
    severityText: 'TRACE',
  },
  debug: {
    severityNumber: SeverityNumber.DEBUG,
    severityText: 'DEBUG',
  },
  log: {
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
  },
  warn: {
    severityNumber: SeverityNumber.WARN,
    severityText: 'WARN',
  },
  error: {
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
  },
  fatal: {
    severityNumber: SeverityNumber.FATAL,
    severityText: 'FATAL',
  },
};

@Injectable()
export class OtelLoggerService extends ConsoleLogger {
  private readonly otelLogger: OtelLogger = logs.getLogger('nest-api.logger');

  override log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(message, ...optionalParams);
    this.emitLogRecord('log', message, optionalParams);
  }

  override warn(message: unknown, ...optionalParams: unknown[]): void {
    super.warn(message, ...optionalParams);
    this.emitLogRecord('warn', message, optionalParams);
  }

  override error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(message, ...optionalParams);
    this.emitLogRecord('error', message, optionalParams);
  }

  override debug(message: unknown, ...optionalParams: unknown[]): void {
    super.debug(message, ...optionalParams);
    this.emitLogRecord('debug', message, optionalParams);
  }

  override verbose(message: unknown, ...optionalParams: unknown[]): void {
    super.verbose(message, ...optionalParams);
    this.emitLogRecord('verbose', message, optionalParams);
  }

  override fatal(message: unknown, ...optionalParams: unknown[]): void {
    super.fatal(message, ...optionalParams);
    this.emitLogRecord('fatal', message, optionalParams);
  }

  private emitLogRecord(
    level: NestLogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const severity = SEVERITY_MAP[level];
    if (
      !this.otelLogger.enabled({
        eventName: level,
        severityNumber: severity.severityNumber,
      })
    ) {
      return;
    }

    const normalizedPayload =
      level === 'error'
        ? this.normalizeErrorPayload(optionalParams)
        : this.normalizePayload(optionalParams);

    const error = message instanceof Error ? message : undefined;
    const attributes: LogAttributes = {
      'nestjs.level': level,
    };

    if (normalizedPayload.context) {
      attributes['nestjs.context'] = normalizedPayload.context;
    }

    if (normalizedPayload.stack ?? error?.stack) {
      attributes['exception.stacktrace'] =
        normalizedPayload.stack ?? error?.stack ?? '';
    }

    if (error?.name) {
      attributes['exception.type'] = error.name;
    }

    this.otelLogger.emit({
      eventName: level,
      severityNumber: severity.severityNumber,
      severityText: severity.severityText,
      body: this.serializeMessage(message, normalizedPayload.extraArgs),
      attributes,
      exception: error,
    });
  }

  private normalizePayload(optionalParams: unknown[]): NormalizedLogPayload {
    const lastParam = optionalParams.at(-1);
    const context = typeof lastParam === 'string' ? lastParam : this.context;

    return {
      context,
      extraArgs:
        typeof lastParam === 'string'
          ? optionalParams.slice(0, -1)
          : optionalParams,
    };
  }

  private normalizeErrorPayload(
    optionalParams: unknown[],
  ): NormalizedLogPayload {
    if (optionalParams.length === 0) {
      return {
        context: this.context,
        extraArgs: [],
      };
    }

    if (
      optionalParams.length >= 2 &&
      typeof optionalParams.at(-1) === 'string' &&
      typeof optionalParams.at(-2) === 'string'
    ) {
      return {
        context: optionalParams.at(-1) as string,
        extraArgs: optionalParams.slice(0, -2),
        stack: optionalParams.at(-2) as string,
      };
    }

    const lastParam = optionalParams.at(-1);
    if (typeof lastParam === 'string') {
      if (this.looksLikeStackTrace(lastParam)) {
        return {
          context: this.context,
          extraArgs: optionalParams.slice(0, -1),
          stack: lastParam,
        };
      }

      return {
        context: lastParam,
        extraArgs: optionalParams.slice(0, -1),
      };
    }

    return {
      context: this.context,
      extraArgs: optionalParams,
    };
  }

  private looksLikeStackTrace(value: string): boolean {
    return value.includes('\n') || value.startsWith('Error:');
  }

  private serializeMessage(message: unknown, extraArgs: unknown[]): string {
    return [message, ...extraArgs]
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part instanceof Error) {
          return part.stack ?? `${part.name}: ${part.message}`;
        }

        return inspect(part, {
          breakLength: Infinity,
          compact: true,
          depth: 5,
        });
      })
      .join(' ');
  }
}
