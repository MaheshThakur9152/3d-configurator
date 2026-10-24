# Stage 1: Build API
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/configurator-contracts/package*.json ./packages/configurator-contracts/
COPY services/configurator-api/package*.json ./services/configurator-api/

RUN npm ci --workspace=services/configurator-api --include-workspace-root

COPY packages/configurator-contracts/ ./packages/configurator-contracts/
RUN npm run build --workspace=@configurator/contracts

COPY services/configurator-api/ ./services/configurator-api/
RUN npm run build --workspace=@configurator/api

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/configurator-contracts/dist ./packages/configurator-contracts/dist
COPY --from=builder /app/packages/configurator-contracts/package.json ./packages/configurator-contracts/package.json
COPY --from=builder /app/services/configurator-api/dist ./dist
COPY --from=builder /app/services/configurator-api/package.json ./package.json

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
