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
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("rust_api=info".parse().unwrap()))
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
}
