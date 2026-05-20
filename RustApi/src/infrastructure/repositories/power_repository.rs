use crate::domain::models::Power;
use crate::domain::repositories::PowerRepository;
use sqlx::MySqlPool;

pub struct SqlxPowerRepository {
    pool: MySqlPool,
}

impl SqlxPowerRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct PowerRow {
    id: String,
    name: String,
    description: String,
    #[sqlx(rename = "type")]
    kind: String,
    level: i32,
}

impl From<PowerRow> for Power {
    fn from(r: PowerRow) -> Self {
        Power {
            id: r.id,
            name: r.name,
            description: r.description,
            kind: r.kind,
            level: r.level,
        }
    }
}

#[async_trait::async_trait]
impl PowerRepository for SqlxPowerRepository {
    async fn get_all(&self) -> anyhow::Result<Vec<Power>> {
        let rows: Vec<PowerRow> =
            sqlx::query_as("SELECT id, name, description, `type`, level FROM powers ORDER BY name")
                .fetch_all(&self.pool)
                .await?;
        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Power>> {
        let row: Option<PowerRow> = sqlx::query_as(
            "SELECT id, name, description, `type`, level FROM powers WHERE id = ?",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row.map(Into::into))
    }

    async fn create(&self, power: Power) -> anyhow::Result<Power> {
        sqlx::query(
            "INSERT INTO powers (id, name, description, `type`, level) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&power.id)
        .bind(&power.name)
        .bind(&power.description)
        .bind(&power.kind)
        .bind(power.level)
        .execute(&self.pool)
        .await?;
        Ok(power)
    }

    async fn update(&self, power: Power) -> anyhow::Result<Option<Power>> {
        let result = sqlx::query(
            "UPDATE powers SET name = ?, description = ?, `type` = ?, level = ? WHERE id = ?",
        )
        .bind(&power.name)
        .bind(&power.description)
        .bind(&power.kind)
        .bind(power.level)
        .bind(&power.id)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Ok(None);
        }
        Ok(Some(power))
    }

    async fn delete(&self, id: &str) -> anyhow::Result<bool> {
        let result = sqlx::query("DELETE FROM powers WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }

    async fn get_missing_ids(&self, ids: &[String]) -> anyhow::Result<Vec<String>> {
        if ids.is_empty() {
            return Ok(vec![]);
        }

        let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
        let sql = format!("SELECT id FROM powers WHERE id IN ({placeholders})");

        let mut q = sqlx::query_scalar::<_, String>(&sql);
        for id in ids {
            q = q.bind(id);
        }

        let found: Vec<String> = q.fetch_all(&self.pool).await?;
        let missing = ids
            .iter()
            .filter(|id| !found.contains(id))
            .cloned()
            .collect();
        Ok(missing)
    }
}
