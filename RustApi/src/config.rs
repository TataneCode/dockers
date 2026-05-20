use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub port: u16,
    pub json_seed_enabled: bool,
    pub json_seed_data_path: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let _ = dotenvy::dotenv();

        Self {
            database_url: required("DATABASE_URL"),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".into())
                .parse()
                .expect("PORT must be a valid u16"),
            json_seed_enabled: env::var("JSON_SEED_ENABLED")
                .unwrap_or_else(|_| "false".into())
                .to_lowercase()
                == "true",
            json_seed_data_path: env::var("JSON_SEED_DATA_PATH")
                .unwrap_or_else(|_| ".data".into()),
        }
    }
}

fn required(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("{key} environment variable is required"))
}
