
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Servicio de análisis forense de documentos
Este script implementa un servidor Flask para el análisis forense de documentos
utilizando técnicas de visión por computadora.
"""

import base64
import io
import json
import random
import re
import signal
import sys
from datetime import datetime
from flask import Flask, request, jsonify
import numpy as np
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Manejar señales de terminación para salir correctamente
def signal_handler(sig, frame):
    logger.info("Recibida señal de terminación, cerrando servidor Flask...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@app.route('/', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud para el servicio"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@app.route('/api/document-forensics/analyze', methods=['POST'])
def analyze_document():
    """
    Analiza un documento para detectar posibles falsificaciones usando técnicas de visión por computadora.
    Parámetros esperados en JSON:
    - documentImage: string base64 de la imagen del documento
    """
    try:
        data = request.json

        if not data or 'documentImage' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Se requiere una imagen de documento en formato base64'
            }), 400

        # Extraer la imagen base64
        base64_img = data['documentImage']

        # Si la imagen incluye el prefijo data:image, lo removemos
        if 'base64,' in base64_img:
            base64_img = base64_img.split('base64,')[1]

        # En una implementación real, aquí convertiríamos la imagen a un array numpy
        # y aplicaríamos los algoritmos de análisis forense
        # Para esta demo, simulamos el proceso

        # Simulamos un análisis forense básico
        try:
            # Analizar la imagen (en un escenario real)
            # image = Image.open(io.BytesIO(base64.b64decode(base64_img)))
            # image_np = np.array(image)

            # Para demo, generar datos simulados basados en características de la imagen

            # 1. Verificar el tamaño de la imagen (por el tamaño del string base64)
            img_size = len(base64_img)
            img_quality_factor = min(1.0, img_size / 100000) # Factor de calidad basado en tamaño

            # 2. Verificar si la imagen parece ser un documento (simulado)
            # En una implementación real, usaríamos CV para detectar bordes, formas, etc.
            has_document = True

            # 3. Detectar zona MRZ (simulado)
            # En una implementación real, usaríamos OCR específico para MRZ
            mrz_detected = random.random() < 0.85  # 85% probabilidad en demo
            mrz_confidence = random.uniform(70, 95) if mrz_detected else random.uniform(10, 30)

            # 4. Detectar características UV (simulado)
            # En una implementación real, analizaríamos patrones específicos de seguridad
            uv_features = random.random() < 0.75  # 75% probabilidad en demo

            # 5. Detectar alteraciones (simulado)
            # En una implementación real, buscaríamos inconsistencias en el documento
            alterations = random.random() < 0.15  # 15% probabilidad de detectar alteraciones
            alterations_confidence = random.uniform(60, 90) if alterations else random.uniform(5, 25)

            # Calcular puntuación general de autenticidad
            authenticity = calculate_authenticity_score(
                has_document, mrz_detected, mrz_confidence,
                uv_features, alterations, alterations_confidence
            )

            result = {
                'status': 'success',
                'message': 'Análisis forense completado',
                'documentDimensions': {
                    'width': 1000,  # Simulado
                    'height': 650   # Simulado
                },
                'results': {
                    'document_detected': has_document,
                    'mrz_detected': mrz_detected,
                    'mrz_confidence': round(mrz_confidence, 1),
                    'uv_features_detected': uv_features,
                    'alterations_detected': alterations,
                    'alterations_confidence': round(alterations_confidence, 1),
                    'overall_authenticity': round(authenticity)
                }
            }

            return jsonify(result)

        except Exception as e:
            logger.error(f"Error procesando imagen: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error procesando imagen: {str(e)}'
            }), 500

    except Exception as e:
        logger.error(f"Error general: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error en el servidor: {str(e)}'
        }), 500

def perform_document_analysis(image):
    """
    Realiza un análisis forense básico de un documento, buscando:
    1. Detección de bordes para verificar la integridad del documento
    2. Buscar patrones MRZ (Machine Readable Zone)
    3. Verificar características de seguridad 
    4. Detectar manipulaciones o alteraciones
    """
    # Este método sería implementado con OpenCV en un entorno real
    # Para la demo, usamos valores simulados

    # Documentación de qué haríamos en un entorno real:
    # 1. Conversión a escala de grises: cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 2. Detección de bordes: cv2.Canny(gray, 50, 150)
    # 3. Detección de contornos: cv2.findContours()
    # 4. Análisis de patrones: Gabor filters, HOG, etc.
    # 5. OCR para zona MRZ: pytesseract o bibliotecas específicas MRZ
    # 6. Verificación de consistencia: histogramas, análisis de zonas

    return {
        'document_detected': True,
        'mrz_detected': True,
        'mrz_confidence': 87.5,
        'uv_features_detected': True,
        'alterations_detected': False,
        'alterations_confidence': 12.3,
        'overall_authenticity': 92
    }

def calculate_authenticity_score(document_detected, mrz_detected, mrz_confidence, 
                                uv_features_detected, alterations_detected, alterations_confidence):
    """
    Calcula una puntuación de autenticidad basada en los diferentes factores analizados
    """
    score = 0

    # Factor base: detección de documento
    if document_detected:
        score += 20
    else:
        return 10  # Si no hay documento, puntuación mínima

    # Factor de MRZ
    if mrz_detected:
        score += 25 * (mrz_confidence / 100)

    # Factor de características UV
    if uv_features_detected:
        score += 25

    # Factor de alteraciones (penalización)
    if alterations_detected:
        penalty = 30 * (alterations_confidence / 100)
        score = max(10, score - penalty)
    else:
        score += 10

    # Añadir un pequeño factor aleatorio para simular variabilidad
    score += random.uniform(-3, 3)

    # Limitar a rango 0-100
    return max(0, min(100, score))

if __name__ == '__main__':
    try:
        logger.info("Iniciando servidor Flask para análisis forense de documentos...")
        # Asegurarse de escuchar en 0.0.0.0 para que sea accesible desde el exterior
        # y asegurarse de usar un puerto diferente al 5000 para evitar conflictos
        app.run(host='0.0.0.0', port=5001, threaded=True)
    except KeyboardInterrupt:
        logger.info("Servidor detenido manualmente")
        sys.exit(0)
