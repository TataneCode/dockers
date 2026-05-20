use crate::domain::models::Hero;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct HeroRequest {
    /// Full name of the hero
    #[schema(example = "Peter Parker")]
    pub name: String,
    /// Superhero alias
    #[schema(example = "Spider-Man")]
    pub alias: String,
    /// Origin story or birthplace of the hero
    #[schema(example = "New York City")]
    pub origin: String,
    /// IDs of the powers assigned to the hero
    pub power_ids: Vec<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct HeroResponse {
    /// Unique identifier of the hero
    pub id: String,
    /// Full name of the hero
    #[schema(example = "Peter Parker")]
    pub name: String,
    /// Superhero alias
    #[schema(example = "Spider-Man")]
    pub alias: String,
    /// Origin story or birthplace of the hero
    #[schema(example = "New York City")]
    pub origin: String,
    /// IDs of the powers assigned to the hero
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
