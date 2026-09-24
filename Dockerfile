# --- Stage 1: Build Frontend and Server ---
FROM node:25-alpine AS builder

ARG GIT_COMMIT_SHA=dev
ARG BUILD_TIME=""

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy project source
COPY . .

ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA
ENV BUILD_TIME=$BUILD_TIME

# Build React client (into dist/client) and bundle Express server (into dist/server.js)
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:25-alpine AS runner

ARG GIT_COMMIT_SHA=dev
ARG BUILD_TIME=""

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA
ENV BUILD_TIME=$BUILD_TIME

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles from builder stage (includes dist/build-info.json)
COPY --from=builder /app/dist ./dist

# Create data volume mount point
RUN mkdir -p /data/uploads
VOLUME ["/data"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/auth/me || exit 1

CMD ["node", "dist/server.js"]
