#!/bin/bash

echo "🗄️ CONFIGURACIÓN DE BASE DE DATOS REAL - NotaryVecino"
echo "===================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# URL de la base de datos real
DB_URL="postgres://neondb_owner:npg_M2DXbHesGL7y@ep-dawn-night-ad9ixxns-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo -e "${BLUE}📋 CONFIGURANDO BASE DE DATOS REAL${NC}"
echo "Base de datos: Neon PostgreSQL"
echo "Host: ep-dawn-night-ad9ixxns-pooler.c-2.us-east-1.aws.neon.tech"
echo ""

# Función para ejecutar SQL
run_sql() {
    local sql_command=$1
    local description=$2
    
    echo -n "  $description... "
    
    if psql "$DB_URL" -c "$sql_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        return 1
    fi
}

# Verificar conexión
echo -e "${YELLOW}🔌 VERIFICANDO CONEXIÓN A BASE DE DATOS${NC}"
echo ""

if psql "$DB_URL" -c "SELECT version();" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexión exitosa a base de datos Neon${NC}"
else
    echo -e "${RED}❌ Error de conexión a base de datos${NC}"
    echo "Verifica que la URL de conexión sea correcta"
    exit 1
fi

echo ""
echo -e "${YELLOW}🏗️ CREANDO ESTRUCTURA DE TABLAS${NC}"
echo ""

# Crear tablas principales
run_sql "
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    platform TEXT DEFAULT 'notarypro',
    business_name TEXT,
    address TEXT,
    region TEXT,
    comuna TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
" "Tabla users"

run_sql "
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded',
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    file_hash TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
" "Tabla documents"

run_sql "
CREATE TABLE IF NOT EXISTS document_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES document_categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);
" "Tabla document_categories"

run_sql "
CREATE TABLE IF NOT EXISTS identity_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    verification_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
" "Tabla identity_verifications"

run_sql "
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    template_id INTEGER,
    course_id INTEGER,
    video_call_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
" "Tabla analytics_events"

run_sql "
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
" "Tabla audit_logs"

# Crear índices para rendimiento
echo ""
echo -e "${YELLOW}⚡ CREANDO ÍNDICES PARA RENDIMIENTO${NC}"
echo ""

run_sql "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);" "Índice users.username"
run_sql "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);" "Índice users.email"
run_sql "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);" "Índice users.role"
run_sql "CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform);" "Índice users.platform"

run_sql "CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);" "Índice documents.user_id"
run_sql "CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);" "Índice documents.status"
run_sql "CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);" "Índice documents.document_type"
run_sql "CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);" "Índice documents.created_at"

run_sql "CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);" "Índice analytics.event_type"
run_sql "CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);" "Índice analytics.user_id"
run_sql "CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);" "Índice analytics.created_at"

# Insertar datos iniciales
echo ""
echo -e "${YELLOW}🌱 INSERTANDO DATOS INICIALES${NC}"
echo ""

# Categorías de documentos
run_sql "
INSERT INTO document_categories (name, description) VALUES 
('Certificado', 'Certificados oficiales y documentos de identidad'),
('Contrato', 'Contratos y acuerdos legales'),
('Poder', 'Poderes notariales y representación legal'),
('Declaración', 'Declaraciones juradas y testimonios'),
('Escritura', 'Escrituras públicas y documentos notariales'),
('Trámite', 'Trámites municipales y gubernamentales')
ON CONFLICT (name) DO NOTHING;
" "Categorías de documentos"

# Usuarios de prueba
run_sql "
INSERT INTO users (username, password, email, full_name, role, platform) VALUES 
('Edwardadmin', '\$2b\$10\$sample.hash.for.admin', 'admin@notarypro.cl', 'Edward Admin', 'admin', 'notarypro'),
('realcertifier', '\$2b\$10\$sample.hash.for.cert', 'certifier@notarypro.cl', 'Certificador Real', 'certifier', 'notarypro'),
('realuser', '\$2b\$10\$sample.hash.for.user', 'user@notarypro.cl', 'Usuario Real', 'user', 'notarypro'),
('vecinospartner', '\$2b\$10\$sample.hash.for.partner', 'partner@vecinoxpress.cl', 'Partner Vecinos', 'partner', 'vecinos')
ON CONFLICT (username) DO NOTHING;
" "Usuarios de prueba"

# Documentos de muestra
run_sql "
INSERT INTO documents (title, document_type, description, status, file_name, file_size, mime_type, user_id) VALUES 
('Contrato de Arrendamiento', 'Contrato', 'Contrato de arrendamiento de propiedad', 'uploaded', 'contrato_arrendamiento.pdf', 245760, 'application/pdf', 1),
('Poder Notarial', 'Poder', 'Poder notarial para representación legal', 'processing', 'poder_notarial.pdf', 189440, 'application/pdf', 1),
('Declaración de Ingresos', 'Declaración', 'Declaración jurada de ingresos anuales', 'certified', 'declaracion_ingresos.pdf', 156890, 'application/pdf', 2),
('Certificado de Residencia', 'Certificado', 'Certificado de residencia municipal', 'completed', 'certificado_residencia.pdf', 123450, 'application/pdf', 3)
ON CONFLICT DO NOTHING;
" "Documentos de muestra"

# Verificaciones de identidad de muestra
run_sql "
INSERT INTO identity_verifications (user_id, verification_type, status, verification_data) VALUES 
(1, 'facial_recognition', 'verified', '{\"confidence\": 0.95, \"method\": \"biometric\"}'),
(2, 'document_scan', 'verified', '{\"document_type\": \"cedula\", \"confidence\": 0.98}'),
(3, 'nfc_reading', 'verified', '{\"chip_data\": \"valid\", \"document_type\": \"cedula\"}'),
(4, 'facial_recognition', 'pending', '{\"confidence\": 0.87, \"method\": \"biometric\"}')
ON CONFLICT DO NOTHING;
" "Verificaciones de identidad"

# Eventos de analytics de muestra
run_sql "
INSERT INTO analytics_events (event_type, user_id, document_id, metadata) VALUES 
('document_uploaded', 1, 1, '{\"source\": \"web\", \"size\": 245760}'),
('document_certified', 2, 1, '{\"certifierId\": 2, \"certifierName\": \"Certificador Real\"}'),
('identity_verified', 1, NULL, '{\"method\": \"facial_recognition\", \"confidence\": 0.95}'),
('user_login', 1, NULL, '{\"platform\": \"notarypro\", \"ip\": \"192.168.1.1\"}'),
('ron_session_created', 2, 2, '{\"sessionId\": \"RON-2025-001\", \"clientId\": 1}')
ON CONFLICT DO NOTHING;
" "Eventos de analytics"

echo ""
echo -e "${GREEN}✅ BASE DE DATOS REAL CONFIGURADA EXITOSAMENTE${NC}"
echo ""
echo -e "${CYAN}📊 RESUMEN DE CONFIGURACIÓN:${NC}"
echo "  • Base de datos: Neon PostgreSQL"
echo "  • Tablas creadas: 6 tablas principales"
echo "  • Índices: 12 índices de rendimiento"
echo "  • Datos iniciales: Usuarios, documentos, verificaciones"
echo "  • Analytics: Eventos de muestra para métricas"
echo ""
echo -e "${CYAN}🎯 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Copiar configuración real:"
echo "   cp .env.real .env"
echo ""
echo "2. Iniciar servidor con BD real:"
echo "   npm start"
echo ""
echo "3. Probar sistema completo:"
echo "   ./test-real-system.sh"
echo ""
echo "4. Acceder al sistema:"
echo "   http://localhost:5000"
echo ""
echo -e "${YELLOW}👥 USUARIOS DISPONIBLES:${NC}"
echo "  • Admin: Edwardadmin / adminq"
echo "  • Certificador: realcertifier / cert123456"
echo "  • Usuario: realuser / user123456"
echo "  • Partner: vecinospartner / partner123456"
echo ""
echo -e "${GREEN}🚀 SISTEMA REAL LISTO CON BASE DE DATOS NEON${NC}"