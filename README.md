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
│   └── README.md
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

Create a `.env` file in the project root:

```env
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/auth_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Notes:

- `JWT_SECRET` should be a strong, unique secret and never committed to source control
- `DATABASE_URL` should match your PostgreSQL instance
- `REDIS_URL` should match your Redis instance

---

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose up -d postgres redis
```

3. Create the database if it does not already exist:

```bash
createdb auth_db
```

4. Run migrations for local development:

```bash
npm run migrate:dev
```

For the Dockerized production/container environment, use:

```bash
npm run migrate:prod
```

5. Start the development server:

```bash
npm run dev
```

The service should run on:

```text
http://localhost:5001
```

---

## Docker Setup

The project includes a Docker Compose setup for local development.

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

- `GET /api-docs` — Interactive Swagger UI documentation
- Open in the browser at: `http://localhost:5001/api-docs`

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
- Redis is used to track active sessions and validate refresh tokens
- JWT claims are used to identify the user and enforce authentication
- Argon2 hashes passwords before saving them

---

## Security Features

- password hashing with Argon2
- HTTP-only cookies to reduce XSS risk
- refresh token rotation and session invalidation
- rate limiting on auth routes
- role-based middleware for protected admin resources
- input validation with Zod schemas
- CORS and Helmet hardening

---

## Testing

This project includes API tests using Jest and Supertest.

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm test-runner
```

Tests are located in [tests/auth.test.ts](tests/auth.test.ts) and cover core registration and login flows.

---

## Notes

- The project is organized as an auth backend service and is ready to be connected to a frontend or another upstream service.
- Swagger/OpenAPI documentation is initialized in the app and can be extended in the app configuration layer.
- Keep environment values out of version control and use a secure secret in production.

---

## License

This project is currently licensed under the ISC license as declared in [package.json](package.json).
