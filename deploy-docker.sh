#!/bin/bash

echo "🐳 DESPLIEGUE CON DOCKER - NotaryVecino"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para verificar errores
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en: $1${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 completado${NC}"
    fi
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    echo "Instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose están disponibles${NC}"
echo ""

# Verificar archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ Archivo .env no encontrado${NC}"
    echo "Copiando .env.example a .env..."
    cp .env.example .env
    echo -e "${YELLOW}📝 Por favor, edita el archivo .env con tus credenciales reales${NC}"
    echo ""
fi

# Crear directorios necesarios
echo -e "${BLUE}📁 CREANDO ESTRUCTURA DE DIRECTORIOS${NC}"
echo ""

mkdir -p nginx/sites nginx/ssl monitoring uploads docs logs
check_error "Directorios creados"

# Crear configuración de Nginx para Docker
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json application/xml;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Crear configuración del sitio
cat > nginx/sites/notaryvecino.conf << 'EOF'
upstream notaryvecino_app {
    server app:5000;
}

server {
    listen 80;
    server_name localhost notarypro.cl www.notarypro.cl vecinoxpress.cl www.vecinoxpress.cl;
    
    # Archivos estáticos
    location /uploads/ {
        alias /var/www/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location /docs/ {
        alias /var/www/docs/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API y aplicación
    location / {
        proxy_pass http://notaryvecino_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Body size
        client_max_body_size 50M;
    }
    
    # WebSocket para RON
    location /api/websocket {
        proxy_pass http://notaryvecino_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Crear configuración de monitoreo
mkdir -p monitoring

cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'notaryvecino'
    static_configs:
      - targets: ['app:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s
EOF

# Construir y desplegar
echo -e "${BLUE}🔨 CONSTRUYENDO CONTENEDORES${NC}"
echo ""

docker-compose build --no-cache
check_error "Construcción de contenedores"

echo -e "${BLUE}🚀 INICIANDO SERVICIOS${NC}"
echo ""

# Iniciar servicios base
docker-compose up -d postgres redis
check_error "Servicios de base de datos iniciados"

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Iniciar aplicación
docker-compose up -d app
check_error "Aplicación iniciada"

# Iniciar Nginx
docker-compose up -d nginx
check_error "Nginx iniciado"

# Mostrar estado de los servicios
echo ""
echo -e "${BLUE}📊 ESTADO DE LOS SERVICIOS${NC}"
echo ""

docker-compose ps

echo ""
echo -e "${GREEN}🎉 DESPLIEGUE DOCKER COMPLETADO${NC}"
echo ""
echo -e "${CYAN}🌐 URLs de Acceso:${NC}"
echo "  • Principal: http://localhost"
echo "  • API: http://localhost/api"
echo "  • Documentos: http://localhost/docs"
echo "  • Uploads: http://localhost/uploads"
echo ""
echo -e "${CYAN}🔧 Comandos Útiles:${NC}"
echo "  # Ver logs de la aplicación:"
echo "  docker-compose logs -f app"
echo ""
echo "  # Ver logs de todos los servicios:"
echo "  docker-compose logs -f"
echo ""
echo "  # Detener servicios:"
echo "  docker-compose down"
echo ""
echo "  # Reiniciar aplicación:"
echo "  docker-compose restart app"
echo ""
echo "  # Acceder al contenedor:"
echo "  docker-compose exec app sh"
echo ""
echo -e "${CYAN}📊 Monitoreo (opcional):${NC}"
echo "  # Iniciar Prometheus y Grafana:"
echo "  docker-compose --profile monitoring up -d"
echo "  # Prometheus: http://localhost:9090"
echo "  # Grafana: http://localhost:3000 (admin/admin123)"
echo ""
echo -e "${YELLOW}⚠️ PRÓXIMOS PASOS:${NC}"
echo "  1. Editar .env con credenciales reales"
echo "  2. Configurar SSL para producción"
echo "  3. Configurar dominio DNS"
echo "  4. Configurar backup automático"
echo ""
echo -e "${GREEN}🚀 NotaryVecino desplegado exitosamente con Docker!${NC}"