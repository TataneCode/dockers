import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { HostMetricsInstrumentation } from '@opentelemetry/instrumentation-host-metrics';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4317';

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({ url: otlpEndpoint }),
  exportIntervalMillis: 10_000,
});

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'nest-api',
  traceExporter: new OTLPTraceExporter({ url: otlpEndpoint }),
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({ url: otlpEndpoint }),
  ),
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new RuntimeNodeInstrumentation(),
    new HostMetricsInstrumentation(),
  ],
});

sdk.start();
