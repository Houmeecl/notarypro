import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Shield,
  FileText,
  Info,
  Terminal,
  Download,
  Share2,
  Lock,
  Fingerprint,
  HelpCircle
} from 'lucide-react';

import InverIDVerifier from '@/components/identity/InverIDVerifier';
import { CedulaChilenaData } from '@/lib/nfc-reader';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const VerificacionInverID = () => {
  const { toast } = useToast();
  const [sessionId] = useState<string>(uuidv4());
  const [step, setStep] = useState<'intro' | 'verify' | 'success'>('intro');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showTechnicalInfo, setShowTechnicalInfo] = useState<boolean>(false);
  
  // Manejar finalización exitosa de la verificación
  const handleSuccess = (data: CedulaChilenaData) => {
    console.log("Verificación NFC exitosa:", data);
    // No mostrar confeti aún, esperaremos a la finalización completa
  };
  
  // Manejar error en la verificación
  const handleError = (error: string) => {
    console.error("Error en verificación:", error);
    toast({
      title: "Error en verificación",
      description: error,
      variant: "destructive",
    });
  };
  
  // Manejar finalización completa del proceso
  const handleComplete = (success: boolean, data: any) => {
    if (success) {
      setVerificationData(data);
      setStep('success');
      setShowConfetti(true);
      
      // Registrar verificación en el sistema (opcional)
      apiRequest("POST", "/api/identity/record-verification", {
        sessionId,
        type: "inverid_verification",
        success: true,
        data: {
          rut: data.cedula?.rut,
          documentVerified: data.documentVerified,
          biometricVerified: data.biometricVerified,
          officialValidation: data.officialValidation
        }
      }).catch(err => console.error("Error al registrar verificación:", err));
      
      // Mostrar notificación de éxito
      toast({
        title: "Verificación completada",
        description: "La identidad ha sido verificada con éxito.",
        variant: "default",
      });
      
      // Detener confeti después de un tiempo
      setTimeout(() => setShowConfetti(false), 6000);
    } else {
      toast({
        title: "Verificación fallida",
        description: "No se pudo completar la verificación. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };
  
  // Iniciar proceso de verificación
  const startVerification = () => {
    setStep('verify');
  };
  
  // Reiniciar proceso
  const restartProcess = () => {
    setStep('intro');
    setVerificationData(null);
    setShowConfetti(false);
  };
  
  // Generar certificado de verificación
  const generateCertificate = () => {
    toast({
      title: "Certificado generado",
      description: "El certificado de verificación ha sido generado y descargado.",
      variant: "default",
    });
    
    // Aquí iría la lógica para generar un PDF o similar
  };
  
  // Compartir resultado
  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Verificación de identidad InverID',
        text: 'He verificado mi identidad con InverID',
        url: window.location.href,
      })
      .catch((error) => console.log('Error compartiendo:', error));
    } else {
      toast({
        title: "Función no disponible",
        description: "Su navegador no soporta la función de compartir.",
        variant: "destructive",
      });
    }
  };
  
  // Renderizar pantalla de introducción
  const renderIntro = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-[#2d219b]/10 rounded-full mb-2">
          <Shield className="h-10 w-10 text-[#2d219b]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Sistema de Verificación InverID
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Verificación de identidad avanzada mediante tecnología NFC y análisis forense
        </p>
      </div>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2">
          <CardTitle>¿Cómo funciona?</CardTitle>
          <CardDescription>
            Sistema de verificación de identidad de nivel 3 (máxima seguridad)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#2d219b]/10 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-[#2d219b]" />
                </div>
                <div>
                  <h3 className="font-medium">Análisis de documento</h3>
                  <p className="text-sm text-gray-600">
                    Verificación de elementos de seguridad y estructura del documento mediante análisis forense digital.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#2d219b]/10 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Fingerprint className="h-4 w-4 text-[#2d219b]" />
                </div>
                <div>
                  <h3 className="font-medium">Lectura NFC</h3>
                  <p className="text-sm text-gray-600">
                    Extracción y verificación de datos almacenados en el chip NFC de la cédula de identidad.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#2d219b]/10 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-[#2d219b]" />
                </div>
                <div>
                  <h3 className="font-medium">Verificación biométrica</h3>
                  <p className="text-sm text-gray-600">
                    Comparación facial y prueba de vida para confirmar la identidad del portador del documento.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#2d219b]/10 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="h-4 w-4 text-[#2d219b]" />
                </div>
                <div>
                  <h3 className="font-medium">Validación oficial</h3>
                  <p className="text-sm text-gray-600">
                    Contraste con bases de datos oficiales para confirmar la validez y vigencia del documento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button 
            size="lg" 
            className="bg-[#2d219b] hover:bg-[#221a82] gap-2"
            onClick={startVerification}
          >
            <Shield className="h-5 w-5" />
            Iniciar verificación
          </Button>
        </CardFooter>
      </Card>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Información importante</h3>
            <p className="text-sm text-yellow-700">
              Para completar esta verificación, necesitará:
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside mt-1 ml-1">
              <li>Su cédula de identidad chilena con chip NFC</li>
              <li>Un dispositivo con cámara y soporte para NFC</li>
              <li>Buena iluminación para el reconocimiento facial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar pantalla de verificación
  const renderVerification = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Verificación de identidad InverID
        </h2>
        <p className="text-gray-600">
          Siga todos los pasos para completar la verificación
        </p>
      </div>
      
      <InverIDVerifier 
        sessionId={sessionId}
        onSuccess={handleSuccess}
        onError={handleError}
        onComplete={handleComplete}
      />
    </div>
  );
  
  // Renderizar pantalla de éxito
  const renderSuccess = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="inline-block p-3 bg-green-100 rounded-full mb-2">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Verificación Exitosa
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Su identidad ha sido verificada con el máximo nivel de seguridad
        </p>
      </motion.div>
      
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#2d219b]" />
              <CardTitle>Certificado de Verificación</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Verificado
            </Badge>
          </div>
          <CardDescription>
            Certificado de verificación de identidad con validez legal
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Información personal</h3>
                <div className="mt-2 grid grid-cols-3 gap-y-3 gap-x-2 text-sm">
                  <div className="col-span-1 font-medium">Nombre:</div>
                  <div className="col-span-2">{verificationData?.cedula?.nombres} {verificationData?.cedula?.apellidos}</div>
                  
                  <div className="col-span-1 font-medium">RUT:</div>
                  <div className="col-span-2">{verificationData?.cedula?.rut}</div>
                  
                  <div className="col-span-1 font-medium">Nacionalidad:</div>
                  <div className="col-span-2">{verificationData?.cedula?.nacionalidad || 'Chilena'}</div>
                  
                  <div className="col-span-1 font-medium">F. Nacimiento:</div>
                  <div className="col-span-2">{verificationData?.cedula?.fechaNacimiento}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Detalles de verificación</h3>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Verificación de documento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Lectura de chip NFC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Verificación biométrica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Validación con bases oficiales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ID de verificación: {sessionId.substring(0, 8)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Fecha: {new Date().toLocaleDateString()} - Hora: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline" className="text-[#2d219b]">
                Nivel 3 (máximo)
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-between">
          <div>
            <Dialog open={showTechnicalInfo} onOpenChange={setShowTechnicalInfo}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Terminal className="h-4 w-4" />
                  Información técnica
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Información técnica</DialogTitle>
                  <DialogDescription>
                    Detalles técnicos del proceso de verificación
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">ID de la sesión</h4>
                    <code className="block bg-gray-100 p-2 rounded text-xs mt-1 font-mono overflow-x-auto">
                      {sessionId}
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Timestamp</h4>
                    <code className="block bg-gray-100 p-2 rounded text-xs mt-1 font-mono">
                      {new Date().toISOString()}
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Datos de verificación</h4>
                    <code className="block bg-gray-100 p-2 rounded text-xs mt-1 font-mono overflow-x-auto whitespace-pre">
                      {JSON.stringify(verificationData, null, 2)}
                    </code>
                  </div>
                </div>
                <DialogFooter className="sm:justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowTechnicalInfo(false)}
                  >
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-x-3">
            <Button variant="outline" onClick={shareResults} className="gap-1">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
            <Button variant="outline" onClick={generateCertificate} className="gap-1">
              <Download className="h-4 w-4" />
              Descargar certificado
            </Button>
            <Button onClick={restartProcess}>Realizar otra verificación</Button>
          </div>
        </CardFooter>
      </Card>
      
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <HelpCircle className="h-5 w-5 text-blue-600" />
        <AlertTitle>¿Qué puedo hacer con esta verificación?</AlertTitle>
        <AlertDescription className="text-blue-600">
          Esta verificación de identidad tiene validez legal conforme a la Ley 19.799 sobre documentos electrónicos
          y puede utilizarse para trámites en línea, firma de documentos y certificaciones que requieran
          comprobación de identidad.
        </AlertDescription>
      </Alert>
    </div>
  );
  
  // Renderizar contenido según el paso actual
  const renderContent = () => {
    switch (step) {
      case 'intro':
        return renderIntro();
      case 'verify':
        return renderVerification();
      case 'success':
        return renderSuccess();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Verificación InverID | VecinoXpress</title>
        <meta name="description" content="Sistema avanzado de verificación de identidad mediante NFC y análisis forense" />
      </Helmet>
      
      {renderContent()}
    </div>
  );
};

export default VerificacionInverID;