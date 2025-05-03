import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import READIDVerifier from '@/components/identity/READIDVerifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  UserCheck, 
  Shield, 
  AlertTriangle, 
  Info, 
  ArrowLeft, 
  Fingerprint 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { checkNFCAvailability } from '@/lib/nfc-reader';
import { Link } from 'wouter';

const VerificacionIdentidadREADID = () => {
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showVerifier, setShowVerifier] = useState(false);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [personalData, setPersonalData] = useState<any>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const checkNFC = async () => {
      try {
        const result = await checkNFCAvailability();
        setNfcAvailable(result.available);
      } catch (error) {
        console.error('Error al verificar NFC:', error);
        setNfcAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Cargar puntos del usuario si está autenticado
    const loadUserPoints = async () => {
      try {
        const response = await apiRequest('GET', '/api/micro-interactions/user/points');
        if (response.ok) {
          const data = await response.json();
          setTotalPoints(data.totalPoints || 0);
        }
      } catch (error) {
        console.error('Error al cargar puntos:', error);
      }
    };

    checkNFC();
    loadUserPoints();
  }, []);

  const handleStartVerification = () => {
    setShowVerifier(true);
  };

  const handleVerificationSuccess = (data: any) => {
    setPersonalData(data);
    setIdentityVerified(true);
    setShowVerifier(false);
    
    // Registrar los puntos ganados en el sistema de gamificación
    const puntos = 150; // Puntos por verificar identidad con READID
    
    // Llamar al endpoint para registrar la interacción
    apiRequest("POST", "/api/micro-interactions/record", {
      type: "readid_verification",
      points: puntos,
      metadata: { description: "Verificación avanzada de identidad con READID" }
    }).catch(err => console.error("Error al registrar micro-interacción:", err));
    
    // Actualizar el total de puntos
    setTotalPoints(prev => prev + puntos);
    
    toast({
      title: "¡Verificación exitosa! +150 puntos",
      description: "Se ha verificado su identidad exitosamente con READID",
      variant: "default",
    });
  };

  const handleVerificationError = (error: Error) => {
    toast({
      title: "Error de verificación",
      description: error.message,
      variant: "destructive",
    });
    setShowVerifier(false);
  };

  const handleVerificationCancel = () => {
    setShowVerifier(false);
    toast({
      title: "Verificación cancelada",
      description: "Ha cancelado el proceso de verificación",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-blue-600">Comprobando compatibilidad NFC...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Verificación de identidad avanzada READID</h1>
            <p className="text-gray-500">
              Utilice su cédula de identidad chilena con chip NFC para verificar su identidad de forma segura y rápida.
            </p>
          </div>
          
          {/* Estado de verificación */}
          {identityVerified ? (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-800">Identidad verificada</CardTitle>
                    <CardDescription className="text-green-600">
                      Se ha verificado su identidad exitosamente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre completo:</span>
                    <span className="font-medium">{personalData?.nombres} {personalData?.apellidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">RUT:</span>
                    <span className="font-medium">{personalData?.rut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de nacimiento:</span>
                    <span className="font-medium">{personalData?.fechaNacimiento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nacionalidad:</span>
                    <span className="font-medium">{personalData?.nacionalidad}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-green-100/50 justify-between">
                <div className="text-xs text-green-700 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificado con estándar READID
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  +150 puntos
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Verificación de identidad</CardTitle>
                <CardDescription>
                  Verificación mediante lectura NFC de cédula chilena.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nfcAvailable ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">NFC disponible</h3>
                        <p className="text-sm text-gray-500">
                          Su dispositivo es compatible con lectura NFC
                        </p>
                      </div>
                    </div>
                    
                    {showVerifier ? (
                      <READIDVerifier 
                        onSuccess={handleVerificationSuccess}
                        onError={handleVerificationError}
                        onCancel={handleVerificationCancel}
                      />
                    ) : (
                      <Button 
                        onClick={handleStartVerification} 
                        className="w-full mt-4"
                      >
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Iniciar verificación READID
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">NFC no disponible</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Su dispositivo no es compatible con NFC o está desactivado.
                      Esta verificación requiere un dispositivo con NFC habilitado.
                    </p>
                    <Link href="/verificacion-identidad-movil">
                      <Button variant="outline">
                        Usar método alternativo
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Historial de puntos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sus puntos de verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-gray-500 text-sm mb-1">Puntos acumulados</p>
                <h3 className="text-3xl font-bold">{totalPoints}</h3>
                {identityVerified && (
                  <div className="mt-3 text-xs text-green-600 bg-green-50 rounded-full px-3 py-1 inline-block">
                    +150 puntos por verificación READID
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Panel lateral de información */}
        <div className="md:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acerca de READID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-blue-600" />
                  Verificación segura
                </h3>
                <p className="text-sm text-gray-500">
                  READID utiliza tecnología NFC para leer el chip incorporado en su cédula de identidad de forma segura.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Info className="h-4 w-4 mr-1 text-blue-600" />
                  Cómo funciona
                </h3>
                <p className="text-sm text-gray-500">
                  Al acercar su cédula, el chip es leído y verificado digitalmente para confirmar su identidad de forma segura.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Fingerprint className="h-4 w-4 mr-1 text-blue-600" />
                  Ventajas
                </h3>
                <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                  <li>Verificación rápida en segundos</li>
                  <li>Mayor seguridad que métodos tradicionales</li>
                  <li>Proceso completamente digital</li>
                  <li>Verificación con estándares legales</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerificacionIdentidadREADID;