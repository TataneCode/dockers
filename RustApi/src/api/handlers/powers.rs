use crate::api::app_state::AppState;
use crate::api::dto::{PowerRequest, PowerResponse};
use crate::api::error::ApiError;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

#[utoipa::path(
    get,
    path = "/api/powers",
    tag = "Powers",
    summary = "Get all powers",
    description = "Returns a list of all powers.",
    responses(
        (status = 200, description = "List of powers", body = Vec<PowerResponse>)
    )
)]
pub async fn get_all(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let powers = state.powers.get_all().await?;
    let response: Vec<PowerResponse> = powers.into_iter().map(Into::into).collect();
    Ok(Json(response))
}

#[utoipa::path(
    get,
    path = "/api/powers/{id}",
    tag = "Powers",
    summary = "Get a power by ID",
    description = "Returns the power with the specified ID.",
    params(("id" = String, Path, description = "Power ID")),
    responses(
        (status = 200, description = "Power found", body = PowerResponse),
        (status = 404, description = "Power not found")
    )
)]
pub async fn get_by_id(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    match state.powers.get_by_id(&id).await? {
        Some(power) => Ok((StatusCode::OK, Json(PowerResponse::from(power))).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[utoipa::path(
    post,
    path = "/api/powers",
    tag = "Powers",
    summary = "Create a power",
    description = "Creates a new power and returns the created resource.",
    request_body = PowerRequest,
    responses(
        (status = 201, description = "Power created", body = PowerResponse)
    )
)]
pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<PowerRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let created = state.powers.create(body.into()).await?;
    let response = PowerResponse::from(created);
    let location = format!("/api/powers/{}", response.id);
    Ok((
        StatusCode::CREATED,
        [("Location", location)],
        Json(response),
    )
        .into_response())
}

#[utoipa::path(
    put,
    path = "/api/powers/{id}",
    tag = "Powers",
    summary = "Update a power",
    description = "Updates an existing power and returns the updated resource.",
    params(("id" = String, Path, description = "Power ID")),
    request_body = PowerRequest,
    responses(
        (status = 200, description = "Power updated", body = PowerResponse),
        (status = 404, description = "Power not found")
    )
)]
pub async fn update(
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(body): Json<PowerRequest>,
) -> Result<impl IntoResponse, ApiError> {
    match state.powers.update(&id, body.into()).await? {
        Some(power) => Ok((StatusCode::OK, Json(PowerResponse::from(power))).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[utoipa::path(
    delete,
    path = "/api/powers/{id}",
    tag = "Powers",
    summary = "Delete a power",
    description = "Deletes the power with the specified ID.",
    params(("id" = String, Path, description = "Power ID")),
    responses(
        (status = 204, description = "Power deleted"),
        (status = 404, description = "Power not found")
    )
)]
pub async fn delete(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    match state.powers.delete(&id).await? {
        true => Ok(StatusCode::NO_CONTENT.into_response()),
        false => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}
