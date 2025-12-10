# backend/Dockerfile (in ./vetgroup_backend)

FROM node:18.17.1 AS builder
WORKDIR /srv/app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Strapi admin + server
RUN npm run build

# --- Runtime image ---
FROM node:18.17.1 AS runner
WORKDIR /srv/app

ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /srv/app ./

EXPOSE 1337

CMD ["npm", "run", "start"]
