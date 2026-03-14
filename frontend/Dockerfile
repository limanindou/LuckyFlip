# Multi-stage Dockerfile for frontend (Vite + React)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine
LABEL org.opencontainers.image.title="LuckyFlip-frontend"
LABEL org.opencontainers.image.license="MIT"

# Copy custom nginx config for SPA fallback and API proxy to backend in compose
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
