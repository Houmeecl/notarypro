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
