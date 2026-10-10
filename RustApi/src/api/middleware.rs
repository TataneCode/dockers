use axum::http::HeaderValue;
use std::time::Instant;

pub async fn server_timing(
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let start = Instant::now();
    let mut res = next.run(req).await;
    let dur = start.elapsed().as_secs_f64() * 1000.0;
    if let Ok(value) = HeaderValue::from_str(&format!("app;dur={dur:.1}")) {
        res.headers_mut().insert("server-timing", value);
    }
    res
}
