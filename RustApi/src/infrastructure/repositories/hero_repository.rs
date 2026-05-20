use crate::domain::models::Hero;
use crate::domain::repositories::HeroRepository;
use sqlx::MySqlPool;

pub struct SqlxHeroRepository {
    pool: MySqlPool,
}

impl SqlxHeroRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct HeroRow {
    id: String,
    name: String,
    alias: String,
    origin: String,
    power_id: Option<String>,
}

#[async_trait::async_trait]
impl HeroRepository for SqlxHeroRepository {
    async fn get_all(&self) -> anyhow::Result<Vec<Hero>> {
        let rows: Vec<HeroRow> = sqlx::query_as(
            r#"
            SELECT h.id, h.name, h.alias, h.origin, hp.power_id
            FROM heroes h
            LEFT JOIN hero_powers hp ON hp.hero_id = h.id
            ORDER BY h.name, hp.position
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(aggregate_heroes(rows))
    }

    async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Hero>> {
        let rows: Vec<HeroRow> = sqlx::query_as(
            r#"
            SELECT h.id, h.name, h.alias, h.origin, hp.power_id
            FROM heroes h
            LEFT JOIN hero_powers hp ON hp.hero_id = h.id
            WHERE h.id = ?
            ORDER BY hp.position
            "#,
        )
        .bind(id)
        .fetch_all(&self.pool)
        .await?;

        if rows.is_empty() {
            return Ok(None);
        }

        let first = &rows[0];
        let power_ids = rows.iter().filter_map(|r| r.power_id.clone()).collect();

        Ok(Some(Hero {
            id: first.id.clone(),
            name: first.name.clone(),
            alias: first.alias.clone(),
            origin: first.origin.clone(),
            power_ids,
        }))
    }

    async fn create(&self, hero: Hero) -> anyhow::Result<Hero> {
        let mut tx = self.pool.begin().await?;

        sqlx::query("INSERT INTO heroes (id, name, alias, origin) VALUES (?, ?, ?, ?)")
            .bind(&hero.id)
            .bind(&hero.name)
            .bind(&hero.alias)
            .bind(&hero.origin)
            .execute(&mut *tx)
            .await?;

        insert_hero_powers(&mut tx, &hero.id, &hero.power_ids).await?;

        tx.commit().await?;
        Ok(hero)
    }

    async fn update(&self, hero: Hero) -> anyhow::Result<Option<Hero>> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM heroes WHERE id = ?")
                .bind(&hero.id)
                .fetch_one(&self.pool)
                .await?;

        if count == 0 {
            return Ok(None);
        }

        let mut tx = self.pool.begin().await?;

        sqlx::query("UPDATE heroes SET name = ?, alias = ?, origin = ? WHERE id = ?")
            .bind(&hero.name)
            .bind(&hero.alias)
            .bind(&hero.origin)
            .bind(&hero.id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM hero_powers WHERE hero_id = ?")
            .bind(&hero.id)
            .execute(&mut *tx)
            .await?;

        insert_hero_powers(&mut tx, &hero.id, &hero.power_ids).await?;

        tx.commit().await?;
        Ok(Some(hero))
    }

    async fn delete(&self, id: &str) -> anyhow::Result<bool> {
        let result = sqlx::query("DELETE FROM heroes WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }
}

fn aggregate_heroes(rows: Vec<HeroRow>) -> Vec<Hero> {
    let mut heroes: Vec<Hero> = Vec::new();

    for row in rows {
        if let Some(last) = heroes.last_mut() {
            if last.id == row.id {
                if let Some(pid) = row.power_id {
                    last.power_ids.push(pid);
                }
                continue;
            }
        }
        heroes.push(Hero {
            power_ids: row.power_id.into_iter().collect(),
            id: row.id,
            name: row.name,
            alias: row.alias,
            origin: row.origin,
        });
    }

    heroes
}

async fn insert_hero_powers(
    tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
    hero_id: &str,
    power_ids: &[String],
) -> anyhow::Result<()> {
    for (position, power_id) in power_ids.iter().enumerate() {
        sqlx::query("INSERT INTO hero_powers (hero_id, power_id, position) VALUES (?, ?, ?)")
            .bind(hero_id)
            .bind(power_id)
            .bind(position as i32)
            .execute(&mut **tx)
            .await?;
    }
    Ok(())
}
