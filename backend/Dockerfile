# Backend Dockerfile (NestJS)

FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Runtime image
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist


# Start the application
CMD ["node", "dist/main"]
