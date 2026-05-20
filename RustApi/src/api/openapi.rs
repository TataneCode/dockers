use crate::api::dto::{HeroRequest, HeroResponse, PowerRequest, PowerResponse};
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
    ),
    components(schemas(HeroRequest, HeroResponse, PowerRequest, PowerResponse)),
    tags(
        (name = "Heroes", description = "Hero management"),
        (name = "Powers", description = "Power management"),
    )
)]
pub struct ApiDoc;
