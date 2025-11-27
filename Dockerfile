# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ARG VITE_ELECTION_ID=1
ARG VITE_FALLBACK_VOTING_START=2025-12-01T08:00:00+07:00

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ELECTION_ID=$VITE_ELECTION_ID
ENV VITE_FALLBACK_VOTING_START=$VITE_FALLBACK_VOTING_START

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
