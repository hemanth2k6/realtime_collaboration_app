# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests first for layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json        ./apps/backend/

# Install ALL dependencies (including devDeps needed to compile)
RUN npm ci

# Copy source
COPY packages/shared ./packages/shared
COPY apps/backend    ./apps/backend

# Compile TypeScript
RUN npm run build --workspace=apps/backend

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# netcat for wait script; openssl required by Prisma 5 on Alpine
RUN apk add --no-cache netcat-openbsd openssl

# Copy compiled output
COPY --from=builder /app/package.json             ./
COPY --from=builder /app/package-lock.json        ./
COPY --from=builder /app/packages/shared          ./packages/shared
COPY --from=builder /app/apps/backend/dist         ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma       ./apps/backend/prisma

# Copy dependencies (including Prisma v5 from root lockfile install).
COPY --from=builder /app/node_modules              ./node_modules

# Wait-for-postgres + entrypoint (migrations then server)
COPY apps/backend/wait-for-postgres.sh /wait-for-postgres.sh
COPY apps/backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /wait-for-postgres.sh /docker-entrypoint.sh

EXPOSE 5001

ENTRYPOINT ["/docker-entrypoint.sh"]
