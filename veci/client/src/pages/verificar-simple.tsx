import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useToast } from "@/hooks/use-toast";

/**
 * Página para verificar un documento (versión simplificada)
 */
export default function VerificarSimplePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/verificar-simple/:id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tramiteInfo, setTramiteInfo] = useState<any>(null);
  
  // Obtener el ID del trámite desde la URL
  const tramiteId = params?.id;

  useEffect(() => {
    if (tramiteId) {
      // Simulamos la carga de información del trámite
      setLoading(true);
      
      setTimeout(() => {
        setLoading(false);
        setTramiteInfo({
          id: tramiteId,
          tipo: 'compraventa',
          nombre: 'Contrato de Compraventa',
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
        });
      }, 1500);
    } else {
      setError("ID de trámite no proporcionado");
      setLoading(false);
    }
  }, [tramiteId]);

  const handleVerificar = () => {
    // En una implementación real, aquí redirigimos a la página de verificación por selfie
    navigate("/verificacion-selfie-simple");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del trámite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Error</h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => navigate("/emergency-entry")}
            className="w-full py-2 px-4 bg-indigo-900 text-white rounded-md hover:bg-indigo-800"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-900 text-white p-6">
          <h1 className="text-2xl font-bold">Verificación de Trámite</h1>
          <p className="text-indigo-200 mt-1">
            Información del trámite #{tramiteId}
          </p>
        </div>
        
        <div className="p-6">
          {tramiteInfo && (
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium">Información del Trámite</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo de documento:</span>
                    <span className="font-medium">{tramiteInfo.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado:</span>
                    <span className="font-medium capitalize">{tramiteInfo.estado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de creación:</span>
                    <span className="font-medium">{new Date(tramiteInfo.fechaCreacion).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Verificación requerida</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Para continuar con este trámite, es necesario verificar su identidad mediante un selfie.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/emergency-entry")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleVerificar}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800"
                >
                  Verificar Identidad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}