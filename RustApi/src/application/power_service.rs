use crate::application::errors::AppError;
use crate::domain::models::Power;
use crate::domain::repositories::PowerRepository;
use uuid::Uuid;

pub struct PowerService<P: PowerRepository> {
    power_repo: P,
}

impl<P: PowerRepository> PowerService<P> {
    pub fn new(power_repo: P) -> Self {
        Self { power_repo }
    }

    pub async fn get_all(&self) -> Result<Vec<Power>, AppError> {
        self.power_repo.get_all().await.map_err(AppError::Internal)
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Power>, AppError> {
        self.power_repo
            .get_by_id(id)
            .await
            .map_err(AppError::Internal)
    }

    pub async fn create(&self, mut power: Power) -> Result<Power, AppError> {
        power.id = Uuid::new_v4().to_string();
        self.power_repo
            .create(power)
            .await
            .map_err(AppError::Internal)
    }

    pub async fn update(&self, id: &str, mut power: Power) -> Result<Option<Power>, AppError> {
        power.id = id.to_owned();
        self.power_repo
            .update(power)
            .await
            .map_err(AppError::Internal)
    }

    pub async fn delete(&self, id: &str) -> Result<bool, AppError> {
        self.power_repo
            .delete(id)
            .await
            .map_err(AppError::Internal)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::mock;
    use mockall::predicate::eq;

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

    fn make_power(id: &str) -> Power {
        Power {
            id: id.to_owned(),
            name: "Flight".to_owned(),
            description: "Allows aerial movement at high speed".to_owned(),
            kind: "Movement".to_owned(),
            level: 8,
        }
    }

    #[tokio::test]
    async fn get_all_returns_all_powers() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_all()
            .once()
            .returning(|| Ok(vec![make_power("p1")]));
        let service = PowerService::new(power_repo);

        let result = service.get_all().await.unwrap();

        assert_eq!(result.len(), 1);
        assert_eq!(result[0].id, "p1");
    }

    #[tokio::test]
    async fn get_by_id_returns_power_when_found() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_by_id()
            .with(eq("p1"))
            .once()
            .returning(|_| Ok(Some(make_power("p1"))));
        let service = PowerService::new(power_repo);

        let result = service.get_by_id("p1").await.unwrap();

        assert_eq!(result.as_ref().map(|power| power.id.as_str()), Some("p1"));
    }

    #[tokio::test]
    async fn get_by_id_returns_none_when_not_found() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_get_by_id()
            .with(eq("p1"))
            .once()
            .returning(|_| Ok(None));
        let service = PowerService::new(power_repo);

        let result = service.get_by_id("p1").await.unwrap();

        assert!(result.is_none());
    }

    #[tokio::test]
    async fn create_generates_new_id() {
        let mut power_repo = MockPowerRepo::new();
        power_repo.expect_create().once().returning(Ok);
        let service = PowerService::new(power_repo);
        let input = make_power("original-id");

        let result = service.create(input.clone()).await.unwrap();

        assert!(!result.id.is_empty());
        assert_ne!(result.id, input.id);
    }

    #[tokio::test]
    async fn update_sets_provided_id() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_update()
            .withf(|power| power.id == "p1")
            .once()
            .returning(|power| Ok(Some(power)));
        let service = PowerService::new(power_repo);

        let result = service.update("p1", make_power("old-id")).await.unwrap();

        assert_eq!(result.as_ref().map(|power| power.id.as_str()), Some("p1"));
    }

    #[tokio::test]
    async fn update_returns_none_when_power_not_found() {
        let mut power_repo = MockPowerRepo::new();
        power_repo.expect_update().once().returning(|_| Ok(None));
        let service = PowerService::new(power_repo);

        let result = service.update("p1", make_power("old-id")).await.unwrap();

        assert!(result.is_none());
    }

    #[tokio::test]
    async fn delete_returns_true_when_power_deleted() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_delete()
            .with(eq("p1"))
            .once()
            .returning(|_| Ok(true));
        let service = PowerService::new(power_repo);

        let result = service.delete("p1").await.unwrap();

        assert!(result);
    }

    #[tokio::test]
    async fn delete_returns_false_when_power_not_found() {
        let mut power_repo = MockPowerRepo::new();
        power_repo
            .expect_delete()
            .with(eq("p1"))
            .once()
            .returning(|_| Ok(false));
        let service = PowerService::new(power_repo);

        let result = service.delete("p1").await.unwrap();

        assert!(!result);
    }
}
