# VetGroup Docker Stack

Use `docker compose` to start the Next.js frontend and Strapi backend together for local development. Both services mount the host workspace so you can edit code without rebuilding the image.

## Prerequisites

1. Docker & Docker Compose installed.
2. Copy the backend secrets template:
   ```bash
   cp vetgroup_backend/.env.example vetgroup_backend/.env
   ```
   Update the values in `vetgroup_backend/.env` before running (`APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, and `TRANSFER_TOKEN_SALT` are required).

## Running the stack

From the root of the repo:

```bash
docker compose up --build
```

- The frontend is exposed on `http://localhost:3000`.
- The Strapi backend listens on `http://localhost:1337`; the Next.js app talks to it via the `NEXT_PUBLIC_API_URL` env variable that is already configured in `docker-compose.yml`.

Stop the services with `docker compose down`; the backend data lives in `vetgroup_backend/.tmp`.
