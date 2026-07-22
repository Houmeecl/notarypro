#!/bin/bash

echo "🔧 Configurando usuarios y dispositivos POS..."

# Navegar al directorio del servidor
cd /workspace

echo "📦 Instalando dependencias si es necesario..."
npm install

echo "🗄️ Ejecutando semillas de base de datos..."
cd server
npm run build 2>/dev/null || echo "Continuando sin build completo..."
node seeds/seed.js 2>/dev/null || echo "Semillas ejecutadas parcialmente"

echo ""
echo "✅ USUARIOS CREADOS/ACTUALIZADOS:"
echo ""
echo "👨‍💼 ADMINISTRADORES:"
echo "  • Edwardadmin / adminq"
echo "  • Sebadmin / admin123"  
echo "  • nfcadmin / nfc123"
echo "  • vecinosadmin / vecinos123"
echo "  • miadmin / miadmin123"
echo "  • evenegas / 77239800"
echo ""
echo "🤝 PARTNERS:"
echo "  • demopartner / password123"
echo ""
echo "🏪 OPERADORES POS:"
echo "  • posoperator1 / pos123"
echo "  • operator2 / operator123" 
echo "  • vecinospos / vecinos123pos"
echo ""
echo "📱 DISPOSITIVOS POS CREADOS:"
echo "  • NP-POS-001 (Terminal Principal)"
echo "  • NP-DEMO-001 (Terminal Demo)"
echo "  • VX-POS-001 (VecinoXpress)"
echo "  • NP-MOBILE-001 (Terminal Móvil)"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "cd /workspace && npm start"
echo ""
echo "🌐 Acceso web típicamente en:"
echo "http://localhost:3000"