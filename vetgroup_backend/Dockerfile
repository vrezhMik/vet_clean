FROM node:20-slim

# Install build and system dependencies for sharp (uses system libvips)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    libcairo2 \
    libpango1.0-0 \
    libjpeg-dev \
    libgif-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    libvips \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# Ensure sharp uses the system libvips instead of downloading binaries
ENV npm_config_sharp_libvips=system

# Install dependencies for the current platform/architecture
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

EXPOSE 1337

CMD ["npm", "run", "develop"]
