# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install tools required to compile native dependencies such as argon2
RUN apk add --no-cache python3 make g++

# Copy package files and install ALL dependencies (including dev for TS)
COPY package*.json ./
RUN npm ci

# Copy the service source into the image root and compile
# Copy the service source into the image root and compile
COPY auth-service/tsconfig.json ./tsconfig.json
COPY auth-service/src ./src
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION
# ==========================================
FROM node:20-alpine AS production

# Enforce production environment optimizations
ENV NODE_ENV=production

WORKDIR /app

# Reuse the native modules built in the builder, then remove dev dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
RUN npm prune --omit=dev

# Transfer the compiled JavaScript from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/config/schema.sql ./src/config/schema.sql

# Expose the network port
EXPOSE 3000

# Execute the compiled server file
CMD ["node", "dist/server.js"]