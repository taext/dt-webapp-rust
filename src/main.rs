// Now decimal_time is exported from the lib crate
mod routes;

use std::net::SocketAddr;
use axum::{
    routing::get,
    Router,
};
use tower_http::{
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "decimal_time_webapp=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Build our application with routes
    let app = Router::new()
        .route("/api/time", get(routes::get_current_time))
        .nest_service(
            "/",
            ServeDir::new("static").fallback(ServeDir::new("static/index.html")),
        )
        .layer(TraceLayer::new_for_http());

    // Run our application
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string()).parse().unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    tracing::debug!("listening on {}", addr);
    
    // Using the style that works with Axum 0.6.x
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}