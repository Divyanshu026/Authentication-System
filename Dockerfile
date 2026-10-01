# STAGE 1: BUILDER (The Heavy Compiler)
FROM node:22.23-trixie-slim AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY auth-service/src ./src

RUN npm run build

# STAGE 2: PRODUCTION (The Lean Runtime)
FROM node:22.23-trixie-slim AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/config/schema.sql ./dist/config/schema.sql

EXPOSE 3000

CMD ["node", "dist/server.js"]

