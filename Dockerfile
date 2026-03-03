# Multi-stage Dockerfile for Yellow House Backend

# Build stage
FROM node:24-alpine AS build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all files  
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build TypeScript
RUN pnpm build

# Runtime stage
FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built app from build stage
COPY --from=build /app .

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run migrations and start backend
CMD sh -c "pnpm -F backend run db:migrate && pnpm -F backend start"
