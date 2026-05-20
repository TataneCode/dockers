use crate::domain::models::Power;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Category of a power
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub enum PowerType {
    Physical,
    Mental,
    Elemental,
    Tech,
}

impl std::fmt::Display for PowerType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            PowerType::Physical => "Physical",
            PowerType::Mental => "Mental",
            PowerType::Elemental => "Elemental",
            PowerType::Tech => "Tech",
        };
        write!(f, "{s}")
    }
}

impl TryFrom<String> for PowerType {
    type Error = String;

    fn try_from(s: String) -> Result<Self, Self::Error> {
        match s.as_str() {
            "Physical" => Ok(PowerType::Physical),
            "Mental" => Ok(PowerType::Mental),
            "Elemental" => Ok(PowerType::Elemental),
            "Tech" => Ok(PowerType::Tech),
            other => Err(format!("Unknown power type: {other}")),
        }
    }
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct PowerRequest {
    /// Name of the power
    #[schema(example = "Web-Slinging")]
    pub name: String,
    /// Detailed description of the power
    #[schema(example = "Ability to shoot webs and swing between buildings")]
    pub description: String,
    /// Category of the power
    #[serde(rename = "type")]
    pub kind: PowerType,
    /// Strength level of the power (0–10)
    #[schema(minimum = 0, maximum = 10, example = 8)]
    pub level: i32,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct PowerResponse {
    /// Unique identifier of the power
    pub id: String,
    /// Name of the power
    #[schema(example = "Web-Slinging")]
    pub name: String,
    /// Detailed description of the power
    #[schema(example = "Ability to shoot webs and swing between buildings")]
    pub description: String,
    /// Category of the power
    #[serde(rename = "type")]
    pub kind: PowerType,
    /// Strength level of the power (0–10)
    #[schema(minimum = 0, maximum = 10, example = 8)]
    pub level: i32,
}

impl From<Power> for PowerResponse {
    fn from(p: Power) -> Self {
        Self {
            id: p.id,
            name: p.name,
            description: p.description,
            kind: PowerType::try_from(p.kind).unwrap_or(PowerType::Physical),
            level: p.level,
        }
    }
}

impl From<PowerRequest> for Power {
    fn from(r: PowerRequest) -> Self {
        Self {
            id: String::new(),
            name: r.name,
            description: r.description,
            kind: r.kind.to_string(),
            level: r.level,
        }
    }
}
