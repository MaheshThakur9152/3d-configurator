# 08 - Docker Orchestration and Production Deployment Guide

## 1. Executive Summary

This document specifies the containerization, orchestration, and production deployment architecture for the 3D jewellery configurator stack.

The stack comprises two containerized services:
1. **`configurator-web`**: The React Three Fiber frontend built via multi-stage Vite and served via an alpine Nginx web server.
2. **`configurator-api`**: The Fastify Node.js backend providing product manifests, dynamic pricing, asset ingestion, and MedusaJS cart adaptation.
3. **`asset-storage`**: Persistent local volume mount for 3D model assets (`.glb`) and environment panoramas (`.hdr`), ready to sync with Amazon S3 or Cloudflare R2 in production.

---

## 2. Docker Architecture Overview

```
                      [ External Internet Traffic ]
                                   │
                                   ▼
                      [ Ingress / Reverse Proxy ]
                     (AWS ALB / Nginx / Cloudflare)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   viewer.yourjewellery.com                   api.yourjewellery.com
              │                                         │
              ▼                                         ▼
  +─────────────────────────+               +──────────────────────────+
  |    configurator-web     |               |     configurator-api     |
  |  (Nginx Alpine: Port 80)|               | (Node 20 Alpine: Pt 8080)|
  +─────────────────────────+               +──────────────────────────+
              │                                         │
              │                                         ▼
              │                             +──────────────────────────+
              └────────────────────────────►|   Shared Asset Volume    |
                                            |   /data/storage/models   |
                                            +──────────────────────────+
```

---

## 3. Container Definitions

### 3.1 Frontend Container (`apps/configurator/Dockerfile`)
Uses a multi-stage build: Stage 1 builds the production Vite bundle; Stage 2 serves static assets through Nginx Alpine with custom Gzip/Brotli compression:

```dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/configurator/package*.json ./apps/configurator/
RUN npm ci --workspace=apps/configurator --include-workspace-root
COPY apps/configurator/ ./apps/configurator/
RUN npm run build --workspace=apps/configurator

# Stage 2: Serve via Nginx
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/configurator/dist /usr/share/nginx/html
COPY apps/configurator/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

---

### 3.2 Backend Container (`services/configurator-api/Dockerfile`)
Multi-stage Node.js build running with a non-root unprivileged user:

```dockerfile
# Stage 1: Build API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY services/configurator-api/package*.json ./services/configurator-api/
RUN npm ci --workspace=services/configurator-api --include-workspace-root
COPY services/configurator-api/ ./services/configurator-api/
RUN npm run build --workspace=services/configurator-api

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/services/configurator-api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/configurator-api/package.json ./package.json
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["node", "dist/index.js"]
```

---

## 4. Docker Compose Orchestration (`docker-compose.yml`)

The root `docker-compose.yml` coordinates the local development and production-like environment:

```yaml
version: '3.8'

services:
  configurator-api:
    build:
      context: .
      dockerfile: services/configurator-api/Dockerfile
    container_name: jewel-configurator-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - HOST=0.0.0.0
      - NODE_ENV=production
      - STORAGE_DRIVER=local
      - STORAGE_LOCAL_PATH=/data/storage
      - MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL:-http://localhost:9000}
      - MEDUSA_API_KEY=${MEDUSA_API_KEY:-}
      - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}
    volumes:
      - asset-data:/data/storage
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 15s
      timeout: 3s
      retries: 3

  configurator-web:
    build:
      context: .
      dockerfile: apps/configurator/Dockerfile
    container_name: jewel-configurator-web
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8080
    depends_on:
      configurator-api:
        condition: service_healthy
    volumes:
      - asset-data:/usr/share/nginx/html/storage:ro
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 15s
      timeout: 3s
      retries: 3

volumes:
  asset-data:
    driver: local
```

---

## 5. Local Run Commands

### Start All Services:
```bash
docker compose up -d --build
```

### Verify Running Containers and Health:
```bash
docker compose ps
```

### View Live API Logs:
```bash
docker compose logs -f configurator-api
```

### Stop Services & Preserve Volumes:
```bash
docker compose down
```

---

## 6. Production Deployment Checklist

1. **SSL / TLS Termination**: Enforce HTTPS on both `viewer.yourdomain.com` and `api.yourdomain.com` with TLS 1.3.
2. **CDN Edge Caching**:
   - Cache `.glb` 3D models and `.hdr` panoramas at Cloudflare / CloudFront edge locations with `Cache-Control: public, max-age=31536000, immutable`.
   - Never cache `/api/configurator/pricing/calculate` or `/health`.
3. **Object Storage Migration**:
   - In production, set `STORAGE_DRIVER=s3` and configure `S3_BUCKET`, `S3_REGION`, and IAM role credentials instead of local Docker volume mounts.
4. **Security Hardening**:
   - Ensure container processes run under unprivileged non-root users (`appuser`).
   - Validate that CORS origin allows only the authoritative storefront domains.
