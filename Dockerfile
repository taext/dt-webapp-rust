FROM ubuntu:22.04 as builder

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Rust and build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    pkg-config \
    build-essential \
    libssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app
COPY . .

# Build the application
RUN chmod +x ./build.sh
RUN ./build.sh
RUN cargo build --release

# Use the same Ubuntu version for runtime
FROM ubuntu:22.04

# Install minimum runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/target/release/decimal-time-webapp .
COPY --from=builder /app/static ./static

# Update the server address to listen on all interfaces, not just localhost
# This is a common issue when deploying in Docker
RUN if grep -q "127.0.0.1" decimal-time-webapp; then \
      echo "Warning: Your server might be configured to only listen on localhost."; \
      echo "Please check your main.rs to ensure it binds to 0.0.0.0 instead of 127.0.0.1"; \
    fi

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD ["./decimal-time-webapp"]