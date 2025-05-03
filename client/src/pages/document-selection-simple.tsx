import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from 'qrcode.react';

/**
 * Página de selección de documentos simplificada con generación de QR
 */
export default function DocumentSelectionSimplePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("compraventa");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleGenerateQR = () => {
    setLoading(true);
    
    // Generar un ID único para el trámite
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const qrCodeData = `${window.location.origin}/verificar-simple/${uniqueId}?type=${documentType}`;
    
    // Simular retraso en la generación del QR
    setTimeout(() => {
      setQrData(qrCodeData);
      setQrGenerated(true);
      setLoading(false);
      
      toast({
        title: "QR generado",
        description: "Se ha generado el código QR correctamente",
      });
    }, 1000);
  };

  const handleVerificar = () => {
    navigate("/verificacion-selfie-simple");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-900 text-white p-6">
          <h1 className="text-2xl font-bold">Iniciar Documento</h1>
          <p className="text-indigo-200 mt-1">
            Seleccione el tipo de documento y genere el código QR
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {!qrGenerated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700">
                  Tipo de Documento:
                </label>
                <select
                  id="document-type"
                  name="document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="compraventa">Contrato de Compraventa</option>
                  <option value="trabajo">Contrato de Trabajo</option>
                  <option value="poder">Poder Bancario</option>
                  <option value="mandato">Mandato General</option>
                  <option value="finiquito">Finiquito Laboral</option>
                </select>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Información</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Al generar el código QR, podrá compartirlo con otras personas para que puedan verificar su identidad y firmar el documento.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateQR}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium text-white ${
                  loading 
                    ? "bg-indigo-400" 
                    : "bg-indigo-900 hover:bg-indigo-800"
                }`}
              >
                {loading ? "Generando..." : "Generar Código QR"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-700 font-medium mb-4">Código QR generado</p>
                <div className="flex justify-center">
                  <div className="p-3 bg-white border border-gray-200 rounded-md">
                    <QRCodeSVG value={qrData} size={200} />
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Comparta este código QR con la persona que debe verificar su identidad
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleVerificar}
                  className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800"
                >
                  Verificar mi identidad
                </button>
                <button
                  type="button"
                  onClick={() => setQrGenerated(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}