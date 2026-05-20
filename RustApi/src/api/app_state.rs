use crate::application::{hero_service::HeroService, power_service::PowerService};
use crate::domain::models::{Hero, Power};
use crate::application::errors::AppError;
use crate::domain::repositories::{HeroRepository, PowerRepository};
use sqlx::MySqlPool;
use std::sync::Arc;

#[async_trait::async_trait]
pub trait HeroServiceTrait: Send + Sync {
    async fn get_all(&self) -> Result<Vec<Hero>, AppError>;
    async fn get_by_id(&self, id: &str) -> Result<Option<Hero>, AppError>;
    async fn create(&self, hero: Hero) -> Result<Hero, AppError>;
    async fn update(&self, id: &str, hero: Hero) -> Result<Option<Hero>, AppError>;
    async fn delete(&self, id: &str) -> Result<bool, AppError>;
}

#[async_trait::async_trait]
pub trait PowerServiceTrait: Send + Sync {
    async fn get_all(&self) -> Result<Vec<Power>, AppError>;
    async fn get_by_id(&self, id: &str) -> Result<Option<Power>, AppError>;
    async fn create(&self, power: Power) -> Result<Power, AppError>;
    async fn update(&self, id: &str, power: Power) -> Result<Option<Power>, AppError>;
    async fn delete(&self, id: &str) -> Result<bool, AppError>;
}

#[async_trait::async_trait]
impl<H, P> HeroServiceTrait for HeroService<H, P>
where
    H: HeroRepository + 'static,
    P: PowerRepository + 'static,
{
    async fn get_all(&self) -> Result<Vec<Hero>, AppError> {
        HeroService::get_all(self).await
    }
    async fn get_by_id(&self, id: &str) -> Result<Option<Hero>, AppError> {
        HeroService::get_by_id(self, id).await
    }
    async fn create(&self, hero: Hero) -> Result<Hero, AppError> {
        HeroService::create(self, hero).await
    }
    async fn update(&self, id: &str, hero: Hero) -> Result<Option<Hero>, AppError> {
        HeroService::update(self, id, hero).await
    }
    async fn delete(&self, id: &str) -> Result<bool, AppError> {
        HeroService::delete(self, id).await
    }
}

#[async_trait::async_trait]
impl<P> PowerServiceTrait for PowerService<P>
where
    P: PowerRepository + 'static,
{
    async fn get_all(&self) -> Result<Vec<Power>, AppError> {
        PowerService::get_all(self).await
    }
    async fn get_by_id(&self, id: &str) -> Result<Option<Power>, AppError> {
        PowerService::get_by_id(self, id).await
    }
    async fn create(&self, power: Power) -> Result<Power, AppError> {
        PowerService::create(self, power).await
    }
    async fn update(&self, id: &str, power: Power) -> Result<Option<Power>, AppError> {
        PowerService::update(self, id, power).await
    }
    async fn delete(&self, id: &str) -> Result<bool, AppError> {
        PowerService::delete(self, id).await
    }
}

pub type DynHeroService = Arc<dyn HeroServiceTrait>;
pub type DynPowerService = Arc<dyn PowerServiceTrait>;

#[derive(Clone)]
pub struct AppState {
    pub heroes: DynHeroService,
    pub powers: DynPowerService,
    pub db_pool: MySqlPool,
}
