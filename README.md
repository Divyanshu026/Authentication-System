# Authentication System

A TypeScript-based authentication service built with Express, PostgreSQL, Redis, JWT, and cookie-based session management. It provides user registration, login, logout, password reset, email verification, protected routes, and admin-role access control.

## Overview

This project is designed as a backend auth service for web applications that need:

- secure user registration and login
- session persistence with refresh tokens
- password hashing using Argon2
- email verification workflows
- password reset flows
- rate limiting and middleware validation
- role-based access control for admin-only endpoints

---

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- Redis
- Zod for validation
- JWT for auth tokens
- Argon2 for password hashing
- Helmet + CORS + rate limiting middleware

---

## Project Structure

```text
.
├── auth-service/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── api.http
├── tests/
├── docker-compose.yml
├── docker-compose.test.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.cjs
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+
- PostgreSQL running locally or via Docker
- Redis running locally or via Docker
- WSL is recommended for local development on Windows, especially for native dependencies like Argon2

---

## Environment Variables

Create a `.env` file in the project root. Compose requires the database, Redis, and JWT values:

```env
NODE_ENV=production
PORT=3000
TRUST_PROXY=false
FRONTEND_URL=http://localhost:3000

POSTGRES_USER=auth_user
POSTGRES_PASSWORD=change_me_local_only
POSTGRES_DB=auth_db
DATABASE_URL=postgresql://auth_user:change_me_local_only@postgres:5432/auth_db
REDIS_URL=redis://redis:6379
JWT_SECRET=replace-with-a-long-random-secret

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@example.com
```

Notes:

- `JWT_SECRET` should be a strong, unique secret and never committed to source control
- `DATABASE_URL` should match your PostgreSQL instance
- `REDIS_URL` should use `redis://redis:6379` when the API runs in Compose
- Configure SMTP variables for verification and password-reset email delivery
- Use strong, externalized credentials and `NODE_ENV=production` in production

---

## Local Setup

1. Create the root `.env` file described above.

2. Build and start the complete stack:

```bash
docker compose up --build -d
```

3. Run the database migration:

```bash
docker compose run --rm api npm run migrate:prod
```

4. Check the service:

```bash
curl http://localhost:3000/health
```

The service runs on:

```text
http://localhost:3000
```

For source-level development outside Docker, run PostgreSQL and Redis separately and set host-reachable `DATABASE_URL` and `REDIS_URL` values before using `npm run dev`.

---

## Docker Setup

The project includes a Docker Compose setup for local development and single-host deployment.

```bash
docker compose up --build
```

This starts:

- the API container
- a PostgreSQL container
- a Redis container

The docker configuration is defined in [docker-compose.yml](docker-compose.yml).

---

## Available Scripts

```bash
npm run dev                # run in watch mode
npm start                  # run built app
npm run build              # compile TypeScript
npm run typecheck          # run TypeScript checks without emit
npm run migrate:dev        # run database migration script for local development
npm run migrate:prod        # run database migration script for local production
npm test                   # run Jest test suite
```

---

## API Endpoints

### Swagger UI

- `GET /api-docs` — Interactive Swagger UI documentation in non-production environments
- Open in the browser at: `http://localhost:3000/api-docs`

### Health

- `GET /health` — service health check

### Authentication

- `POST /auth/register` — register a new user
- `POST /auth/login` — authenticate a user and set HTTP-only cookies
- `POST /auth/logout` — clear auth cookies and end the session
- `GET /auth/me` — fetch the authenticated user
- `POST /auth/refresh` — rotate refresh token and issue new session tokens
- `POST /auth/forgot-password` — request password reset
- `POST /auth/reset-password` — complete password reset with a token
- `POST /auth/verify-email` — verify email using a verification token
- `POST /auth/verify-email/resend` — resend verification email

### Admin

- `GET /admin/dashboard` — admin-only protected route

Example request payloads are available in [auth-service/api.http](auth-service/api.http).

---

## Authentication Flow

The service uses a secure cookie-based token model:

- `accessToken` is stored in an HTTP-only cookie and used for protected requests
- `refreshToken` is stored in a separate HTTP-only cookie for session renewal
- Redis tracks refresh sessions and short-lived access-token revocation state
- JWT claims identify the user; Redis-backed session state permits logout and password-reset revocation
- Argon2 hashes passwords before saving them

---

## Security Features

- password hashing with Argon2
- HTTP-only cookies to reduce XSS risk
- refresh token rotation and session invalidation
- rate limiting on authentication, refresh, verification, and reset routes
- role-based middleware for protected admin resources
- input validation with Zod schemas
- CORS and Helmet hardening

---

## Testing

This project includes API tests using Jest and Supertest.

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm test-runner
```

Tests are located in [tests/auth.test.ts](tests/auth.test.ts) and [tests/health.test.ts](tests/health.test.ts). They cover core registration, login, and health flows.

---

## Notes

- The project is organized as an auth backend service and is ready to be connected to a frontend or another upstream service.
- Swagger/OpenAPI documentation is available outside production; production deployments intentionally disable `/api-docs`.
- Keep environment values out of version control and use a secure secret in production.

---

## License

This project is currently licensed under the ISC license as declared in [package.json](package.json).
