use crate::api::app_state::AppState;
use crate::api::error::ApiError;
use crate::application::errors::AppError;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use rand::Rng;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

const POWER_PREFIXES: &[&str] = &[
    "Flame", "Ice", "Shadow", "Lightning", "Stone", "Wind", "Void", "Solar", "Dark", "Aqua",
    "Iron", "Psychic",
];
const POWER_SUFFIXES: &[&str] = &[
    "Strike", "Shield", "Burst", "Wave", "Blast", "Pulse", "Surge", "Slam", "Ray", "Aura",
];
const POWER_TYPES: &[&str] = &["Physical", "Mental", "Elemental", "Tech"];
const HERO_FIRST_NAMES: &[&str] = &[
    "Alex", "Maya", "Jordan", "Sam", "Riley", "Morgan", "Casey", "Quinn", "Skyler", "Drake",
];
const HERO_LAST_NAMES: &[&str] = &[
    "Rivers", "Storm", "Blaze", "Shield", "Arrow", "Night", "Star", "Hunter", "Cross", "Steele",
];
const ALIAS_ADJECTIVES: &[&str] = &[
    "Mighty", "Dark", "Iron", "Swift", "Blazing", "Fearless", "Silent", "Cosmic", "Raging",
    "Steel",
];
const ALIAS_NOUNS: &[&str] = &[
    "Falcon", "Tiger", "Phoenix", "Wolf", "Dragon", "Eagle", "Shark", "Panther", "Viper", "Hawk",
];
const ORIGINS: &[&str] = &[
    "New York City",
    "Metropolis",
    "Gotham City",
    "Star City",
    "Central City",
    "Coast City",
    "Keystone City",
    "Hub City",
    "Midway City",
    "Gateway City",
];

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SeedRequest {
    /// Number of heroes to create
    pub hero_count: usize,
    /// Number of powers to create
    pub power_count: usize,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SeedResponse {
    /// Number of heroes created
    pub heroes_created: usize,
    /// Number of powers created
    pub powers_created: usize,
}

struct PowerData {
    id: String,
    name: String,
    description: String,
    kind: String,
    level: i32,
}

struct HeroData {
    id: String,
    name: String,
    alias: String,
    origin: String,
    power_ids: Vec<String>,
}

fn generate_data(hero_count: usize, power_count: usize) -> (Vec<PowerData>, Vec<HeroData>) {
    let mut rng = rand::thread_rng();

    let powers: Vec<PowerData> = (0..power_count)
        .map(|_| {
            let prefix = pick(&mut rng, POWER_PREFIXES);
            let suffix = pick(&mut rng, POWER_SUFFIXES);
            let kind = pick(&mut rng, POWER_TYPES);
            let level: i32 = rng.gen_range(1..=10);
            PowerData {
                id: Uuid::new_v4().to_string(),
                name: format!("{prefix} {suffix}"),
                description: format!(
                    "Harnesses {} energy to unleash a powerful {}.",
                    prefix.to_lowercase(),
                    suffix.to_lowercase()
                ),
                kind: kind.to_string(),
                level,
            }
        })
        .collect();

    let power_ids: Vec<&str> = powers.iter().map(|p| p.id.as_str()).collect();

    let heroes: Vec<HeroData> = (0..hero_count)
        .map(|_| {
            let first = pick(&mut rng, HERO_FIRST_NAMES);
            let last = pick(&mut rng, HERO_LAST_NAMES);
            let adj = pick(&mut rng, ALIAS_ADJECTIVES);
            let noun = pick(&mut rng, ALIAS_NOUNS);
            let origin = pick(&mut rng, ORIGINS);

            let selected_power_ids = if power_ids.is_empty() {
                vec![]
            } else {
                let count = rng.gen_range(0..=3_usize.min(power_ids.len()));
                let mut indices: Vec<usize> = (0..power_ids.len()).collect();
                for i in 0..indices.len() {
                    let j = rng.gen_range(i..indices.len());
                    indices.swap(i, j);
                }
                indices
                    .into_iter()
                    .take(count)
                    .map(|i| power_ids[i].to_string())
                    .collect()
            };

            HeroData {
                id: Uuid::new_v4().to_string(),
                name: format!("{first} {last}"),
                alias: format!("The {adj} {noun}"),
                origin: origin.to_string(),
                power_ids: selected_power_ids,
            }
        })
        .collect();

    (powers, heroes)
}

#[utoipa::path(
    post,
    path = "/api/seed",
    tag = "Seed",
    summary = "Seed the database",
    description = "Creates the specified number of random heroes and powers.",
    request_body = SeedRequest,
    responses(
        (status = 200, description = "Seed completed", body = SeedResponse)
    )
)]
pub async fn seed(
    State(state): State<AppState>,
    Json(body): Json<SeedRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let (powers, heroes) = generate_data(body.hero_count, body.power_count);

    let pool = &state.db_pool;
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    for p in &powers {
        sqlx::query(
            "INSERT INTO powers (id, name, description, `type`, level) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&p.id)
        .bind(&p.name)
        .bind(&p.description)
        .bind(&p.kind)
        .bind(p.level)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
    }

    for h in &heroes {
        sqlx::query("INSERT INTO heroes (id, name, alias, origin) VALUES (?, ?, ?, ?)")
            .bind(&h.id)
            .bind(&h.name)
            .bind(&h.alias)
            .bind(&h.origin)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        for (position, power_id) in h.power_ids.iter().enumerate() {
            sqlx::query(
                "INSERT INTO hero_powers (hero_id, power_id, position) VALUES (?, ?, ?)",
            )
            .bind(&h.id)
            .bind(power_id)
            .bind(position as i32)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        }
    }

    tx.commit()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(Json(SeedResponse {
        heroes_created: body.hero_count,
        powers_created: body.power_count,
    }))
}

#[utoipa::path(
    delete,
    path = "/api/seed",
    tag = "Seed",
    summary = "Clean the database",
    description = "Deletes all heroes and powers from the database.",
    responses(
        (status = 204, description = "Database cleaned")
    )
)]
pub async fn clean(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    let pool = &state.db_pool;

    sqlx::query("DELETE FROM heroes")
        .execute(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    sqlx::query("DELETE FROM powers")
        .execute(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(StatusCode::NO_CONTENT)
}

fn pick<'a>(rng: &mut impl Rng, slice: &[&'a str]) -> &'a str {
    slice[rng.gen_range(0..slice.len())]
}
