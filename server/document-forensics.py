from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import re
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/api/document-forensics/analyze', methods=['POST'])
def analyze_document():
    """
    Analiza un documento para detectar posibles falsificaciones usando técnicas de visión por computadora.
    Parámetros esperados en JSON:
    - documentImage: string base64 de la imagen del documento
    """
    try:
        data = request.get_json()
        
        if not data or 'documentImage' not in data:
            return jsonify({'error': 'No se proporcionó una imagen de documento válida'}), 400
        
        # Extraer la imagen base64 (eliminar prefijo si existe)
        image_data = data['documentImage']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decodificar la imagen base64
        image_bytes = base64.b64decode(image_data)
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'No se pudo decodificar la imagen'}), 400
        
        # Obtener dimensiones de la imagen
        height, width = image.shape[:2]
        
        # Realizar análisis forense básico (estas son técnicas simuladas)
        analysis_results = perform_document_analysis(image)
        
        # Guardar la imagen procesada para depuración (en entorno de desarrollo)
        if os.environ.get('NODE_ENV') == 'development':
            debug_dir = 'uploads/debug'
            os.makedirs(debug_dir, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            debug_path = f"{debug_dir}/analysis_{timestamp}.jpg"
            cv2.imwrite(debug_path, analysis_results['debug_image'])
        
        # Eliminar la imagen de depuración de la respuesta
        if 'debug_image' in analysis_results:
            del analysis_results['debug_image']
        
        return jsonify({
            'status': 'success',
            'message': 'Análisis forense completado',
            'documentDimensions': {
                'width': width,
                'height': height
            },
            'results': analysis_results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def perform_document_analysis(image):
    """
    Realiza un análisis forense básico de un documento, buscando:
    1. Detección de bordes para verificar la integridad del documento
    2. Buscar patrones MRZ (Machine Readable Zone)
    3. Verificar características de seguridad 
    4. Detectar manipulaciones o alteraciones
    """
    # Hacer una copia de la imagen original para debug
    debug_image = image.copy()
    
    # Convertir a escala de grises
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 1. Detección de bordes para verificar integridad
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Dibujar contornos en la imagen de debug
    cv2.drawContours(debug_image, contours, -1, (0, 255, 0), 2)
    
    # Verificar si hay un contorno principal que represente el documento
    document_detected = False
    mrz_region = None
    
    if contours:
        # Obtener el contorno más grande
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        # Si el área es suficientemente grande, asumimos que es el documento
        if area > (image.shape[0] * image.shape[1] * 0.2):  # Al menos 20% de la imagen
            document_detected = True
            
            # Aproximar el contorno a un rectángulo
            peri = cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, 0.02 * peri, True)
            
            # Si tiene 4 vértices, consideramos que es un documento rectangular
            rectangle_detected = len(approx) == 4
            
            # Marcar los vértices en la imagen de debug
            for point in approx:
                x, y = point[0]
                cv2.circle(debug_image, (x, y), 10, (0, 0, 255), -1)
            
            # Estimar región MRZ (típicamente en la parte inferior del documento)
            if rectangle_detected:
                x, y, w, h = cv2.boundingRect(largest_contour)
                mrz_height = int(h * 0.2)  # Típicamente el 20% inferior
                mrz_region = gray[y + h - mrz_height:y + h, x:x + w]
    
    # 2. Buscar patrones MRZ
    mrz_detected = False
    mrz_confidence = 0
    
    if mrz_region is not None:
        # Aplicar threshold para resaltar texto
        _, mrz_thresh = cv2.threshold(mrz_region, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Buscar patrones de texto que podrían ser MRZ
        # En una implementación real, aquí usaríamos OCR específico para MRZ
        # Para este ejemplo, solo simularemos la detección
        
        # Contar píxeles blancos/negros y su distribución
        white_pixels = cv2.countNonZero(mrz_thresh)
        total_pixels = mrz_thresh.shape[0] * mrz_thresh.shape[1]
        
        if total_pixels > 0:
            white_ratio = white_pixels / total_pixels
            
            # Si el ratio está en un rango típico para texto MRZ (ajustar según sea necesario)
            if 0.2 <= white_ratio <= 0.5:
                mrz_detected = True
                mrz_confidence = min(100, int(white_ratio * 200))  # Valor arbitrario para simulación
    
    # 3 y 4. Simular verificación de características de seguridad y alteraciones
    # En una implementación real, usaríamos técnicas más avanzadas
    
    # Simulamos una verificación UV (esto requeriría una imagen UV real)
    uv_features_detected = document_detected  # Simulación
    
    # Simulamos detección de alteraciones buscando discontinuidades en la imagen
    alterations_detected = False
    alterations_confidence = 0
    
    if document_detected:
        # Aplicar filtro Laplaciano para detectar bordes finos
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        
        # Convertir a valores absolutos y escalar
        laplacian_abs = np.uint8(np.absolute(laplacian))
        
        # Umbralizar para detectar bordes fuertes
        _, thresh = cv2.threshold(laplacian_abs, 50, 255, cv2.THRESH_BINARY)
        
        # Contar píxeles de borde y analizar su distribución
        edge_pixels = cv2.countNonZero(thresh)
        edge_ratio = edge_pixels / (image.shape[0] * image.shape[1])
        
        # Si hay demasiados bordes finos podría indicar manipulación
        # (este umbral necesitaría calibración en casos reales)
        if edge_ratio > 0.1:
            alterations_detected = True
            alterations_confidence = min(100, int(edge_ratio * 500))
    
    # Compilar todos los resultados del análisis
    results = {
        'document_detected': document_detected,
        'mrz_detected': mrz_detected,
        'mrz_confidence': mrz_confidence,
        'uv_features_detected': uv_features_detected,
        'alterations_detected': alterations_detected,
        'alterations_confidence': alterations_confidence,
        'overall_authenticity': calculate_authenticity_score(
            document_detected, 
            mrz_detected, 
            mrz_confidence, 
            uv_features_detected,
            alterations_detected,
            alterations_confidence
        ),
        'debug_image': debug_image
    }
    
    return results

def calculate_authenticity_score(document_detected, mrz_detected, mrz_confidence, 
                                uv_features_detected, alterations_detected, alterations_confidence):
    """
    Calcula una puntuación de autenticidad basada en los diferentes factores analizados
    """
    # Si no se detecta el documento, la autenticidad es cero
    if not document_detected:
        return 0
    
    # Comenzamos con una puntuación base
    score = 50
    
    # Ajustar según la detección de MRZ
    if mrz_detected:
        score += 20
        score += mrz_confidence * 0.2  # Añadir hasta 20 puntos por confianza MRZ
    
    # Ajustar según características UV
    if uv_features_detected:
        score += 15
    
    # Penalizar por alteraciones detectadas
    if alterations_detected:
        penalty = min(50, alterations_confidence * 0.5)  # Penalizar hasta 50 puntos
        score = max(0, score - penalty)
    
    # Normalizar a 100
    score = min(100, score)
    
    return int(score)

if __name__ == '__main__':
    # Ejecutar en modo desarrollo
    app.run(host='0.0.0.0', port=5001, debug=True)