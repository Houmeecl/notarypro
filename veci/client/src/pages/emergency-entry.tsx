import React, { useEffect } from 'react';
import { Link } from 'wouter';

/**
 * Página de entrada de emergencia
 * Esta página permite acceder al sistema cuando hay problemas de autenticación
 */
export default function EmergencyEntryPage() {
  // Logging para depuración
  useEffect(() => {
    console.log("Página de entrada de emergencia cargada correctamente");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-900 to-indigo-700">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-900">Acceso de Emergencia</h1>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-8">
          <h2 className="text-amber-800 text-lg font-semibold mb-2">Modo de compatibilidad</h2>
          <p className="text-amber-700">
            Esta página te permite acceder a las principales funciones del sistema sin necesidad de autenticación
            mientras resolvemos los problemas técnicos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-indigo-900">Verificación</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/verificacion-nfc" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Verificación NFC
                </Link>
              </li>
              <li>
                <Link href="/verificacion-identidad" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Verificación de Identidad
                </Link>
              </li>
              <li>
                <Link href="/verificacion-identidad-demo" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Demo de Verificación
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-indigo-900">POS VecinoXpress</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/partners/webapp-pos-official" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> POS Web Oficial
                </Link>
              </li>
              <li>
                <Link href="/partners/webapp-login" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Login del POS
                </Link>
              </li>
              <li>
                <Link href="/partners/sdk-demo" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Demo SDK
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-indigo-900">Documentos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/document-categories" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Categorías de Documentos
                </Link>
              </li>
              <li>
                <Link href="/documento-ejemplo" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Documento Ejemplo
                </Link>
              </li>
              <li>
                <Link href="/document-selection-simple" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-green-100 px-2 py-1 rounded">
                  <span className="material-icons mr-1 text-sm">✨</span> Selección de Documentos con QR (Recomendado)
                </Link>
              </li>
              <li>
                <Link href="/iniciar-tramite-simple" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-green-100 px-2 py-1 rounded">
                  <span className="material-icons mr-1 text-sm">✨</span> Iniciar Trámite Simple (Recomendado)
                </Link>
              </li>
              <li>
                <Link href="/verificacion-selfie-simple" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-green-100 px-2 py-1 rounded">
                  <span className="material-icons mr-1 text-sm">✨</span> Verificación Simple (Recomendado)
                </Link>
              </li>
              <li>
                <Link href="/iniciar-tramite" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center px-2 py-1 rounded">
                  <span className="material-icons mr-1 text-sm">➡️</span> Iniciar Trámite con QR
                </Link>
              </li>
              <li>
                <Link href="/verificacion-selfie" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center px-2 py-1 rounded">
                  <span className="material-icons mr-1 text-sm">➡️</span> Verificación con Selfie
                </Link>
              </li>
              <li>
                <Link href="/verificar-documento" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Verificar Documento
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-indigo-900">Otros</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/payment-demo" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Demo de Pagos
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Página de Autenticación
                </Link>
              </li>
              <li>
                <Link href="/landing" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                  <span className="material-icons mr-1 text-sm">➡️</span> Landing Page
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            <strong>Nota para el equipo técnico:</strong> Esta página es temporal y debe eliminarse una vez 
            se solucionen los problemas de autenticación. Código de acceso: NFCBYPASS-2025.
          </p>
        </div>
      </div>
    </div>
  );
}