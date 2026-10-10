use crate::api::app_state::AppState;
use crate::api::handlers::{heroes, powers, seed};
use crate::api::openapi::ApiDoc;
use axum::routing::get;
use axum::Router;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

pub fn build_router(state: AppState) -> Router {
    let hero_routes = Router::new()
        .route("/", get(heroes::get_all).post(heroes::create))
        .route(
            "/{id}",
            get(heroes::get_by_id)
                .put(heroes::update)
                .delete(heroes::delete),
        );

    let power_routes = Router::new()
        .route("/", get(powers::get_all).post(powers::create))
        .route(
            "/{id}",
            get(powers::get_by_id)
                .put(powers::update)
                .delete(powers::delete),
        );

    let seed_routes = Router::new()
        .route("/", axum::routing::post(seed::seed).delete(seed::clean));

    let api_routes = Router::new()
        .nest("/heroes", hero_routes)
        .nest("/powers", power_routes)
        .nest("/seed", seed_routes);

    Router::new()
        .nest("/api", api_routes)
        .merge(Scalar::with_url("/docs", ApiDoc::openapi()))
        .route(
            "/openapi.json",
            get(|| async { axum::Json(ApiDoc::openapi()) }),
        )
        .layer(axum::middleware::from_fn(crate::api::middleware::server_timing))
        .with_state(state)
}
