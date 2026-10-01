# STAGE 1: BUILDER (The Heavy Compiler)
FROM node:22.23-trixie-slim AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY auth-service/src ./auth-service/src/

RUN npm run build

# STAGE 2: PRODUCTION (The Lean Runtime)
FROM node:22.23-trixie-slim AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/auth-service/dist ./auth-service/dist

COPY --from=builder /app/auth-service/src/config/schema.sql ./auth-service/dist/config/schema.sql

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "auth-service/dist/server.js"]

