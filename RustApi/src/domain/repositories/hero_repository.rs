use crate::domain::models::Hero;

#[async_trait::async_trait]
pub trait HeroRepository: Send + Sync {
    async fn get_all(&self) -> anyhow::Result<Vec<Hero>>;
    async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Hero>>;
    async fn create(&self, hero: Hero) -> anyhow::Result<Hero>;
    async fn update(&self, hero: Hero) -> anyhow::Result<Option<Hero>>;
    async fn delete(&self, id: &str) -> anyhow::Result<bool>;
}
