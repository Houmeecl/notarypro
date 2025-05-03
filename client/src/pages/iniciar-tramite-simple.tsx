import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";

/**
 * Página para iniciar un nuevo trámite (versión simplificada)
 */
export default function IniciarTramiteSimplePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("compraventa");
  const [tramiteId, setTramiteId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // Generar un ID único para el trámite
      const uniqueId = Math.random().toString(36).substring(2, 15);
      
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTramiteId(uniqueId);
      
      toast({
        title: "Éxito",
        description: `Trámite #${uniqueId} iniciado correctamente`,
      });
      
      // Redirigir a la página de verificación
      navigate(`/verificar/${uniqueId}`);
    } catch (error) {
      console.error("Error al iniciar trámite:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al iniciar el trámite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-900 text-white p-6">
          <h1 className="text-2xl font-bold">Iniciar Trámite</h1>
          <p className="text-indigo-200 mt-1">
            Seleccione el tipo de documento que desea tramitar
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              required
            >
              <option value="compraventa">Contrato de Compraventa</option>
              <option value="trabajo">Contrato de Trabajo</option>
              <option value="poder">Poder Bancario</option>
              <option value="mandato">Mandato General</option>
              <option value="finiquito">Finiquito Laboral</option>
            </select>
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
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                loading 
                  ? "bg-indigo-400" 
                  : "bg-indigo-900 hover:bg-indigo-800"
              }`}
            >
              {loading ? "Procesando..." : "Iniciar Trámite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}