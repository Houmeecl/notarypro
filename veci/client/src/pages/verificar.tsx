import React, { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  Camera,
  CreditCard,
  FileText,
  Fingerprint
} from "lucide-react";

/**
 * Página para verificar un documento usando un código QR escaneado
 * Esta página permite verificar la identidad de una persona y asociarla
 * a un documento específico
 */
export default function VerificarPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/verificar/:id");
  const [loading, setLoading] = useState(false);
  const [verificationType, setVerificationType] = useState<string>("selfie");
  const [tramiteInfo, setTramiteInfo] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'not_started' | 'in_progress' | 'failed' | 'completed'>('not_started');
  
  // Obtener el ID del trámite desde la URL
  const tramiteId = params?.id;

  // Cargar la información del trámite cuando se monta el componente
  useEffect(() => {
    if (tramiteId) {
      fetchTramiteInfo(tramiteId);
    }
  }, [tramiteId]);

  // Simular la carga de información del trámite desde el servidor
  const fetchTramiteInfo = async (id: string) => {
    setLoading(true);
    
    try {
      // En una implementación real, esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos de ejemplo
      setTramiteInfo({
        id: id,
        tipo: 'compraventa',
        nombre: 'Contrato de Compraventa',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
      });
      
      setVerificationStatus('not_started');
    } catch (error) {
      console.error("Error al cargar información del trámite:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del trámite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar la verificación
  const startVerification = () => {
    setVerificationStatus('in_progress');
    
    // Redirigir a la página de verificación según el tipo seleccionado
    if (verificationType === 'selfie') {
      navigate('/verificacion-selfie');
    } else if (verificationType === 'nfc') {
      navigate('/verificacion-nfc');
    } else {
      // Default to selfie verification if unknown type
      navigate('/verificacion-selfie');
    }
  };

  // Renderizar la información del trámite
  const renderTramiteInfo = () => {
    if (!tramiteInfo) return null;
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Información del trámite</h3>
          <dl className="mt-2 text-sm">
            <div className="grid grid-cols-2 gap-1 py-1">
              <dt className="text-gray-500">ID del trámite:</dt>
              <dd className="text-indigo-700 font-mono">{tramiteInfo.id}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1 py-1">
              <dt className="text-gray-500">Tipo de documento:</dt>
              <dd className="text-gray-900">{tramiteInfo.nombre}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1 py-1">
              <dt className="text-gray-500">Estado:</dt>
              <dd className="text-gray-900 capitalize">{tramiteInfo.estado}</dd>
            </div>
            <div className="grid grid-cols-2 gap-1 py-1">
              <dt className="text-gray-500">Fecha de creación:</dt>
              <dd className="text-gray-900">{new Date(tramiteInfo.fechaCreacion).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-indigo-900 text-white rounded-t-lg">
          <CardTitle className="text-xl">Verificación de Identidad</CardTitle>
          <CardDescription className="text-gray-200">
            {tramiteId ? `Verificación para el trámite: ${tramiteId}` : 'Verificación de identidad'}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Cargando información del trámite...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderTramiteInfo()}

              <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Verificación requerida</AlertTitle>
                <AlertDescription>
                  Para continuar con este trámite, necesitamos verificar su identidad.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Seleccione un método de verificación:</h3>
                
                <Tabs defaultValue="selfie" onValueChange={setVerificationType}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="selfie">Verificación por Selfie</TabsTrigger>
                    <TabsTrigger value="nfc">Verificación por NFC</TabsTrigger>
                  </TabsList>
                  <TabsContent value="selfie" className="p-4 border rounded-lg mt-2">
                    <div className="flex items-start space-x-4">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Camera className="h-6 w-6 text-indigo-700" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Verificación por Selfie</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Capturaremos una foto de su rostro para verificar su identidad.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="nfc" className="p-4 border rounded-lg mt-2">
                    <div className="flex items-start space-x-4">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <CreditCard className="h-6 w-6 text-indigo-700" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Verificación por NFC</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Leeremos el chip de su documento de identidad mediante NFC.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h4 className="font-medium text-gray-900 mb-2">Pasos de verificación:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 mr-3">
                      1
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Verificar su identidad con el método seleccionado
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 mr-3">
                      2
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Capturar una foto de su documento de identidad
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 mr-3">
                      3
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Firmar electrónicamente su documento
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Cancelar
          </Button>
          
          {tramiteInfo && (
            <Button 
              onClick={startVerification}
              disabled={loading}
              className="bg-indigo-900 hover:bg-indigo-800"
            >
              Iniciar Verificación
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}