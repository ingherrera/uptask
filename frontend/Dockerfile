# =========================
# 1. BUILD (Node)
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# Como el context es la raíz, hay que apuntar a frontend/
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN echo "VALOR DURANTE BUILD: $VITE_API_URL" 

RUN npm run build

# =========================
# 2. SERVE (Nginx)
# =========================
#FROM nginx:alpine
FROM docker.io/library/nginx:alpine

# El nginx.conf está en la raíz, no en frontend/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]