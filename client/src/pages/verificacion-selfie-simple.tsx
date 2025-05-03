import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";

/**
 * Página de verificación mediante selfie (versión simplificada)
 */
export default function VerificacionSelfieSimplePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'capture' | 'success'>('initial');

  const handleCapture = () => {
    setLoading(true);
    
    // Simulamos el proceso de captura y verificación
    setTimeout(() => {
      setStep('capture');
      setLoading(false);
    }, 1500);
  };

  const handleVerify = () => {
    setLoading(true);
    
    // Simulamos el proceso de verificación
    setTimeout(() => {
      setStep('success');
      setLoading(false);
      
      // Mostramos un mensaje de éxito
      toast({
        title: "Verificación exitosa",
        description: "Su identidad ha sido verificada correctamente",
      });
    }, 2000);
  };

  const handleComplete = () => {
    navigate("/document-selection");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-900 text-white p-6">
          <h1 className="text-2xl font-bold">Verificación de Identidad</h1>
          <p className="text-indigo-200 mt-1">
            Verificación mediante selfie
          </p>
        </div>
        
        <div className="p-6">
          {step === 'initial' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Instrucciones</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Para verificar su identidad, necesitamos capturar una foto de su rostro. Por favor, asegúrese de:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Tener buena iluminación</li>
                        <li>No usar lentes oscuros o sombrero</li>
                        <li>Mirar directamente a la cámara</li>
                      </ul>
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
                  onClick={handleCapture}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    loading 
                      ? "bg-indigo-400" 
                      : "bg-indigo-900 hover:bg-indigo-800"
                  }`}
                >
                  {loading ? "Procesando..." : "Tomar Selfie"}
                </button>
              </div>
            </div>
          )}
          
          {step === 'capture' && (
            <div className="space-y-6">
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-md overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Selfie capturada correctamente</p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Tomar otra foto
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    loading 
                      ? "bg-indigo-400" 
                      : "bg-indigo-900 hover:bg-indigo-800"
                  }`}
                >
                  {loading ? "Verificando..." : "Verificar Identidad"}
                </button>
              </div>
            </div>
          )}
          
          {step === 'success' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Verificación exitosa</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Su identidad ha sido verificada correctamente. Ahora puede continuar con el proceso.
                </p>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}