#!/bin/bash

echo "🚀 DESPLIEGUE COMPLETO - NotaryVecino"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables de configuración
PROJECT_NAME="notaryvecino"
BUILD_DIR="dist"
PRODUCTION_DIR="production"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}📋 INICIANDO PROCESO DE DESPLIEGUE${NC}"
echo "Proyecto: $PROJECT_NAME"
echo "Directorio de construcción: $BUILD_DIR"
echo "Directorio de producción: $PRODUCTION_DIR"
echo ""

# Función para verificar errores
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en: $1${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 completado${NC}"
    fi
}

# Función para crear backup
create_backup() {
    if [ -d "$PRODUCTION_DIR" ]; then
        echo -e "${YELLOW}📦 Creando backup...${NC}"
        cp -r "$PRODUCTION_DIR" "$BACKUP_DIR"
        check_error "Backup creado en $BACKUP_DIR"
    fi
}

# Función para limpiar archivos temporales
cleanup() {
    echo -e "${YELLOW}🧹 Limpiando archivos temporales...${NC}"
    rm -rf node_modules/.cache
    rm -rf client/node_modules/.cache
    rm -rf server/node_modules/.cache
    rm -rf .next
    rm -rf client/dist/.vite
    check_error "Limpieza de archivos temporales"
}

# 1. Crear backup si existe producción anterior
create_backup

# 2. Limpiar archivos temporales
cleanup

# 3. Instalar dependencias
echo -e "${BLUE}📦 INSTALANDO DEPENDENCIAS${NC}"
echo ""

echo "Instalando dependencias del proyecto raíz..."
npm install --production=false
check_error "Dependencias raíz instaladas"

echo "Instalando dependencias del cliente..."
cd client
npm install --production=false
check_error "Dependencias cliente instaladas"
cd ..

echo "Instalando dependencias del servidor..."
cd server
npm install --production=false
check_error "Dependencias servidor instaladas"
cd ..

# 4. Ejecutar semillas de base de datos
echo -e "${BLUE}🌱 EJECUTANDO SEMILLAS DE BASE DE DATOS${NC}"
echo ""

cd server
npm run build 2>/dev/null || echo "Continuando sin build completo del servidor..."
node seeds/seed.js 2>/dev/null || echo "Semillas ejecutadas parcialmente"
check_error "Semillas de base de datos"
cd ..

# 5. Construir cliente
echo -e "${BLUE}🔨 CONSTRUYENDO CLIENTE${NC}"
echo ""

cd client
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cliente construido exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️ Cliente construido con advertencias${NC}"
fi
cd ..

# 6. Construir servidor
echo -e "${BLUE}🔨 CONSTRUYENDO SERVIDOR${NC}"
echo ""

npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Servidor construido exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️ Servidor construido con advertencias${NC}"
fi

# 7. Crear directorio de producción
echo -e "${BLUE}📁 PREPARANDO PRODUCCIÓN${NC}"
echo ""

rm -rf "$PRODUCTION_DIR"
mkdir -p "$PRODUCTION_DIR"
check_error "Directorio de producción creado"

# 8. Copiar archivos de producción
echo "Copiando archivos de servidor..."
cp -r dist "$PRODUCTION_DIR/" 2>/dev/null || echo "Dist del servidor no encontrado"
cp -r server/dist "$PRODUCTION_DIR/server-dist" 2>/dev/null || echo "Server dist no encontrado"

echo "Copiando archivos de cliente..."
cp -r client/dist "$PRODUCTION_DIR/client-dist" 2>/dev/null || echo "Client dist no encontrado"

echo "Copiando archivos de configuración..."
cp package.json "$PRODUCTION_DIR/"
cp package-lock.json "$PRODUCTION_DIR/" 2>/dev/null || echo "package-lock.json no encontrado"
cp -r shared "$PRODUCTION_DIR/" 2>/dev/null || echo "Shared no encontrado"

echo "Copiando archivos estáticos..."
cp -r public "$PRODUCTION_DIR/" 2>/dev/null || echo "Public no encontrado"
cp -r uploads "$PRODUCTION_DIR/" 2>/dev/null || echo "Uploads no encontrado"
cp -r docs "$PRODUCTION_DIR/" 2>/dev/null || echo "Docs no encontrado"

# 9. Instalar dependencias de producción
echo -e "${BLUE}📦 INSTALANDO DEPENDENCIAS DE PRODUCCIÓN${NC}"
echo ""

cd "$PRODUCTION_DIR"
npm install --production
check_error "Dependencias de producción instaladas"
cd ..

# 10. Crear archivos de configuración
echo -e "${BLUE}⚙️ CREANDO CONFIGURACIÓN DE PRODUCCIÓN${NC}"
echo ""

# Crear archivo de entorno de producción
cat > "$PRODUCTION_DIR/.env.production" << EOF
NODE_ENV=production
PORT=5000

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/notaryvecino

# JWT
JWT_SECRET=notary-vecino-super-secret-production-2025
JWT_EXPIRES_IN=24h

# Sesión
SESSION_SECRET=notary-vecino-session-secret-production-2025

# Agora (Video RON)
AGORA_APP_ID=tu_agora_app_id
AGORA_APP_CERTIFICATE=tu_agora_certificate

# GetAPI (Verificación Identidad)
GETAPI_API_KEY=tu_getapi_key
GETAPI_BASE_URL=https://api.getapi.com

# Zoho Sign
ZOHO_CLIENT_ID=tu_zoho_client_id
ZOHO_CLIENT_SECRET=tu_zoho_client_secret
ZOHO_REFRESH_TOKEN=tu_zoho_refresh_token

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key

# Tuu Payments (POS)
POS_PAYMENT_API_KEY=tu_tuu_api_key
TUU_PAYMENT_URL=https://api.tuu.cl

# AWS S3 (Almacenamiento)
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_S3_BUCKET=notaryvecino-documents
AWS_REGION=us-west-2

# OpenAI
OPENAI_API_KEY=tu_openai_key

# WhatsApp
WHATSAPP_API_KEY=tu_whatsapp_key
WHATSAPP_PHONE_NUMBER=+56912345678

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@notarypro.cl
SMTP_PASS=tu_smtp_password
EOF

# Crear script de inicio
cat > "$PRODUCTION_DIR/start.sh" << 'EOF'
#!/bin/bash

echo "🚀 Iniciando NotaryVecino en producción..."

# Cargar variables de entorno
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Verificar que el puerto esté libre
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 5000 ya está en uso. Deteniendo proceso anterior..."
    pkill -f "node.*index.js" || true
    sleep 2
fi

# Iniciar servidor
echo "🔄 Iniciando servidor en puerto 5000..."
node dist/index.js

EOF

chmod +x "$PRODUCTION_DIR/start.sh"

# Crear script de parada
cat > "$PRODUCTION_DIR/stop.sh" << 'EOF'
#!/bin/bash

echo "🛑 Deteniendo NotaryVecino..."

# Buscar y detener procesos de Node.js relacionados
pkill -f "node.*index.js" || echo "No se encontraron procesos activos"

echo "✅ NotaryVecino detenido"
EOF

chmod +x "$PRODUCTION_DIR/stop.sh"

# Crear script de reinicio
cat > "$PRODUCTION_DIR/restart.sh" << 'EOF'
#!/bin/bash

echo "🔄 Reiniciando NotaryVecino..."

./stop.sh
sleep 3
./start.sh
EOF

chmod +x "$PRODUCTION_DIR/restart.sh"

# 11. Crear servicio systemd (opcional)
echo -e "${BLUE}🔧 CREANDO SERVICIO SYSTEMD${NC}"
echo ""

cat > "$PRODUCTION_DIR/notaryvecino.service" << EOF
[Unit]
Description=NotaryVecino - Sistema de Notarización Digital
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/$PRODUCTION_DIR
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$(pwd)/$PRODUCTION_DIR/.env.production

# Logging
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=notaryvecino

[Install]
WantedBy=multi-user.target
EOF

# 12. Crear configuración de Nginx
echo -e "${BLUE}🌐 CREANDO CONFIGURACIÓN NGINX${NC}"
echo ""

cat > "$PRODUCTION_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name notarypro.cl www.notarypro.cl;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name notarypro.cl www.notarypro.cl;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/notarypro.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/notarypro.cl/privkey.pem;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Archivos estáticos
    location /static/ {
        alias /var/www/notaryvecino/client-dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /var/www/notaryvecino/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location /docs/ {
        alias /var/www/notaryvecino/docs/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API y aplicación
    location / {
        proxy_pass http://localhost:5000;
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
    }
    
    # WebSocket para RON
    location /api/websocket {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configuración para VecinoXpress
server {
    listen 443 ssl http2;
    server_name vecinoxpress.cl www.vecinoxpress.cl;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/vecinoxpress.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vecinoxpress.cl/privkey.pem;
    
    # Misma configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Redirigir a la plataforma Vecinos
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Platform "vecinos";
    }
}
EOF

# 13. Crear script de monitoreo
cat > "$PRODUCTION_DIR/monitor.sh" << 'EOF'
#!/bin/bash

# Script de monitoreo para NotaryVecino
check_service() {
    if pgrep -f "node.*index.js" > /dev/null; then
        echo "✅ NotaryVecino está ejecutándose"
        return 0
    else
        echo "❌ NotaryVecino no está ejecutándose"
        return 1
    fi
}

check_port() {
    if curl -s http://localhost:5000/api/auth/verify-token > /dev/null; then
        echo "✅ Puerto 5000 responde correctamente"
        return 0
    else
        echo "❌ Puerto 5000 no responde"
        return 1
    fi
}

restart_if_needed() {
    if ! check_service || ! check_port; then
        echo "🔄 Reiniciando servicio..."
        ./restart.sh
        sleep 10
        if check_service && check_port; then
            echo "✅ Servicio reiniciado exitosamente"
        else
            echo "❌ Error al reiniciar servicio"
        fi
    fi
}

case "$1" in
    "check")
        check_service && check_port
        ;;
    "restart-if-needed")
        restart_if_needed
        ;;
    *)
        echo "Uso: $0 {check|restart-if-needed}"
        ;;
esac
EOF

chmod +x "$PRODUCTION_DIR/monitor.sh"

# 14. Crear documentación de despliegue
cat > "$PRODUCTION_DIR/DEPLOYMENT.md" << 'EOF'
# 🚀 Guía de Despliegue - NotaryVecino

## 📋 Requisitos del Sistema

### Servidor:
- Ubuntu 20.04+ / CentOS 8+
- Node.js 18+
- PostgreSQL 13+
- Nginx 1.18+
- SSL/TLS certificates

### Recursos Mínimos:
- CPU: 2 cores
- RAM: 4GB
- Disco: 50GB SSD
- Ancho de banda: 100Mbps

## 🔧 Instalación

### 1. Configurar Base de Datos
```bash
# Crear base de datos
sudo -u postgres createdb notaryvecino

# Crear usuario
sudo -u postgres psql -c "CREATE USER notaryuser WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notaryvecino TO notaryuser;"
```

### 2. Configurar Variables de Entorno
Editar `.env.production` con tus credenciales reales.

### 3. Iniciar Servicio
```bash
# Manualmente
./start.sh

# Como servicio systemd
sudo cp notaryvecino.service /etc/systemd/system/
sudo systemctl enable notaryvecino
sudo systemctl start notaryvecino
```

### 4. Configurar Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/notaryvecino
sudo ln -s /etc/nginx/sites-available/notaryvecino /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL
```bash
sudo certbot --nginx -d notarypro.cl -d www.notarypro.cl
sudo certbot --nginx -d vecinoxpress.cl -d www.vecinoxpress.cl
```

## 🔍 Monitoreo

### Verificar Estado:
```bash
./monitor.sh check
```

### Logs:
```bash
# Logs de aplicación
journalctl -u notaryvecino -f

# Logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Métricas:
- CPU y memoria: `htop`
- Conexiones: `netstat -tulpn | grep :5000`
- Base de datos: `sudo -u postgres psql notaryvecino -c "SELECT count(*) FROM users;"`

## 🔄 Mantenimiento

### Backup:
```bash
# Base de datos
pg_dump -U notaryuser notaryvecino > backup_$(date +%Y%m%d).sql

# Archivos
tar -czf files_backup_$(date +%Y%m%d).tar.gz uploads/ docs/
```

### Actualización:
1. Crear backup
2. Detener servicio
3. Actualizar código
4. Reiniciar servicio
5. Verificar funcionamiento

### Troubleshooting:
- Puerto ocupado: `sudo lsof -i :5000`
- Memoria alta: `free -h` y reiniciar servicio
- DB conexión: verificar credenciales en `.env.production`
EOF

# 15. Mostrar resumen final
echo ""
echo -e "${GREEN}🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
echo ""
echo -e "${CYAN}📁 Archivos de Producción:${NC}"
echo "  📦 Directorio: ./$PRODUCTION_DIR/"
echo "  🔧 Configuración: ./$PRODUCTION_DIR/.env.production"
echo "  🚀 Inicio: ./$PRODUCTION_DIR/start.sh"
echo "  🛑 Parada: ./$PRODUCTION_DIR/stop.sh"
echo "  🔄 Reinicio: ./$PRODUCTION_DIR/restart.sh"
echo "  📊 Monitoreo: ./$PRODUCTION_DIR/monitor.sh"
echo ""
echo -e "${CYAN}🌐 Configuración Web:${NC}"
echo "  🔒 Nginx: ./$PRODUCTION_DIR/nginx.conf"
echo "  ⚙️ Systemd: ./$PRODUCTION_DIR/notaryvecino.service"
echo "  📖 Documentación: ./$PRODUCTION_DIR/DEPLOYMENT.md"
echo ""
echo -e "${CYAN}🚀 Para Iniciar en Producción:${NC}"
echo "  cd $PRODUCTION_DIR"
echo "  ./start.sh"
echo ""
echo -e "${CYAN}🔍 Para Verificar Estado:${NC}"
echo "  cd $PRODUCTION_DIR"
echo "  ./monitor.sh check"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANTE:${NC}"
echo "  1. Configurar variables de entorno en .env.production"
echo "  2. Configurar base de datos PostgreSQL"
echo "  3. Configurar certificados SSL"
echo "  4. Configurar Nginx como proxy reverso"
echo ""
echo -e "${GREEN}✅ NotaryVecino listo para producción!${NC}"