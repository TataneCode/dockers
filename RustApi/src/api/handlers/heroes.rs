use crate::api::app_state::AppState;
use crate::api::dto::{HeroRequest, HeroResponse};
use crate::api::error::ApiError;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

#[utoipa::path(
    get,
    path = "/api/heroes",
    tag = "Heroes",
    summary = "Get all heroes",
    description = "Returns a list of all heroes.",
    responses(
        (status = 200, description = "List of heroes", body = Vec<HeroResponse>)
    )
)]
pub async fn get_all(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let heroes = state.heroes.get_all().await?;
    let response: Vec<HeroResponse> = heroes.into_iter().map(Into::into).collect();
    Ok(Json(response))
}

#[utoipa::path(
    get,
    path = "/api/heroes/{id}",
    tag = "Heroes",
    summary = "Get a hero by ID",
    description = "Returns the hero with the specified ID.",
    params(("id" = String, Path, description = "Hero ID")),
    responses(
        (status = 200, description = "Hero found", body = HeroResponse),
        (status = 404, description = "Hero not found")
    )
)]
pub async fn get_by_id(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    match state.heroes.get_by_id(&id).await? {
        Some(hero) => Ok((StatusCode::OK, Json(HeroResponse::from(hero))).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[utoipa::path(
    post,
    path = "/api/heroes",
    tag = "Heroes",
    summary = "Create a hero",
    description = "Creates a new hero and returns the created resource.",
    request_body = HeroRequest,
    responses(
        (status = 201, description = "Hero created", body = HeroResponse),
        (status = 422, description = "Invalid power references")
    )
)]
pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<HeroRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let created = state.heroes.create(body.into()).await?;
    let response = HeroResponse::from(created);
    let location = format!("/api/heroes/{}", response.id);
    Ok((
        StatusCode::CREATED,
        [("Location", location)],
        Json(response),
    )
        .into_response())
}

#[utoipa::path(
    put,
    path = "/api/heroes/{id}",
    tag = "Heroes",
    summary = "Update a hero",
    description = "Updates an existing hero and returns the updated resource.",
    params(("id" = String, Path, description = "Hero ID")),
    request_body = HeroRequest,
    responses(
        (status = 200, description = "Hero updated", body = HeroResponse),
        (status = 404, description = "Hero not found"),
        (status = 422, description = "Invalid power references")
    )
)]
pub async fn update(
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(body): Json<HeroRequest>,
) -> Result<impl IntoResponse, ApiError> {
    match state.heroes.update(&id, body.into()).await? {
        Some(hero) => Ok((StatusCode::OK, Json(HeroResponse::from(hero))).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[utoipa::path(
    delete,
    path = "/api/heroes/{id}",
    tag = "Heroes",
    summary = "Delete a hero",
    description = "Deletes the hero with the specified ID.",
    params(("id" = String, Path, description = "Hero ID")),
    responses(
        (status = 204, description = "Hero deleted"),
        (status = 404, description = "Hero not found")
    )
)]
pub async fn delete(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    match state.heroes.delete(&id).await? {
        true => Ok(StatusCode::NO_CONTENT.into_response()),
        false => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}
