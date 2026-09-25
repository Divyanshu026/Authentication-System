# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools needed to compile native addons (e.g. argon2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and compile
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION
# ==========================================
FROM node:20-slim AS production

ENV NODE_ENV=production

WORKDIR /app

# Reuse the node_modules already built in the builder stage,
# then strip out devDependencies — avoids recompiling native addons
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
RUN npm prune --omit=dev

# Transfer the compiled JavaScript from the builder
COPY --from=builder /app/dist ./dist

# Expose the network port
EXPOSE 3000

# Execute the compiled server file
CMD ["node", "dist/server.js"]