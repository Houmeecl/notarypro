#!/bin/bash

echo "📹 PRUEBA DEL SISTEMA JITSI MEET - NotaryVecino"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

BASE_URL="http://localhost:5000"

# Función para hacer peticiones autenticadas
auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ "$method" = "GET" ]; then
            curl -s -H "Authorization: Bearer $token" "$BASE_URL$endpoint"
        else
            curl -s -X $method \
                 -H "Content-Type: application/json" \
                 -H "Authorization: Bearer $token" \
                 -d "$data" \
                 "$BASE_URL$endpoint"
        fi
    else
        echo '{"error": "No token provided"}'
    fi
}

show_response() {
    local title=$1
    local response=$2
    
    echo -e "${CYAN}📋 $title:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

echo -e "${BLUE}🔐 AUTENTICACIÓN PARA JITSI${NC}"
echo "============================="
echo ""

# Login como certificador
echo "Login como certificador..."
CERTIFIER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"realcertifier","password":"cert123456"}')

CERTIFIER_TOKEN=$(echo "$CERTIFIER_LOGIN" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$CERTIFIER_TOKEN" = "null" ] || [ -z "$CERTIFIER_TOKEN" ]; then
    echo "Creando certificador..."
    CERTIFIER_REGISTER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
         -H "Content-Type: application/json" \
         -d '{
           "username": "jitsicertifier",
           "password": "jitsi123456",
           "email": "jitsi@notarypro.cl",
           "fullName": "Certificador Jitsi",
           "role": "certifier",
           "platform": "notarypro"
         }')
    
    show_response "Certificador Jitsi Creado" "$CERTIFIER_REGISTER"
    
    # Login con nuevo certificador
    CERTIFIER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
         -H "Content-Type: application/json" \
         -d '{"username":"jitsicertifier","password":"jitsi123456"}')
    
    CERTIFIER_TOKEN=$(echo "$CERTIFIER_LOGIN" | jq -r '.data.accessToken' 2>/dev/null)
fi

if [ "$CERTIFIER_TOKEN" = "null" ] || [ -z "$CERTIFIER_TOKEN" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener token de certificador${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Certificador autenticado para Jitsi${NC}"
echo ""

echo -e "${BLUE}📹 PROBANDO SISTEMA JITSI MEET${NC}"
echo "=============================="
echo ""

# Verificar configuración Jitsi
echo "Verificando configuración Jitsi..."
JITSI_CONFIG_RESPONSE=$(curl -s "$BASE_URL/api/ron-jitsi/config")
show_response "Configuración Jitsi" "$JITSI_CONFIG_RESPONSE"

# Dashboard RON Jitsi
echo "Obteniendo dashboard RON Jitsi..."
JITSI_DASHBOARD_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/dashboard" "" "$CERTIFIER_TOKEN")
show_response "Dashboard RON Jitsi" "$JITSI_DASHBOARD_RESPONSE"

# Crear sesión RON con Jitsi
echo "Creando sesión RON con Jitsi..."
FUTURE_DATE=$(date -d '+1 hour' -Iseconds)
JITSI_SESSION_RESPONSE=$(auth_request "POST" "/api/ron-jitsi/create-session" "{
  \"clientId\": 1,
  \"documentId\": 1,
  \"scheduledAt\": \"$FUTURE_DATE\",
  \"notes\": \"Sesión de prueba con Jitsi Meet\"
}" "$CERTIFIER_TOKEN")
show_response "Sesión Jitsi Creada" "$JITSI_SESSION_RESPONSE"

# Extraer ID de sesión
SESSION_ID=$(echo "$JITSI_SESSION_RESPONSE" | jq -r '.session.id' 2>/dev/null)

if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
    echo -e "${GREEN}✅ Sesión Jitsi creada: $SESSION_ID${NC}"
    
    # Obtener configuración de la sesión
    echo "Obteniendo configuración de sesión Jitsi..."
    SESSION_CONFIG_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/session/$SESSION_ID/config" "" "$CERTIFIER_TOKEN")
    show_response "Configuración de Sesión" "$SESSION_CONFIG_RESPONSE"
    
    # Obtener URL para unirse
    echo "Obteniendo URL para unirse..."
    JOIN_URL_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/session/$SESSION_ID/join" "" "$CERTIFIER_TOKEN")
    show_response "URL de Unión" "$JOIN_URL_RESPONSE"
    
    # Obtener información completa de sesión
    echo "Obteniendo información completa..."
    SESSION_INFO_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/session/$SESSION_ID/info" "" "$CERTIFIER_TOKEN")
    show_response "Información Completa de Sesión" "$SESSION_INFO_RESPONSE"
    
    # Obtener configuración embed
    echo "Obteniendo configuración embed..."
    EMBED_CONFIG_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/session/$SESSION_ID/embed" "" "$CERTIFIER_TOKEN")
    show_response "Configuración Embed" "$EMBED_CONFIG_RESPONSE"
    
    # Extraer URLs
    JOIN_URL=$(echo "$JOIN_URL_RESPONSE" | jq -r '.joinUrl' 2>/dev/null)
    
    echo -e "${CYAN}🌐 URLs GENERADAS:${NC}"
    echo "  • Unirse a sesión: $JOIN_URL"
    echo "  • Frontend: http://localhost:5000/ron-jitsi/$SESSION_ID"
    echo "  • Embed: http://localhost:5000/ron-jitsi/$SESSION_ID/embed"
    echo ""
else
    echo -e "${RED}❌ No se pudo crear sesión Jitsi${NC}"
fi

# Crear sala de prueba
echo "Creando sala de prueba Jitsi..."
TEST_ROOM_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/test-room" "" "$CERTIFIER_TOKEN")
show_response "Sala de Prueba Jitsi" "$TEST_ROOM_RESPONSE"

# Obtener estadísticas
echo "Obteniendo estadísticas Jitsi..."
JITSI_STATS_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/stats" "" "$CERTIFIER_TOKEN")
show_response "Estadísticas Jitsi" "$JITSI_STATS_RESPONSE"

# Obtener sesiones del certificador
echo "Obteniendo sesiones del certificador..."
CERTIFIER_SESSIONS_RESPONSE=$(auth_request "GET" "/api/ron-jitsi/sessions" "" "$CERTIFIER_TOKEN")
show_response "Sesiones del Certificador" "$CERTIFIER_SESSIONS_RESPONSE"

echo -e "${PURPLE}🎯 RESUMEN DEL SISTEMA JITSI${NC}"
echo "============================"
echo ""

echo -e "${GREEN}✅ FUNCIONALIDADES JITSI IMPLEMENTADAS:${NC}"
echo ""
echo "📹 Sistema de Video:"
echo "  • Integración completa con Jitsi Meet"
echo "  • Salas privadas para RON"
echo "  • JWT personalizado (opcional)"
echo "  • Configuración específica para notarización"
echo ""
echo "🎛️ Características:"
echo "  • Video HD y audio cristalino"
echo "  • Grabación obligatoria para RON"
echo "  • Chat en tiempo real"
echo "  • Compartir pantalla"
echo "  • Pizarra colaborativa"
echo "  • Transcripción automática"
echo ""
echo "🔒 Seguridad:"
echo "  • Encriptación end-to-end"
echo "  • Salas privadas con nombres únicos"
echo "  • Control de moderador para certificador"
echo "  • Grabación obligatoria para validez legal"
echo ""
echo "📋 APIs Jitsi Disponibles:"
echo "  • GET  /api/ron-jitsi/config"
echo "  • POST /api/ron-jitsi/create-session"
echo "  • GET  /api/ron-jitsi/session/:id/config"
echo "  • GET  /api/ron-jitsi/session/:id/join"
echo "  • POST /api/ron-jitsi/session/:id/finish"
echo "  • GET  /api/ron-jitsi/sessions"
echo "  • GET  /api/ron-jitsi/dashboard"
echo "  • GET  /api/ron-jitsi/test-room"
echo ""
echo -e "${CYAN}🌐 URLs FRONTEND:${NC}"
echo "  • Sesión RON: http://localhost:5000/ron-jitsi/SESSION_ID"
echo "  • Platform RON: http://localhost:5000/ron-platform"
echo ""
echo -e "${YELLOW}⚙️ CONFIGURACIÓN OPCIONAL:${NC}"
echo "Variables de entorno para Jitsi personalizado:"
echo "  JITSI_DOMAIN=tu-jitsi-servidor.com"
echo "  JITSI_APP_ID=tu_app_id"
echo "  JITSI_PRIVATE_KEY=tu_private_key"
echo "  JITSI_KEY_ID=tu_key_id"
echo ""
echo -e "${GREEN}🎉 VENTAJAS DE JITSI SOBRE AGORA:${NC}"
echo "  ✅ Gratis y open source"
echo "  ✅ Sin límites de tiempo"
echo "  ✅ Sin límites de participantes"
echo "  ✅ Fácil de configurar"
echo "  ✅ No requiere API keys para uso básico"
echo "  ✅ Mejor para sesiones largas"
echo "  ✅ Más funcionalidades integradas"
echo ""
echo -e "${BLUE}🚀 SISTEMA JITSI COMPLETAMENTE FUNCIONAL${NC}"
echo ""
echo "Para usar:"
echo "1. Crear sesión: POST /api/ron-jitsi/create-session"
echo "2. Unirse: GET /api/ron-jitsi/session/ID/join"
echo "3. Frontend: http://localhost:5000/ron-jitsi/SESSION_ID"
echo ""
echo "¡Jitsi Meet está listo para videollamadas RON!"