# ---------- build stage -----------------------------------------------------
FROM node:lts-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build            # → dist/

# ---------- runtime stage ---------------------------------------------------
FROM nginx:alpine

# React билд
COPY --from=builder /app/dist /usr/share/nginx/html

# Конфиг внутреннего Nginx
COPY ./nginx/nginx.prod.conf /etc/nginx/nginx.conf

# Томы со static / media от Django (ро‑монтируются в compose)
VOLUME [ "/app/staticfiles", "/app/media" ]

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]