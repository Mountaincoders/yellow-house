# Multi-stage build for Yellow House

# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./

# Copy packages
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build project
RUN pnpm build

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

# Install pnpm for runtime
RUN npm install -g pnpm

# Copy built files from builder
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

# Start backend server
CMD ["pnpm", "run", "server:start"]
