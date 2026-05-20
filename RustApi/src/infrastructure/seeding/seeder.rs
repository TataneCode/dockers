use serde::Deserialize;
use sqlx::MySqlPool;
use std::path::Path;
use tracing::info;

#[derive(Deserialize)]
struct PowerSeed {
    id: String,
    name: String,
    description: String,
    #[serde(rename = "type")]
    kind: String,
    level: i32,
}

#[derive(Deserialize)]
struct HeroSeed {
    id: String,
    name: String,
    alias: String,
    origin: String,
    #[serde(rename = "powerIds")]
    power_ids: Vec<String>,
}

pub async fn seed_from_json(pool: &MySqlPool, data_path: &str) -> anyhow::Result<()> {
    let path = Path::new(data_path);

    let power_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM powers")
        .fetch_one(pool)
        .await?;
    let hero_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM heroes")
        .fetch_one(pool)
        .await?;

    if power_count > 0 || hero_count > 0 {
        info!("Skipping JSON seed: database already contains data.");
        return Ok(());
    }

    let powers: Vec<PowerSeed> = read_json(path.join("powers.json"))?;
    let heroes: Vec<HeroSeed> = read_json(path.join("heroes.json"))?;

    let mut tx = pool.begin().await?;

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
        .await?;
    }

    for h in &heroes {
        sqlx::query("INSERT INTO heroes (id, name, alias, origin) VALUES (?, ?, ?, ?)")
            .bind(&h.id)
            .bind(&h.name)
            .bind(&h.alias)
            .bind(&h.origin)
            .execute(&mut *tx)
            .await?;

        for (position, power_id) in h.power_ids.iter().enumerate() {
            sqlx::query(
                "INSERT INTO hero_powers (hero_id, power_id, position) VALUES (?, ?, ?)",
            )
            .bind(&h.id)
            .bind(power_id)
            .bind(position as i32)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;
    info!("RustApi database seeded from JSON files.");
    Ok(())
}

fn read_json<T: for<'de> Deserialize<'de>>(path: impl AsRef<Path>) -> anyhow::Result<T> {
    let content = std::fs::read_to_string(path.as_ref())?;
    Ok(serde_json::from_str(&content)?)
}
