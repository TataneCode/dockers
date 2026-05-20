use crate::domain::models::Power;

#[async_trait::async_trait]
pub trait PowerRepository: Send + Sync {
    async fn get_all(&self) -> anyhow::Result<Vec<Power>>;
    async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Power>>;
    async fn create(&self, power: Power) -> anyhow::Result<Power>;
    async fn update(&self, power: Power) -> anyhow::Result<Option<Power>>;
    async fn delete(&self, id: &str) -> anyhow::Result<bool>;
    async fn get_missing_ids(&self, ids: &[String]) -> anyhow::Result<Vec<String>>;
}
