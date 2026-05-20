FROM rust:1.87-slim AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Cache dependencies
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs && cargo build --release && rm -rf src

# Build application
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/target/release/rust-api ./rust-api
COPY migrations ./migrations
COPY .data ./.data

ENV PORT=3000
ENV DATABASE_URL=mysql://heroes_app:heroes_app@mysql:3306/rust_api
ENV JSON_SEED_ENABLED=false
ENV JSON_SEED_DATA_PATH=/app/.data
ENV RUST_LOG=rust_api=info

EXPOSE 3000

ENTRYPOINT ["./rust-api"]
