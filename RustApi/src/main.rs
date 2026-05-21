mod api;
mod application;
mod config;
mod domain;
mod infrastructure;

use api::app_state::AppState;
use api::routes::build_router;
use infrastructure::{
    db::create_pool,
    repositories::{SqlxHeroRepository, SqlxPowerRepository},
    seeding::seed_from_json,
};
use application::{hero_service::HeroService, power_service::PowerService};
use std::sync::Arc;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use opentelemetry::global;
use opentelemetry::trace::TracerProvider as _;
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_otlp::{LogExporter, SpanExporter, WithExportConfig};
use opentelemetry_sdk::{
    logs::LoggerProvider as SdkLoggerProvider,
    runtime,
    trace::TracerProvider as SdkTracerProvider,
};
use tracing_opentelemetry::OpenTelemetryLayer;

fn init_tracer_provider(endpoint: &str) -> SdkTracerProvider {
    let exporter = SpanExporter::builder()
        .with_tonic()
        .with_endpoint(endpoint)
        .build()
        .expect("Failed to build OTLP span exporter");

    SdkTracerProvider::builder()
        .with_batch_exporter(exporter, runtime::Tokio)
        .build()
}

fn init_logger_provider(endpoint: &str) -> SdkLoggerProvider {
    let exporter = LogExporter::builder()
        .with_tonic()
        .with_endpoint(endpoint)
        .build()
        .expect("Failed to build OTLP log exporter");

    SdkLoggerProvider::builder()
        .with_batch_exporter(exporter, runtime::Tokio)
        .build()
}

#[tokio::main]
async fn main() {
    let otlp_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
        .unwrap_or_else(|_| "http://localhost:4317".to_string());
    let service_name = std::env::var("OTEL_SERVICE_NAME")
        .unwrap_or_else(|_| "rust-api".to_string());

    let tracer_provider = init_tracer_provider(&otlp_endpoint);
    let logger_provider = init_logger_provider(&otlp_endpoint);

    global::set_tracer_provider(tracer_provider.clone());

    let tracer = tracer_provider.tracer(service_name.clone());
    let otel_trace_layer = OpenTelemetryLayer::new(tracer);
    let otel_log_layer = OpenTelemetryTracingBridge::new(&logger_provider);

    tracing_subscriber::registry()
        .with(EnvFilter::from_default_env().add_directive("rust_api=info".parse().unwrap()))
        .with(tracing_subscriber::fmt::layer())
        .with(otel_trace_layer)
        .with(otel_log_layer)
        .init();

    let config = config::AppConfig::from_env();

    let pool = create_pool(&config.database_url).await;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    if config.json_seed_enabled {
        seed_from_json(&pool, &config.json_seed_data_path)
            .await
            .expect("Failed to seed database");
    }

    let hero_repo = SqlxHeroRepository::new(pool.clone());
    let power_repo = SqlxPowerRepository::new(pool.clone());

    let hero_service = Arc::new(HeroService::new(hero_repo, SqlxPowerRepository::new(pool.clone())));
    let power_service = Arc::new(PowerService::new(power_repo));

    let state = AppState {
        heroes: hero_service,
        powers: power_service,
        db_pool: pool,
    };

    let router = build_router(state);
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind to {addr}"));

    info!("RustApi listening on http://{addr}");
    axum::serve(listener, router).await.expect("Server error");

    let _ = tracer_provider.shutdown();
    let _ = logger_provider.shutdown();
}
