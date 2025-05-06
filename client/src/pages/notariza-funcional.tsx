import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { activarFuncionalidadReal, esFuncionalidadRealActiva } from '@/lib/funcionalidad-real';
import FlujoDeFirmaReal from '@/components/functional/FlujoDeFirmaReal';
import { Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Página integrada de Notarización Digital Funcional
 * 
 * Esta página implementa el flujo completo de notarización digital
 * cumpliendo con la Ley 19.799. Es completamente funcional
 * y no utiliza simulaciones.
 */
export default function NotarizaFuncional() {
  const { toast } = useToast();
  const isFunctionalMode = esFuncionalidadRealActiva();

  useEffect(() => {
    // Activar la funcionalidad real
    activarFuncionalidadReal();

    // Notificar al usuario
    toast({
      title: 'Sistema Operativo en Modo Real',
      description: 'Todas las verificaciones y procesos cumplen con la Ley 19.799',
      duration: 5000,
    });
  }, [toast]);

  return (
    <div className="container mx-auto py-6 px-4">
      <Helmet>
        <title>Notarización Digital Funcional | ValidezLegal</title>
        <meta name="description" content="Sistema de notarización digital con validez legal completa según Ley 19.799" />
      </Helmet>

      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Notarización Digital</h1>
            <p className="text-xl text-gray-600 mt-2">
              Firme documentos con validez legal desde cualquier lugar
            </p>
          </div>

          {isFunctionalMode && (
            <Badge className="bg-green-600 hover:bg-green-700 px-3 py-1.5">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sistema Operativo en Modo Real
            </Badge>
          )}
        </div>
      </header>

      <Alert className="bg-blue-50 border-blue-100 mb-8">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800 font-medium">
          Validez Legal Garantizada
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Todos los documentos firmados a través de este sistema tienen validez legal según la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación.
        </AlertDescription>
      </Alert>

      <Card className="border-blue-100">
        <CardContent className="pt-6">
          <FlujoDeFirmaReal />
        </CardContent>
      </Card>
    </div>
  );
}