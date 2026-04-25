# =========================
# 1. BUILD (Node)
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# Como el context es la raíz, hay que apuntar a frontend/
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# =========================
# 2. SERVE (Nginx)
# =========================
FROM nginx:alpine

# El nginx.conf está en la raíz, no en frontend/
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]