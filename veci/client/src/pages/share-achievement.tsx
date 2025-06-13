import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentVerificationBadge from "@/components/micro-interactions/DocumentVerificationBadge";
import { Link } from "wouter";

/**
 * Página para ver un logro compartido públicamente
 * 
 * La página recibe un ID de logro en la URL y muestra una versión pública del logro
 * con opciones para compartir en redes sociales
 */
const ShareAchievement = () => {
  const { id } = useParams();
  const achievementId = id ? parseInt(id) : undefined;
  
  // Obtener información del logro
  const {
    data: achievement,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`/api/micro-interactions/public/achievements/${achievementId}`],
    queryFn: async () => {
      if (!achievementId) throw new Error("ID de logro no válido");
      
      // Intentar obtener el logro de prueba mientras desarrollamos
      if (achievementId === 4) {
        return {
          id: 4,
          name: "Verificador Principiante",
          description: "Has verificado tu primer documento",
          level: 1,
          badgeImageUrl: "/api/micro-interactions/badges/4.png",
          unlockedAt: new Date().toISOString(),
          metadata: {
            documentTitle: "Contrato de Prestación de Servicios",
            documentCode: "DC-1234-AB",
            verificationCount: 5
          }
        };
      }
      
      try {
        const response = await apiRequest("GET", `/api/micro-interactions/public/achievements/${achievementId}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error obteniendo el logro:", error);
        throw error;
      }
    },
    enabled: !!achievementId,
    retry: 1,
  });

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Cargando información del logro...</p>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (isError || !achievement) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No se encontró el logro</h1>
          <p className="text-gray-600 mb-6">
            El logro que estás buscando no existe o ha sido eliminado.
          </p>
          <Link href="/verificar-documento">
            <Button className="w-full">Verificar un documento</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Logro de Verificación</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Certificación de autenticidad en la verificación de documentos digitales
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          
          <DocumentVerificationBadge 
            achievement={{
              ...achievement,
              documentTitle: achievement.metadata?.documentTitle || "Documento verificado",
              documentCode: achievement.metadata?.documentCode,
              verificationCount: achievement.metadata?.verificationCount || 1,
            }} 
          />
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 mb-4">
              Los logros de verificación de Cerfidoc garantizan que el documento ha sido verificado
              siguiendo los estándares de seguridad digital establecidos por la Ley 19.799 de Chile.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ir a la página principal
                </Button>
              </Link>
              <Link href="/verificar-documento">
                <Button className="w-full sm:w-auto">
                  Verificar otro documento
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            CerfiDoc © {new Date().getFullYear()} - Verificación de documentos digitales
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareAchievement;