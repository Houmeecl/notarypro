import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Video, FileSignature, CheckCircle, ArrowLeft, QrCode, Smartphone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { VecinosETokenSignature } from '../components/vecinos/VecinosETokenSignature';
import { VecinosRonVideoVerification } from '../components/vecinos/VecinosRonVideoVerification';
import { VecinosQRSignature } from '../components/vecinos/VecinosQRSignature';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function VecinosCompleteVerificationPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processStep, setProcessStep] = useState<'select' | 'sign' | 'verify' | 'qrsign' | 'complete'>('select');
  const [verificationMethod, setVerificationMethod] = useState<'etoken' | 'video' | 'qr'>('etoken');
  const [document, setDocument] = useState<any>({
    id: parseInt(params.documentId || '1'),
    title: "Contrato de Prestación de Servicios",
    type: "contract",
    status: "pending",
    clientName: "Juan Pérez González",
    clientRut: "12.345.678-9",
    clientPhone: "+56 9 1234 5678",
    clientEmail: "juan.perez@ejemplo.cl",
    verificationCode: "ABC12345",
    createdAt: new Date().toISOString(),
    fileName: "contrato-prestacion-servicios.pdf"
  });

  const handleGoBack = () => {
    if (processStep === 'sign' || processStep === 'verify' || processStep === 'qrsign') {
      setProcessStep('select');
    } else {
      navigate('/vecinos-express');
    }
  };

  const handleMethodSelection = (method: 'etoken' | 'video' | 'qr') => {
    setVerificationMethod(method);
    if (method === 'etoken') {
      setProcessStep('sign');
    } else if (method === 'video') {
      setProcessStep('verify');
    } else if (method === 'qr') {
      setProcessStep('qrsign');
    }
  };

  const handleSignatureSuccess = (signatureData: any) => {
    toast({
      title: "Firma completada",
      description: "El documento ha sido firmado exitosamente.",
    });
    
    setProcessStep('complete');
  };

  const handleVideoVerificationSuccess = (verificationData: any) => {
    toast({
      title: "Verificación completa",
      description: "La verificación por video ha sido completada exitosamente.",
    });
    
    setProcessStep('complete');
  };

  if (processStep === 'complete') {
    return (
      <div className="container mx-auto mt-8 px-4 max-w-3xl">
        <Card>
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Proceso completado exitosamente
            </CardTitle>
            <CardDescription>
              El documento ha sido procesado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <div className="text-center max-w-md mx-auto py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Proceso completado!</h2>
              <p className="text-gray-600 mb-6">
                {verificationMethod === 'etoken' 
                  ? 'El documento ha sido firmado electrónicamente de manera exitosa con eToken.' 
                  : verificationMethod === 'qr'
                  ? 'El documento ha sido firmado electrónicamente desde un dispositivo móvil.'
                  : 'La verificación por video ha sido registrada correctamente.'}
              </p>
              <Alert className="mb-4 text-left">
                <AlertTitle>Información importante</AlertTitle>
                <AlertDescription>
                  <p>Se ha enviado una notificación al cliente.</p>
                  <p className="mt-2">Código de verificación: <strong>{document.verificationCode}</strong></p>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={() => navigate('/vecinos-express')}>
              Volver al dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (processStep === 'sign') {
    return (
      <div className="container mx-auto mt-8 px-4 max-w-3xl">
        <Button onClick={handleGoBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <VecinosETokenSignature 
          documentId={document.id} 
          documentName={document.title}
          onSuccess={handleSignatureSuccess}
          onCancel={handleGoBack}
        />
      </div>
    );
  }

  if (processStep === 'verify') {
    return (
      <div className="container mx-auto mt-8 px-4 max-w-3xl">
        <Button onClick={handleGoBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <VecinosRonVideoVerification 
          documentId={document.id} 
          documentName={document.title}
          onSuccess={handleVideoVerificationSuccess}
          onCancel={handleGoBack}
        />
      </div>
    );
  }
  
  if (processStep === 'qrsign') {
    return (
      <div className="container mx-auto mt-8 px-4 max-w-3xl">
        <Button onClick={handleGoBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <VecinosQRSignature 
          documentId={document.id} 
          documentName={document.title}
          onSuccess={handleSignatureSuccess}
          onCancel={handleGoBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button onClick={() => navigate('/vecinos-express')} variant="outline" size="sm" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Verificación de Documento</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Información del documento</CardTitle>
          <CardDescription>
            Seleccione el método de validación para el documento: {document.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="text-sm font-medium mb-3">Detalles del documento:</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Título:</dt>
                <dd className="font-medium">{document.title}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tipo:</dt>
                <dd className="font-medium capitalize">{document.type}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Cliente:</dt>
                <dd className="font-medium">{document.clientName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">RUT:</dt>
                <dd className="font-medium">{document.clientRut}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Código de verificación:</dt>
                <dd className="font-mono font-medium">{document.verificationCode}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fecha de creación:</dt>
                <dd className="font-medium">{new Date(document.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
          
          <h3 className="text-base font-medium mb-3">Seleccione el método de verificación:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Card className="overflow-hidden border-2 hover:border-indigo-500 cursor-pointer transition-all" onClick={() => handleMethodSelection('etoken')}>
              <CardHeader className="bg-indigo-50 pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-800 text-sm md:text-base">
                  <FileSignature className="h-5 w-5" />
                  Firma con eToken
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-gray-600">
                  Utilice su token criptográfico para firmar electrónicamente el documento con una firma que cumple con la Ley 19.799.
                </p>
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-indigo-200 hover:bg-indigo-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMethodSelection('etoken');
                    }}
                  >
                    Seleccionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-2 hover:border-cyan-500 cursor-pointer transition-all" onClick={() => handleMethodSelection('qr')}>
              <CardHeader className="bg-cyan-50 pb-2">
                <CardTitle className="flex items-center gap-2 text-cyan-800 text-sm md:text-base">
                  <QrCode className="h-5 w-5" />
                  Firma por QR Móvil
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-gray-600">
                  Genere un código QR para que el cliente pueda firmar el documento desde su celular. Ideal cuando el firmante está en otra ubicación.
                </p>
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-cyan-200 hover:bg-cyan-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMethodSelection('qr');
                    }}
                  >
                    Seleccionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-2 hover:border-purple-500 cursor-pointer transition-all" onClick={() => handleMethodSelection('video')}>
              <CardHeader className="bg-purple-50 pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-800 text-sm md:text-base">
                  <Video className="h-5 w-5" />
                  Verificación por video
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-gray-600">
                  Inicie una videollamada de verificación con el sistema de certificación remota RON (Remote Online Notarization).
                </p>
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-200 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMethodSelection('video');
                    }}
                  >
                    Seleccionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => navigate('/vecinos-express')}>Cancelar</Button>
        </CardFooter>
      </Card>
    </div>
  );
}