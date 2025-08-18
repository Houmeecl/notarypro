# Dockerfile para NotaryVecino
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./

# Stage para construir el cliente
FROM base AS client-builder

COPY client/package*.json ./client/
RUN cd client && npm ci --only=production

COPY client/ ./client/
COPY shared/ ./shared/

# Construir cliente
RUN cd client && npm run build

# Stage para construir el servidor
FROM base AS server-builder

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY shared/ ./shared/

# Construir servidor
RUN npm run build

# Stage de producción
FROM node:18-alpine AS production

# Instalar dependencias del sistema para producción
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    curl \
    dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S notaryapp -u 1001

WORKDIR /app

# Copiar archivos de producción
COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/client/dist ./client-dist
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/package*.json ./
COPY --from=server-builder /app/shared ./shared

# Crear directorios necesarios
RUN mkdir -p uploads docs logs && \
    chown -R notaryapp:nodejs /app

# Copiar scripts de inicio
COPY --chown=notaryapp:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar a usuario no-root
USER notaryapp

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/auth/verify-token || exit 1

# Punto de entrada
ENTRYPOINT ["dumb-init", "--"]
CMD ["/usr/local/bin/docker-entrypoint.sh"]