use crate::api::dto::{HeroRequest, HeroResponse, PowerRequest, PowerResponse, PowerType};
use crate::api::handlers::seed::{SeedRequest, SeedResponse};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    info(title = "RustApi - Heroes & Powers", version = "1.0.0"),
    paths(
        crate::api::handlers::heroes::get_all,
        crate::api::handlers::heroes::get_by_id,
        crate::api::handlers::heroes::create,
        crate::api::handlers::heroes::update,
        crate::api::handlers::heroes::delete,
        crate::api::handlers::powers::get_all,
        crate::api::handlers::powers::get_by_id,
        crate::api::handlers::powers::create,
        crate::api::handlers::powers::update,
        crate::api::handlers::powers::delete,
        crate::api::handlers::seed::seed,
        crate::api::handlers::seed::clean,
    ),
    components(schemas(HeroRequest, HeroResponse, PowerRequest, PowerResponse, PowerType, SeedRequest, SeedResponse)),
    tags(
        (name = "Heroes", description = "Hero management"),
        (name = "Powers", description = "Power management"),
        (name = "Seed", description = "Database seeding for performance testing"),
    )
)]
pub struct ApiDoc;
