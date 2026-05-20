use crate::domain::models::Power;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
pub struct PowerRequest {
    pub name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub level: i32,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct PowerResponse {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub level: i32,
}

impl From<Power> for PowerResponse {
    fn from(p: Power) -> Self {
        Self {
            id: p.id,
            name: p.name,
            description: p.description,
            kind: p.kind,
            level: p.level,
        }
    }
}

impl From<PowerRequest> for Power {
    fn from(r: PowerRequest) -> Self {
        Self {
            id: String::new(),
            name: r.name,
            description: r.description,
            kind: r.kind,
            level: r.level,
        }
    }
}
