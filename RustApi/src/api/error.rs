use crate::application::errors::AppError;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

pub struct ApiError(AppError);

impl From<AppError> for ApiError {
    fn from(e: AppError) -> Self {
        Self(e)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        match self.0 {
            AppError::InvalidPowerReference(missing_ids) => {
                let body = json!({
                    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                    "title": "One or more validation errors occurred.",
                    "status": 422,
                    "errors": {
                        "powerIds": missing_ids
                    }
                });
                (StatusCode::UNPROCESSABLE_ENTITY, Json(body)).into_response()
            }
            AppError::Internal(err) => {
                tracing::error!("Internal error: {err:?}");
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            }
        }
    }
}
