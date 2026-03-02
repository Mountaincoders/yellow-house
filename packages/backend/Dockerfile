# Multi-stage build for backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages/shared packages/shared/
COPY packages/backend packages/backend/

# Install dependencies and build
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    cd packages/backend && \
    pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in production image
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages/shared packages/shared/
COPY packages/backend packages/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built backend from builder stage
COPY --from=builder /app/packages/backend/dist packages/backend/dist

# Set working directory to backend
WORKDIR /app/packages/backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3001

# Start the backend
CMD ["npm", "start"]
