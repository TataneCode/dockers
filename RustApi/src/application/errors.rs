use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Referenced power IDs do not exist: {0:?}")]
    InvalidPowerReference(Vec<String>),

    #[error(transparent)]
    Internal(#[from] anyhow::Error),
}
