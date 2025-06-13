import React, { useState } from 'react';
import { 
  FilePenLine, CheckCircle, SmartphoneNfc, QrCode, Fingerprint, 
  FileSignature, CreditCard, Layers, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stepper, Step } from '@/components/ui/stepper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QRVerificationFlow from '@/components/verification/QRVerificationFlow';
import { useLocation } from 'wouter';

import vecinoLogo from '@/assets/new/vecino-xpress-logo-nuevo.png';

// Tipos de documentos disponibles
const DOCUMENT_TYPES = [
  { id: 'power', name: 'Poder Simple', price: 5000 },
  { id: 'declaration', name: 'Declaración Jurada', price: 7500 },
  { id: 'contract', name: 'Contrato', price: 10000 },
  { id: 'certificate', name: 'Certificado', price: 3500 },
  { id: 'legalization', name: 'Legalización de Documentos', price: 4500 },
  { id: 'translation', name: 'Traducción Oficial', price: 15000 }
];

// Componente principal
export default function DocumentWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState<'pos' | 'qr' | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [clientInfo, setClientInfo] = useState({
    name: '',
    rut: '',
    email: '',
    phone: ''
  });
  const [documentInfo, setDocumentInfo] = useState({
    title: '',
    description: '',
    participantCount: 1
  });
  const [identityVerified, setIdentityVerified] = useState(false);
  const [documentSigned, setDocumentSigned] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [processingStep, setProcessingStep] = useState(false);
  const [certifierId, setCertifierId] = useState<string | null>(null);
  
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Manejar la selección del tipo de documento
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    const selectedDoc = DOCUMENT_TYPES.find(doc => doc.id === value);
    if (selectedDoc) {
      setDocumentInfo(prev => ({
        ...prev,
        title: selectedDoc.name
      }));
    }
  };

  // Manejar cambios en la información del cliente
  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en la información del documento
  const handleDocumentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Avanzar al siguiente paso
  const moveToNextStep = () => {
    if (activeStep < 4) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Retroceder al paso anterior
  const moveToPreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Iniciar proceso de verificación de identidad
  const startIdentityVerification = async (method: 'pos' | 'qr') => {
    setVerificationMethod(method);
    setProcessingStep(true);
    
    if (method === 'pos') {
      // En producción, esto iniciaría el componente de verificación biométrica en el POS
      toast({
        title: "Verificación iniciada",
        description: "Por favor complete la verificación biométrica en el POS",
      });
      
      // Para la demo, simularemos una verificación exitosa después de unos segundos
      setTimeout(() => {
        setIdentityVerified(true);
        setProcessingStep(false);
        moveToNextStep();
        
        toast({
          title: "Verificación completada",
          description: "Su identidad ha sido verificada correctamente",
        });
      }, 5000);
    } else {
      // El método QR se maneja en el componente QRVerificationFlow
      setProcessingStep(false);
    }
  };

  // Manejar la finalización de la verificación por QR
  const handleQRVerificationComplete = (verified: boolean) => {
    setIdentityVerified(verified);
    
    if (verified) {
      moveToNextStep();
      toast({
        title: "Verificación completada",
        description: "Su identidad ha sido verificada correctamente mediante el dispositivo móvil",
      });
    } else {
      toast({
        title: "Verificación fallida",
        description: "No se pudo completar la verificación de identidad",
        variant: "destructive",
      });
    }
  };

  // Iniciar proceso de firma
  const [capturedSignature, setCapturedSignature] = useState<string | null>(null);
  
  // Manejar la captura de firma
  const handleSignatureCapture = (signatureData: string) => {
    setCapturedSignature(signatureData);
    setDocumentSigned(true);
    setProcessingStep(false);
    
    // Llamamos al servicio de firmas para validar y almacenar
    import("@/services/signature-service").then(({ signatureService }) => {
      signatureService.validateSignature(signatureData, { 
        name: clientInfo.name, 
        documentId: documentType 
      }).then(result => {
        if (result.valid) {
          toast({
            title: "Firma validada",
            description: "La firma ha sido verificada correctamente",
          });
          
          // Almacenar la firma
          signatureService.storeSignature({
            base64Data: signatureData,
            signerId: clientInfo.name,
            signerName: clientInfo.name,
            documentId: documentType,
            timestamp: new Date(),
          }).then(() => {
            moveToNextStep();
          });
        } else {
          toast({
            title: "Error de validación",
            description: result.message || "No se pudo validar la firma",
            variant: "destructive",
          });
          setDocumentSigned(false);
        }
      });
    });
  };
  
  // Iniciar proceso de firma
  const startSigningProcess = () => {
    // No es necesario hacer nada más, ya que el componente de firma
    // se muestra automáticamente en el paso de firma
  };

  // Iniciar proceso de pago
  const startPaymentProcess = () => {
    setProcessingStep(true);
    
    // En producción, esto iniciaría el componente de pago
    toast({
      title: "Procesando pago",
      description: "Por favor complete el pago",
    });
    
    // Para la demo, simularemos un pago exitoso después de unos segundos
    setTimeout(() => {
      setPaymentCompleted(true);
      setProcessingStep(false);
      moveToNextStep();
      
      // Generar un ID de certificador aleatorio para la demo
      setCertifierId(`VECX-${Math.floor(Math.random() * 100000)}`);
      
      toast({
        title: "Pago completado",
        description: "Su pago ha sido procesado correctamente",
      });
    }, 5000);
  };

  // Finalizar el proceso y volver al dashboard
  const finishProcess = () => {
    toast({
      title: "Proceso completado",
      description: "El documento ha sido procesado y certificado correctamente",
    });
    
    setLocation('/vecinos-standalone');
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePenLine className="h-5 w-5 text-[#2d219b]" />
                Selección de Documento
              </CardTitle>
              <CardDescription>
                Seleccione el tipo de documento que desea procesar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={handleDocumentTypeChange}>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Seleccione un tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Documentos Disponibles</SelectLabel>
                      {DOCUMENT_TYPES.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} - ${doc.price.toLocaleString('es-CL')}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-name">Nombre del Cliente</Label>
                <Input 
                  id="client-name" 
                  name="name" 
                  placeholder="Ej: Juan Pérez"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-rut">RUT del Cliente</Label>
                <Input 
                  id="client-rut" 
                  name="rut" 
                  placeholder="Ej: 12.345.678-9"
                  value={clientInfo.rut}
                  onChange={handleClientInfoChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input 
                    id="client-email" 
                    name="email" 
                    type="email" 
                    placeholder="cliente@ejemplo.com"
                    value={clientInfo.email}
                    onChange={handleClientInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Teléfono</Label>
                  <Input 
                    id="client-phone" 
                    name="phone" 
                    placeholder="+56 9 1234 5678"
                    value={clientInfo.phone}
                    onChange={handleClientInfoChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-title">Título del Documento</Label>
                <Input 
                  id="document-title" 
                  name="title" 
                  placeholder="Ej: Poder Simple para Trámite Municipal"
                  value={documentInfo.title}
                  onChange={handleDocumentInfoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-description">Descripción</Label>
                <Textarea 
                  id="document-description" 
                  name="description" 
                  placeholder="Ingrese una descripción del documento y su propósito"
                  value={documentInfo.description}
                  onChange={handleDocumentInfoChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setLocation('/vecinos-standalone')}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                onClick={moveToNextStep}
                disabled={!documentType || !clientInfo.name || !clientInfo.rut}
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 1:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-[#2d219b]" />
                Verificación de Identidad
              </CardTitle>
              <CardDescription>
                Para garantizar la seguridad del proceso, debe completar la verificación de identidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!verificationMethod ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-t-4 border-[#2d219b] shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => startIdentityVerification('pos')}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <SmartphoneNfc className="h-12 w-12 text-[#2d219b] mb-4" />
                      <h3 className="font-medium text-lg mb-2">Verificación en POS</h3>
                      <p className="text-sm text-gray-500 mb-4">Complete la verificación biométrica directamente en este dispositivo</p>
                      <Button className="w-full bg-[#2d219b] hover:bg-[#241a7d] text-white">
                        Iniciar Verificación
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-t-4 border-[#4863f7] shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => startIdentityVerification('qr')}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <QrCode className="h-12 w-12 text-[#4863f7] mb-4" />
                      <h3 className="font-medium text-lg mb-2">Verificación Móvil</h3>
                      <p className="text-sm text-gray-500 mb-4">Complete la verificación escaneando un código QR con su teléfono</p>
                      <Button className="w-full border-[#4863f7] text-[#4863f7] hover:bg-[#4863f7] hover:text-white" variant="outline">
                        Obtener Código QR
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : verificationMethod === 'qr' ? (
                <QRVerificationFlow 
                  documentId={documentType}
                  clientName={clientInfo.name}
                  onVerificationComplete={handleQRVerificationComplete}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  {processingStep ? (
                    <>
                      <div className="animate-spin w-12 h-12 border-4 border-[#2d219b] border-t-transparent rounded-full mb-4"></div>
                      <h3 className="text-lg font-medium mb-2">Verificando identidad...</h3>
                      <p className="text-center text-gray-500 max-w-md">
                        Por favor siga las instrucciones en pantalla para completar la verificación biométrica.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Verificación Completada</h3>
                      <p className="text-center text-gray-600 max-w-md mb-6">
                        Su identidad ha sido verificada exitosamente.
                      </p>
                      <Button 
                        className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                        onClick={moveToNextStep}
                      >
                        Continuar al siguiente paso
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            {!verificationMethod && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={moveToPreviousStep}>
                  Volver
                </Button>
                <Button 
                  className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  disabled={true}
                >
                  Continuar
                </Button>
              </CardFooter>
            )}
            {verificationMethod && !identityVerified && !processingStep && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationMethod(null)}>
                  Cambiar método
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-[#2d219b]" />
                Firma de Documento
              </CardTitle>
              <CardDescription>
                Firme el documento para darle validez legal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingStep ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-[#2d219b] border-t-transparent rounded-full mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Procesando firma...</h3>
                  <p className="text-center text-gray-500 max-w-md">
                    Por favor espere mientras se procesa la firma electrónica.
                  </p>
                </div>
              ) : documentSigned ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Documento Firmado</h3>
                  <p className="text-center text-gray-600 max-w-md mb-6">
                    El documento ha sido firmado exitosamente.
                  </p>
                  <Button 
                    className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                    onClick={moveToNextStep}
                  >
                    Continuar al pago
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{documentInfo.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{documentInfo.description || "Sin descripción"}</p>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="font-medium">Cliente:</span> {clientInfo.name}
                      </div>
                      <div>
                        <span className="font-medium">RUT:</span> {clientInfo.rut}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {clientInfo.email || "No especificado"}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {clientInfo.phone || "No especificado"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-[#2d219b] border-t-transparent rounded-full"></div>
                      </div>
                    }>
                      {React.createElement(
                        React.lazy(() => import("@/components/verification/SignaturePad")), 
                        { 
                          onSignatureCapture: handleSignatureCapture,
                          clientName: clientInfo.name,
                          title: "Firma Electrónica",
                          description: "Firme el documento a continuación usando su dedo o mouse",
                        }
                      )}
                    </Suspense>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle>Información importante</AlertTitle>
                    <AlertDescription>
                      Al firmar este documento usted certifica que toda la información proporcionada es correcta y que autoriza el procesamiento del trámite.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            {!documentSigned && !processingStep && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={moveToPreviousStep}>
                  Volver
                </Button>
                <Button 
                  className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  onClick={startSigningProcess}
                >
                  Firmar Documento
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#2d219b]" />
                Pago de Servicio
              </CardTitle>
              <CardDescription>
                Realice el pago para finalizar el trámite
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingStep ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-[#2d219b] border-t-transparent rounded-full mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Procesando pago...</h3>
                  <p className="text-center text-gray-500 max-w-md">
                    Por favor espere mientras se procesa el pago.
                  </p>
                </div>
              ) : paymentCompleted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Pago Completado</h3>
                  <p className="text-center text-gray-600 max-w-md mb-6">
                    El pago ha sido procesado exitosamente.
                  </p>
                  <Button 
                    className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                    onClick={moveToNextStep}
                  >
                    Ver Resumen
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Detalles del Servicio</h3>
                    
                    <div className="border-b pb-2 mb-2">
                      <div className="flex justify-between">
                        <span>{documentInfo.title}</span>
                        <span className="font-medium">
                          ${(DOCUMENT_TYPES.find(d => d.id === documentType)?.price || 0).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{documentInfo.description || "Sin descripción"}</p>
                    </div>
                    
                    <div className="border-b pb-2 mb-2">
                      <div className="flex justify-between">
                        <span>Verificación de identidad</span>
                        <span>$1.500</span>
                      </div>
                    </div>
                    
                    <div className="border-b pb-2 mb-2">
                      <div className="flex justify-between">
                        <span>Firma electrónica simple</span>
                        <span>$2.000</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between font-medium text-lg mt-4">
                      <span>Total</span>
                      <span>
                        ${((DOCUMENT_TYPES.find(d => d.id === documentType)?.price || 0) + 3500).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Seleccione método de pago</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-2 border-[#2d219b] shadow-md cursor-pointer">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <CreditCard className="h-8 w-8 text-[#2d219b] mb-2" />
                          <p className="font-medium">Tarjeta de Crédito/Débito</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border shadow-sm cursor-pointer">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <svg className="h-8 w-8 mb-2" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" fill="#009EE3" rx="4"/>
                            <path d="M15.6701 6H12.0723C10.4051 6 9.33192 6.60596 8.85565 8.25048C8.37504 9.91234 9.06234 11.1001 10.771 12.6805C9.83192 12.919 9.27259 13.5513 9.27259 14.5179C9.27259 16.5179 11.1055 17.9998 12.8866 17.9998C14.0197 17.9998 14.8995 17.6388 15.4621 16.9185C16.0246 16.1981 16.1724 15.191 15.9047 14.1863C15.5523 12.6085 14.2085 12.1078 12.1925 12.2273C12.0003 11.5286 12.2846 10.8502 12.832 10.8502H16.3564C16.974 10.8502 17.4753 10.3546 17.4753 9.74423V7.10596C17.4753 6.49556 16.974 6 16.3564 6H15.6701Z" fill="white"/>
                          </svg>
                          <p className="font-medium">MercadoPago</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border shadow-sm cursor-pointer">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <svg className="h-8 w-8 mb-2" viewBox="0 0 24 24">
                            <rect width="24" height="24" fill="#0079C1" rx="4"/>
                            <path d="M7 10.6154H9.4V16H10.9V10.6154H13.3V9.2308H7V10.6154ZM13.96 16H15.44V13.5385H17.88C18.5467 13.5385 19.06 13.3538 19.42 12.9846C19.78 12.6154 19.96 12.0923 19.96 11.4154C19.96 10.7385 19.78 10.2154 19.42 9.84615C19.06 9.47692 18.5467 9.29231 17.88 9.29231H13.96V16ZM15.44 12.1538V10.6769H17.44C17.68 10.6769 17.88 10.7385 18.04 10.8615C18.2 10.9846 18.28 11.1692 18.28 11.4154C18.28 11.6615 18.2 11.8462 18.04 11.9692C17.88 12.0923 17.68 12.1538 17.44 12.1538H15.44Z" fill="white"/>
                          </svg>
                          <p className="font-medium">PayPal</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="pt-4">
                      <Label htmlFor="card-number">Número de Tarjeta</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" className="mb-4" />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Expiración</Label>
                          <Input id="card-expiry" placeholder="MM/AA" />
                        </div>
                        
                        <div>
                          <Label htmlFor="card-cvc">CVC</Label>
                          <Input id="card-cvc" placeholder="123" />
                        </div>
                        
                        <div>
                          <Label htmlFor="card-zip">Código Postal</Label>
                          <Input id="card-zip" placeholder="12345" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {!paymentCompleted && !processingStep && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={moveToPreviousStep}>
                  Volver
                </Button>
                <Button 
                  className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  onClick={startPaymentProcess}
                >
                  Realizar Pago
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      
      case 4:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Proceso Completado
              </CardTitle>
              <CardDescription>
                ¡Felicidades! El documento ha sido procesado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-green-50 border border-green-200 rounded-full p-6 mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">¡Trámite Completado!</h2>
                <p className="text-center text-gray-600 max-w-md mb-8">
                  Su documento ha sido procesado, firmado y certificado exitosamente.
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md mb-6">
                  <h3 className="font-medium border-b pb-2 mb-4">Detalles del Documento</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documento:</span>
                      <span className="font-medium">{documentInfo.title}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{clientInfo.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código de Verificación:</span>
                      <span className="font-mono text-sm">{`VECX-${Math.floor(Math.random() * 1000000)}`}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{new Date().toLocaleDateString('es-CL')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificador:</span>
                      <span className="font-medium">{certifierId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="border-[#4863f7] text-[#4863f7] hover:bg-[#4863f7] hover:text-white"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                      <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                      <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                      <path d="M19 4H5C3.9 4 3 4.9 3 6V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6C21 4.9 20.1 4 19 4ZM19 19H5V6H19V19Z" fill="currentColor"/>
                    </svg>
                    Ver Documento
                  </Button>
                  
                  <Button className="bg-[#2d219b] hover:bg-[#241a7d] text-white">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
                    </svg>
                    Descargar Recibo
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={finishProcess}
              >
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-10 mr-2" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Gestor de Documentos</h1>
                <p className="text-sm text-gray-600">VecinoXpress</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLocation('/vecinos-standalone')}>
              Volver al Panel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center w-full">
              {["Datos", "Verificación", "Firma", "Pago", "Finalizado"].map((label, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center flex-1 w-full">
                      <div className={
                        idx < activeStep
                          ? "flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white z-10"
                          : idx === activeStep
                            ? "flex items-center justify-center w-8 h-8 rounded-full bg-[#2d219b] text-white z-10"
                            : "flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white text-gray-500 z-10"
                      }>
                        {idx < activeStep ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm">{idx + 1}</span>
                        )}
                      </div>
                      
                      {idx < 4 && (
                        <div className={
                          idx < activeStep 
                            ? "flex-1 h-1 mx-2 bg-green-600" 
                            : "flex-1 h-1 mx-2 bg-gray-300"
                        } />
                      )}
                    </div>
                    
                    <span className={
                      idx < activeStep
                        ? "text-xs mt-1 text-green-600"
                        : idx === activeStep
                          ? "text-xs mt-1 text-[#2d219b] font-medium"
                          : "text-xs mt-1 text-gray-500"
                    }>
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} VecinoXpress - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}