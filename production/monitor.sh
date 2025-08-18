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
