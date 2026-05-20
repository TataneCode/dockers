use crate::application::errors::AppError;
use crate::domain::models::Hero;
use crate::domain::repositories::{HeroRepository, PowerRepository};
use std::collections::HashSet;
use uuid::Uuid;

pub struct HeroService<H: HeroRepository, P: PowerRepository> {
    hero_repo: H,
    power_repo: P,
}

impl<H: HeroRepository, P: PowerRepository> HeroService<H, P> {
    pub fn new(hero_repo: H, power_repo: P) -> Self {
        Self {
            hero_repo,
            power_repo,
        }
    }

    pub async fn get_all(&self) -> Result<Vec<Hero>, AppError> {
        self.hero_repo.get_all().await.map_err(AppError::Internal)
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Hero>, AppError> {
        self.hero_repo
            .get_by_id(id)
            .await
            .map_err(AppError::Internal)
    }

    pub async fn create(&self, mut hero: Hero) -> Result<Hero, AppError> {
        hero.power_ids = normalize_power_ids(&hero.power_ids);
        self.ensure_powers_exist(&hero.power_ids).await?;
        hero.id = Uuid::new_v4().to_string();
        self.hero_repo.create(hero).await.map_err(AppError::Internal)
    }

    pub async fn update(&self, id: &str, mut hero: Hero) -> Result<Option<Hero>, AppError> {
        hero.power_ids = normalize_power_ids(&hero.power_ids);
        self.ensure_powers_exist(&hero.power_ids).await?;
        hero.id = id.to_owned();
        self.hero_repo
            .update(hero)
            .await
            .map_err(AppError::Internal)
    }

    pub async fn delete(&self, id: &str) -> Result<bool, AppError> {
        self.hero_repo
            .delete(id)
            .await
            .map_err(AppError::Internal)
    }

    async fn ensure_powers_exist(&self, power_ids: &[String]) -> Result<(), AppError> {
        if power_ids.is_empty() {
            return Ok(());
        }
        let missing = self
            .power_repo
            .get_missing_ids(power_ids)
            .await
            .map_err(AppError::Internal)?;
        if !missing.is_empty() {
            return Err(AppError::InvalidPowerReference(missing));
        }
        Ok(())
    }
}

fn normalize_power_ids(ids: &[String]) -> Vec<String> {
    let mut seen = HashSet::new();
    ids.iter()
        .filter(|id| !id.trim().is_empty() && seen.insert(id.as_str()))
        .cloned()
        .collect()
}
