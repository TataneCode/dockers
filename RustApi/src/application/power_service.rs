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
