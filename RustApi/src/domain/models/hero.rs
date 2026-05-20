use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Hero {
    pub id: String,
    pub name: String,
    pub alias: String,
    pub origin: String,
    pub power_ids: Vec<String>,
}
