use crate::domain::models::Hero;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct HeroRequest {
    pub name: String,
    pub alias: String,
    pub origin: String,
    pub power_ids: Vec<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct HeroResponse {
    pub id: String,
    pub name: String,
    pub alias: String,
    pub origin: String,
    pub power_ids: Vec<String>,
}

impl From<Hero> for HeroResponse {
    fn from(h: Hero) -> Self {
        Self {
            id: h.id,
            name: h.name,
            alias: h.alias,
            origin: h.origin,
            power_ids: h.power_ids,
        }
    }
}

impl From<HeroRequest> for Hero {
    fn from(r: HeroRequest) -> Self {
        Self {
            id: String::new(),
            name: r.name,
            alias: r.alias,
            origin: r.origin,
            power_ids: r.power_ids,
        }
    }
}
