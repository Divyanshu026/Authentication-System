# Authentication Service

TypeScript and Express authentication API with PostgreSQL, Redis, JWT cookies, password hashing, email verification, password reset, rate limiting, and role-protected routes.

## Requirements

- Node.js 20 or newer
- PostgreSQL
- Redis

The project is being developed in WSL. Install dependencies from the WSL environment so native packages such as `argon2` are built for Linux.

## Configuration

Create a `.env` file in the project root:

```env
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/auth_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-a-long-random-secret
```

Use a strong, unique value for `JWT_SECRET` and do not commit `.env`.

## Installation

```bash
npm install
```

Create the PostgreSQL database named in `DATABASE_URL`, then run the migration:

```bash
npm run migrate
```

The migration reads `src/config/schema.sql` from the project root. The current schema should be checked before running it: the `verification_tokens` foreign key references `user(id)`, while the users table is named `users`.

## Running

Development mode with file watching:

```bash
npm run dev
```

Run once:

```bash
npm start
```

The API listens on `http://localhost:5001` by default.

## Endpoints

- `GET /health` - service health check
- `POST /auth/register` - register a user
- `POST /auth/login` - authenticate and set cookies
- `POST /auth/logout` - clear the authenticated session
- `GET /auth/me` - return the current user
- `POST /auth/forgot-password` - request a password reset
- `POST /auth/reset-password` - reset a password
- `POST /auth/verify-email` - verify an email address
- `POST /auth/verify-email/resend` - resend email verification for the current user

Example requests are available in [`api.http`](api.http) and can be run with the VS Code REST Client extension.

## Type checking

The repository does not currently define a typecheck npm script. Run the compiler directly:

```bash
npx tsc --noEmit
```
