# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy monorepo manifests first for layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY apps/frontend/package.json     ./apps/frontend/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/frontend   ./apps/frontend

RUN npm run build --workspace=apps/frontend

# ── Stage 2: Production runner (Next.js standalone) ───────────────────────────
FROM node:20-alpine AS runner

# Next / native deps on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Docker sets HOSTNAME to the container ID by default; Next would bind to that
# instead of all interfaces unless we force 0.0.0.0.
ENV HOSTNAME=0.0.0.0

# Standalone server + traced node_modules (layout: /app/apps/frontend/server.js)
COPY --from=builder /app/apps/frontend/.next/standalone ./
# Client chunks — required for RSC / browser navigation (must sit under apps/frontend/.next/)
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

WORKDIR /app/apps/frontend
CMD ["node", "server.js"]
