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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::models::Power;
    use mockall::mock;
    use mockall::predicate::eq;

    mock! {
        HeroRepo {}
        #[async_trait::async_trait]
        impl HeroRepository for HeroRepo {
            async fn get_all(&self) -> anyhow::Result<Vec<Hero>>;
            async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Hero>>;
            async fn create(&self, hero: Hero) -> anyhow::Result<Hero>;
            async fn update(&self, hero: Hero) -> anyhow::Result<Option<Hero>>;
            async fn delete(&self, id: &str) -> anyhow::Result<bool>;
        }
    }

    mock! {
        PowerRepo {}
        #[async_trait::async_trait]
        impl PowerRepository for PowerRepo {
            async fn get_all(&self) -> anyhow::Result<Vec<Power>>;
            async fn get_by_id(&self, id: &str) -> anyhow::Result<Option<Power>>;
            async fn create(&self, power: Power) -> anyhow::Result<Power>;
            async fn update(&self, power: Power) -> anyhow::Result<Option<Power>>;
            async fn delete(&self, id: &str) -> anyhow::Result<bool>;
            async fn get_missing_ids(&self, ids: &[String]) -> anyhow::Result<Vec<String>>;
        }
    }

    fn make_hero(id: &str) -> Hero {
        Hero {
            id: id.to_owned(),
            name: "Maya Rivers".to_owned(),
            alias: "Mindwave".to_owned(),
            origin: "Cosmic radiation".to_owned(),
            power_ids: vec![],
        }
    }

    #[tokio::test]
    async fn get_all_returns_all_heroes() {
        let mut hero_repo = MockHeroRepo::new();
        let power_repo = MockPowerRepo::new();
        hero_repo
            .expect_get_all()
            .once()
            .returning(|| Ok(vec![make_hero("h1")]));
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.get_all().await.unwrap();

        assert_eq!(result.len(), 1);
        assert_eq!(result[0].id, "h1");
    }

    #[tokio::test]
    async fn get_by_id_returns_hero_when_found() {
        let mut hero_repo = MockHeroRepo::new();
        let power_repo = MockPowerRepo::new();
        hero_repo
            .expect_get_by_id()
            .with(eq("h1"))
            .once()
            .returning(|_| Ok(Some(make_hero("h1"))));
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.get_by_id("h1").await.unwrap();

        assert_eq!(result.as_ref().map(|hero| hero.id.as_str()), Some("h1"));
    }

    #[tokio::test]
    async fn get_by_id_returns_none_when_not_found() {
        let mut hero_repo = MockHeroRepo::new();
        let power_repo = MockPowerRepo::new();
        hero_repo
            .expect_get_by_id()
            .with(eq("h1"))
            .once()
            .returning(|_| Ok(None));
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.get_by_id("h1").await.unwrap();

        assert!(result.is_none());
    }

    #[tokio::test]
    async fn create_generates_new_id() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo.expect_create().once().returning(Ok);
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("original-id");
        input.power_ids = vec!["p1".to_owned()];

        let result = service.create(input.clone()).await.unwrap();

        assert!(!result.id.is_empty());
        assert_ne!(result.id, input.id);
    }

    #[tokio::test]
    async fn create_deduplicates_power_ids() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .withf(|ids| ids.len() == 1 && ids[0] == "p1")
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo
            .expect_create()
            .withf(|hero| hero.power_ids == vec!["p1"])
            .once()
            .returning(Ok);
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("hero-1");
        input.power_ids = vec!["p1".to_owned(), "p1".to_owned()];

        let result = service.create(input).await.unwrap();

        assert_eq!(result.power_ids, vec!["p1"]);
    }

    #[tokio::test]
    async fn create_removes_blank_power_ids() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .withf(|ids| ids.len() == 1 && ids[0] == "p1")
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo
            .expect_create()
            .withf(|hero| hero.power_ids == vec!["p1"])
            .once()
            .returning(Ok);
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("hero-1");
        input.power_ids = vec!["".to_owned(), "  ".to_owned(), "p1".to_owned()];

        let result = service.create(input).await.unwrap();

        assert_eq!(result.power_ids, vec!["p1"]);
    }

    #[tokio::test]
    async fn create_skips_power_validation_when_no_powers() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo.expect_get_missing_ids().never();
        hero_repo.expect_create().once().returning(Ok);
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.create(make_hero("hero-1")).await.unwrap();

        assert!(result.power_ids.is_empty());
    }

    #[tokio::test]
    async fn create_returns_error_for_missing_power_ids() {
        let hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .once()
            .returning(|_| Ok(vec!["p9".to_owned()]));
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("hero-1");
        input.power_ids = vec!["p9".to_owned()];

        let result = service.create(input).await;

        match result {
            Err(AppError::InvalidPowerReference(ids)) => assert_eq!(ids, vec!["p9"]),
            other => panic!("expected InvalidPowerReference, got {other:?}"),
        }
    }

    #[tokio::test]
    async fn update_sets_provided_id() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo
            .expect_update()
            .withf(|hero| hero.id == "h1")
            .once()
            .returning(|hero| Ok(Some(hero)));
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("old-id");
        input.power_ids = vec!["p1".to_owned()];

        let result = service.update("h1", input).await.unwrap();

        assert_eq!(result.as_ref().map(|hero| hero.id.as_str()), Some("h1"));
    }

    #[tokio::test]
    async fn update_returns_none_when_hero_not_found() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo.expect_update().once().returning(|_| Ok(None));
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("old-id");
        input.power_ids = vec!["p1".to_owned()];

        let result = service.update("h1", input).await.unwrap();

        assert!(result.is_none());
    }

    #[tokio::test]
    async fn update_deduplicates_power_ids() {
        let mut hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .withf(|ids| ids.len() == 1 && ids[0] == "p1")
            .once()
            .returning(|_| Ok(vec![]));
        hero_repo
            .expect_update()
            .withf(|hero| hero.id == "h1" && hero.power_ids == vec!["p1"])
            .once()
            .returning(|hero| Ok(Some(hero)));
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("old-id");
        input.power_ids = vec!["p1".to_owned(), "p1".to_owned()];

        let result = service.update("h1", input).await.unwrap();

        assert_eq!(result.unwrap().power_ids, vec!["p1"]);
    }

    #[tokio::test]
    async fn update_returns_error_for_missing_power_ids() {
        let hero_repo = MockHeroRepo::new();
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_missing_ids()
            .once()
            .returning(|_| Ok(vec!["p9".to_owned()]));
        let service = HeroService::new(hero_repo, power_repo);
        let mut input = make_hero("old-id");
        input.power_ids = vec!["p9".to_owned()];

        let result = service.update("h1", input).await;

        match result {
            Err(AppError::InvalidPowerReference(ids)) => assert_eq!(ids, vec!["p9"]),
            other => panic!("expected InvalidPowerReference, got {other:?}"),
        }
    }

    #[tokio::test]
    async fn delete_returns_true_when_hero_deleted() {
        let mut hero_repo = MockHeroRepo::new();
        let power_repo = MockPowerRepo::new();
        hero_repo
            .expect_delete()
            .with(eq("h1"))
            .once()
            .returning(|_| Ok(true));
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.delete("h1").await.unwrap();

        assert!(result);
    }

    #[tokio::test]
    async fn delete_returns_false_when_hero_not_found() {
        let mut hero_repo = MockHeroRepo::new();
        let power_repo = MockPowerRepo::new();
        hero_repo
            .expect_delete()
            .with(eq("h1"))
            .once()
            .returning(|_| Ok(false));
        let service = HeroService::new(hero_repo, power_repo);

        let result = service.delete("h1").await.unwrap();

        assert!(!result);
    }
}
