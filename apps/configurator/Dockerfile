# Stage 1: Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY packages/configurator-contracts/package*.json ./packages/configurator-contracts/
COPY apps/configurator/package*.json ./apps/configurator/

# Install dependencies
RUN npm ci --workspace=apps/configurator --include-workspace-root

# Copy source and build
COPY packages/configurator-contracts/ ./packages/configurator-contracts/
RUN npm run build --workspace=@configurator/contracts

COPY apps/configurator/ ./apps/configurator/
RUN npm run build --workspace=@configurator/web

# Stage 2: Serve with Nginx Alpine
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/configurator/dist /usr/share/nginx/html
COPY apps/configurator/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
