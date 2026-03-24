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

# nginx.conf.template has ${BACKEND_URL} substituted at container start.
# nginx.conf is kept as a fallback for environments where the entrypoint is
# replaced (e.g. platforms that override ENTRYPOINT/CMD directly).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Entrypoint runs envsubst then starts nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
