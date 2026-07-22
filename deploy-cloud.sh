#!/bin/bash

echo "☁️ DESPLIEGUE EN LA NUBE - NotaryVecino"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🌐 OPCIONES DE DESPLIEGUE EN LA NUBE${NC}"
echo ""

echo "Selecciona tu plataforma de despliegue:"
echo "1) Heroku"
echo "2) DigitalOcean"
echo "3) AWS EC2"
echo "4) Google Cloud Platform"
echo "5) Azure"
echo "6) Railway"
echo "7) Render"
echo "8) Vercel + PlanetScale"
echo ""

read -p "Ingresa tu opción (1-8): " OPTION

case $OPTION in
    1)
        echo -e "${BLUE}🔷 CONFIGURANDO DESPLIEGUE PARA HEROKU${NC}"
        
        # Crear Procfile
        cat > Procfile << 'EOF'
web: node dist/index.js
worker: node server/services/background-worker.js
EOF
        
        # Crear heroku.yml
        cat > heroku.yml << 'EOF'
build:
  docker:
    web: Dockerfile
run:
  web: node dist/index.js
EOF
        
        echo "📋 Comandos para Heroku:"
        echo "  heroku create notaryvecino-app"
        echo "  heroku addons:create heroku-postgresql:hobby-dev"
        echo "  heroku config:set NODE_ENV=production"
        echo "  heroku config:set JWT_SECRET=tu_jwt_secret"
        echo "  git push heroku main"
        ;;
        
    2)
        echo -e "${BLUE}🌊 CONFIGURANDO DESPLIEGUE PARA DIGITALOCEAN${NC}"
        
        # Crear App Platform spec
        cat > .do/app.yaml << 'EOF'
name: notaryvecino
services:
- name: web
  source_dir: /
  github:
    repo: tu-usuario/notaryvecino
    branch: main
  run_command: node dist/index.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: professional-xs
  http_port: 5000
  env:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

databases:
- name: db
  engine: PG
  version: "15"
  size: db-s-dev-database
EOF
        
        echo "📋 Comandos para DigitalOcean:"
        echo "  doctl apps create --spec .do/app.yaml"
        echo "  doctl apps list"
        ;;
        
    3)
        echo -e "${BLUE}☁️ CONFIGURANDO DESPLIEGUE PARA AWS EC2${NC}"
        
        # Crear script de instalación EC2
        cat > aws-deploy.sh << 'EOF'
#!/bin/bash

# Script para instalar NotaryVecino en EC2
sudo yum update -y
sudo yum install -y git nodejs npm postgresql nginx

# Clonar repositorio
git clone https://github.com/tu-usuario/notaryvecino.git
cd notaryvecino

# Instalar dependencias
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Construir aplicación
npm run build
cd client && npm run build && cd ..

# Configurar base de datos
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE DATABASE notaryvecino;"
sudo -u postgres psql -c "CREATE USER notaryuser WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notaryvecino TO notaryuser;"

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/conf.d/notaryvecino.conf
sudo systemctl enable nginx
sudo systemctl start nginx

# Instalar PM2 para gestión de procesos
npm install -g pm2

# Configurar PM2
pm2 start dist/index.js --name "notaryvecino"
pm2 startup
pm2 save

echo "✅ NotaryVecino instalado en EC2"
EOF
        
        chmod +x aws-deploy.sh
        
        echo "📋 Pasos para AWS EC2:"
        echo "  1. Crear instancia EC2 (t3.medium recomendado)"
        echo "  2. Configurar Security Groups (puertos 80, 443, 22)"
        echo "  3. Subir aws-deploy.sh a la instancia"
        echo "  4. Ejecutar: chmod +x aws-deploy.sh && ./aws-deploy.sh"
        ;;
        
    4)
        echo -e "${BLUE}🌐 CONFIGURANDO DESPLIEGUE PARA GOOGLE CLOUD${NC}"
        
        # Crear app.yaml para App Engine
        cat > app.yaml << 'EOF'
runtime: nodejs18

env_variables:
  NODE_ENV: production
  JWT_SECRET: tu_jwt_secret
  DATABASE_URL: postgresql://user:pass@host/notaryvecino

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 2
  disk_size_gb: 10

handlers:
- url: /static
  static_dir: client-dist
  
- url: /uploads
  static_dir: uploads
  
- url: /.*
  script: auto
EOF
        
        echo "📋 Comandos para Google Cloud:"
        echo "  gcloud app create"
        echo "  gcloud sql instances create notaryvecino-db --database-version=POSTGRES_15"
        echo "  gcloud app deploy"
        ;;
        
    5)
        echo -e "${BLUE}⚡ CONFIGURANDO DESPLIEGUE PARA AZURE${NC}"
        
        # Crear azure-pipelines.yml
        cat > azure-pipelines.yml << 'EOF'
trigger:
- main

pool:
  vmImage: ubuntu-latest

variables:
  buildConfiguration: 'production'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm install
    cd client && npm install && cd ..
    cd server && npm install && cd ..
  displayName: 'Install dependencies'

- script: |
    npm run build
    cd client && npm run build && cd ..
  displayName: 'Build application'

- task: AzureWebApp@1
  inputs:
    azureSubscription: 'tu-suscripcion'
    appType: 'webAppLinux'
    appName: 'notaryvecino'
    package: '$(System.DefaultWorkingDirectory)'
EOF
        
        echo "📋 Pasos para Azure:"
        echo "  1. Crear Web App en Azure Portal"
        echo "  2. Configurar Azure Database for PostgreSQL"
        echo "  3. Configurar variables de entorno"
        echo "  4. Configurar pipeline de CI/CD"
        ;;
        
    6)
        echo -e "${BLUE}🚂 CONFIGURANDO DESPLIEGUE PARA RAILWAY${NC}"
        
        # Crear railway.json
        cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/api/auth/verify-token",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
        
        echo "📋 Comandos para Railway:"
        echo "  npm install -g @railway/cli"
        echo "  railway login"
        echo "  railway init"
        echo "  railway add postgresql"
        echo "  railway deploy"
        ;;
        
    7)
        echo -e "${BLUE}🎨 CONFIGURANDO DESPLIEGUE PARA RENDER${NC}"
        
        # Crear render.yaml
        cat > render.yaml << 'EOF'
services:
- type: web
  name: notaryvecino
  env: node
  buildCommand: npm install && npm run build && cd client && npm install && npm run build
  startCommand: node dist/index.js
  envVars:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    fromDatabase:
      name: notaryvecino-db
      property: connectionString

databases:
- name: notaryvecino-db
  databaseName: notaryvecino
  user: notaryuser
EOF
        
        echo "📋 Pasos para Render:"
        echo "  1. Conectar repositorio en Render Dashboard"
        echo "  2. Configurar variables de entorno"
        echo "  3. Deploy automático desde Git"
        ;;
        
    8)
        echo -e "${BLUE}▲ CONFIGURANDO DESPLIEGUE PARA VERCEL${NC}"
        
        # Crear vercel.json
        cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
        
        echo "📋 Comandos para Vercel:"
        echo "  npm install -g vercel"
        echo "  vercel login"
        echo "  vercel"
        echo "  # Configurar PlanetScale para base de datos"
        ;;
        
    *)
        echo -e "${RED}❌ Opción no válida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ CONFIGURACIÓN DE DESPLIEGUE CREADA${NC}"
echo ""
echo -e "${CYAN}📁 Archivos Generados:${NC}"
echo "  • Scripts de despliegue específicos para la plataforma"
echo "  • Archivos de configuración"
echo "  • Documentación de despliegue"
echo ""
echo -e "${YELLOW}⚠️ SIGUIENTES PASOS:${NC}"
echo "  1. Configurar credenciales de la plataforma elegida"
echo "  2. Configurar variables de entorno"
echo "  3. Configurar base de datos"
echo "  4. Ejecutar despliegue"
echo ""
echo -e "${GREEN}🚀 Listo para desplegar en la nube!${NC}"