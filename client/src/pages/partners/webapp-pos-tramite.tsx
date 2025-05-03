
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { QrCode, FileText, Shield, User, CreditCard, PenLine, Database, CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import VecinosLayout from "@/components/vecinos/VecinosLayout";
import NFCReader from "@/components/identity/NFCReader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SignatureCanvas from "react-signature-canvas";
import confetti from "canvas-confetti";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
}

const POS_TRAMITE = () => {
  // Estados principales del flujo
  const [step, setStep] = useState<'select-document' | 'qr-generated' | 'identity-verification' | 'form-filling' | 'simple-signature' | 'advanced-signature' | 'storage' | 'completed'>('select-document');
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [identityVerified, setIdentityVerified] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [simpleSignatureDone, setSimpleSignatureDone] = useState(false);
  const [advancedSignatureDone, setAdvancedSignatureDone] = useState(false);
  const [documentStored, setDocumentStored] = useState(false);
  const [documentId, setDocumentId] = useState<string>("");
  
  // Estados secundarios para cada paso
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCertifierModalOpen, setIsCertifierModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Referencias
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Tipos de documentos disponibles
  const documentTypes: DocumentType[] = [
    { 
      id: "contrato", 
      name: "Contrato", 
      description: "Contratos generales y acuerdos", 
      icon: <FileText className="h-5 w-5" />,
      price: 3990
    },
    { 
      id: "declaracion", 
      name: "Declaración jurada", 
      description: "Declaraciones formales bajo juramento", 
      icon: <Shield className="h-5 w-5" />,
      price: 4990
    },
    { 
      id: "autorizacion", 
      name: "Autorización", 
      description: "Permisos y autorizaciones formales", 
      icon: <User className="h-5 w-5" />,
      price: 2990
    },
  ];

  // Función para generar QR único
  const generateQR = () => {
    setLoading(true);
    
    // Simulación de generación de QR
    setTimeout(() => {
      const randomQR = `DOC-${Math.floor(100000 + Math.random() * 900000)}`;
      setQrCode(randomQR);
      setLoading(false);
      setIsQrModalOpen(true);
      setStep('qr-generated');
    }, 1500);
  };

  // Función para manejar verificación de identidad exitosa
  const handleIdentityVerified = (userData: any) => {
    setUserData(userData);
    setIdentityVerified(true);
    toast({
      title: "Identidad verificada",
      description: "La identidad ha sido verificada correctamente"
    });
    
    // Avanzar al siguiente paso
    setTimeout(() => {
      setIsNfcModalOpen(false);
      setStep('form-filling');
      setIsFormDialogOpen(true);
    }, 1000);
  };

  // Función para el llenado del formulario
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormDialogOpen(false);
    setStep('simple-signature');
    setIsSignatureModalOpen(true);
  };

  // Función para completar la firma simple
  const completeSimpleSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureDataUrl = sigCanvas.current.toDataURL('image/png');
      // Aquí se guardaría la firma
      setSimpleSignatureDone(true);
      setIsSignatureModalOpen(false);
      
      // Simular procesamiento
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('advanced-signature');
        setIsCertifierModalOpen(true);
      }, 1500);
    } else {
      toast({
        title: "Firma requerida",
        description: "Por favor realice una firma antes de continuar",
        variant: "destructive"
      });
    }
  };

  // Función para la firma avanzada (certificador)
  const completeAdvancedSignature = () => {
    setAdvancedSignatureDone(true);
    setIsCertifierModalOpen(false);
    
    // Simular procesamiento
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('storage');
      
      // Simular almacenamiento
      setTimeout(() => {
        setDocumentStored(true);
        setDocumentId(`DOC-${Math.floor(100000 + Math.random() * 900000)}`);
        setStep('completed');
        
        // Lanzar confetti para celebrar
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 2000);
    }, 1500);
  };

  // Procesar pago antes de la firma avanzada
  const processPayment = () => {
    setProcessingPayment(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setProcessingPayment(false);
      completeAdvancedSignature();
    }, 2000);
  };

  // Función para limpiar la firma
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  // Función para reiniciar el proceso
  const resetProcess = () => {
    setStep('select-document');
    setDocumentType("");
    setQrCode("");
    setIdentityVerified(false);
    setUserData(null);
    setFormData({});
    setSimpleSignatureDone(false);
    setAdvancedSignatureDone(false);
    setDocumentStored(false);
    setDocumentId("");
    setIsQrModalOpen(false);
    setIsNfcModalOpen(false);
    setIsSignatureModalOpen(false);
    setIsFormDialogOpen(false);
    setIsCertifierModalOpen(false);
  };

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (step) {
      case 'select-document':
        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Seleccione el tipo de documento</h2>
              <p className="text-gray-600">Elija el tipo de documento que desea tramitar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {documentTypes.map((docType) => (
                <Card 
                  key={docType.id}
                  className={`cursor-pointer transition-all ${documentType === docType.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'}`}
                  onClick={() => setDocumentType(docType.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${documentType === docType.id ? 'bg-primary/10 text-primary' : 'bg-gray-100'}`}>
                        {docType.icon}
                      </div>
                      <CardTitle className="text-lg">{docType.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                    <p className="mt-2 font-medium">${docType.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button
                className="min-w-[200px]"
                onClick={generateQR}
                disabled={!documentType || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Iniciar trámite'
                )}
              </Button>
            </div>
          </div>
        );
        
      case 'qr-generated':
        return (
          <div>
            <div className="flex mb-6">
              <Button variant="outline" onClick={() => setStep('select-document')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">QR generado</h2>
              <p className="text-gray-600">Escanee el código QR con un dispositivo móvil para continuar</p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Código de verificación</CardTitle>
                <CardDescription>
                  Use este código para continuar su trámite
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-gray-100 p-8 rounded-lg mb-4">
                  <QrCode className="h-32 w-32 text-gray-800" />
                </div>
                <div className="text-2xl font-bold mb-2">{qrCode}</div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Este código es único para su trámite.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  onClick={() => {
                    setIsQrModalOpen(false);
                    setStep('identity-verification');
                    setIsNfcModalOpen(true);
                  }}
                >
                  Continuar con verificación
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'identity-verification':
        return (
          <div>
            <div className="flex mb-6">
              <Button variant="outline" onClick={() => setStep('qr-generated')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Verificación de identidad</h2>
              <p className="text-gray-600">Verifique su identidad para continuar con el trámite</p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Verificación NFC</CardTitle>
                <CardDescription>
                  Acerque su cédula de identidad al dispositivo para leer el chip NFC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setIsNfcModalOpen(true)}
                >
                  Iniciar verificación NFC
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'form-filling':
        return (
          <div>
            <div className="flex mb-6">
              <Button variant="outline" onClick={() => setStep('identity-verification')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Datos del documento</h2>
              <p className="text-gray-600">Complete la información necesaria para el documento</p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Formulario</CardTitle>
                <CardDescription>
                  Llene todos los campos requeridos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setIsFormDialogOpen(true)}
                >
                  Abrir formulario
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'simple-signature':
        return (
          <div>
            <div className="flex mb-6">
              <Button variant="outline" onClick={() => setStep('form-filling')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Firma simple</h2>
              <p className="text-gray-600">Firme el documento para continuar</p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Firma electrónica</CardTitle>
                <CardDescription>
                  Firme electrónicamente en la pantalla
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setIsSignatureModalOpen(true)}
                >
                  Realizar firma
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'advanced-signature':
        return (
          <div>
            <div className="flex mb-6">
              <Button variant="outline" onClick={() => setStep('simple-signature')}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Firma avanzada</h2>
              <p className="text-gray-600">El certificador validará el documento con una firma avanzada</p>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Firma del certificador</CardTitle>
                <CardDescription>
                  El certificador verificará y firmará su documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setIsCertifierModalOpen(true)}
                >
                  Iniciar validación
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'storage':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Almacenando documento</h2>
            <p className="text-gray-600 mb-8">El documento se está almacenando de forma segura</p>
            
            <div className="max-w-md mx-auto flex flex-col items-center">
              <Database className="h-16 w-16 text-primary animate-pulse mb-4" />
              <Progress value={documentStored ? 100 : 60} className="w-full mb-4" />
              <p className="text-sm text-gray-600">
                {documentStored ? "Almacenamiento completado" : "Almacenando..."}
              </p>
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Proceso completado!</h2>
            <p className="text-gray-600 mb-8">Su documento ha sido procesado exitosamente</p>
            
            <Card className="max-w-md mx-auto mb-8">
              <CardHeader>
                <CardTitle>Resumen del trámite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de documento:</span>
                    <span className="font-medium">{documentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de documento:</span>
                    <span className="font-medium">
                      {documentTypes.find(d => d.id === documentType)?.name || documentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solicitante:</span>
                    <span className="font-medium">{userData?.nombres || 'Usuario'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600">Completado</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={resetProcess}>
                  Iniciar nuevo trámite
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <VecinosLayout>
      <div className="container mx-auto py-8">
        {/* Indicador de progreso */}
        <div className="max-w-3xl mx-auto mb-8">
          <Progress 
            value={
              step === 'select-document' ? 0 :
              step === 'qr-generated' ? 16 :
              step === 'identity-verification' ? 32 :
              step === 'form-filling' ? 48 :
              step === 'simple-signature' ? 64 :
              step === 'advanced-signature' ? 80 :
              step === 'storage' || step === 'completed' ? 100 : 0
            } 
            className="h-2" 
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Inicio</span>
            <span>QR</span>
            <span>Identidad</span>
            <span>Formulario</span>
            <span>Firma</span>
            <span>Certificación</span>
            <span>Final</span>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
        
        {/* Modal de QR */}
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Código QR generado</DialogTitle>
              <DialogDescription>
                Escanee este código o utilice el código numérico para continuar su trámite
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-4">
              <div className="bg-gray-100 p-8 rounded-lg mb-4">
                <QrCode className="h-32 w-32 text-gray-800" />
              </div>
              <div className="text-2xl font-bold mb-2">{qrCode}</div>
              <p className="text-sm text-gray-600 text-center">
                Este código es único para su trámite.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => {
                  setIsQrModalOpen(false);
                  setStep('identity-verification');
                }}
              >
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de NFC */}
        <Dialog open={isNfcModalOpen} onOpenChange={setIsNfcModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verificación NFC</DialogTitle>
              <DialogDescription>
                Acerque su cédula de identidad al dispositivo para leer el chip NFC
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <NFCReader 
                onSuccess={(data) => handleIdentityVerified(data)}
                demoMode={true}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsNfcModalOpen(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de formulario */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Complete el formulario</DialogTitle>
              <DialogDescription>
                Ingrese la información requerida para su {documentTypes.find(d => d.id === documentType)?.name.toLowerCase() || 'documento'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={userData?.nombres || ""}
                    className="col-span-3"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="documentType" className="text-right">
                    Tipo de documento
                  </Label>
                  <Input
                    id="documentType"
                    value={documentTypes.find(d => d.id === documentType)?.name || ""}
                    className="col-span-3"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="purpose" className="text-right">
                    Propósito
                  </Label>
                  <Select
                    onValueChange={(value) => setFormData({...formData, purpose: value})}
                    defaultValue={formData.purpose || ""}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione un propósito" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Uso personal</SelectItem>
                      <SelectItem value="business">Trámite comercial</SelectItem>
                      <SelectItem value="legal">Requisito legal</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">
                    Detalles
                  </Label>
                  <Textarea
                    id="details"
                    className="col-span-3"
                    placeholder="Proporcione detalles adicionales sobre el documento"
                    value={formData.details || ""}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Continuar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Modal de firma */}
        <Sheet open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
          <SheetContent side="bottom" className="h-[90%] sm:max-w-lg sm:h-[90%] sm:mx-auto rounded-t-lg">
            <SheetHeader className="text-center mb-6">
              <SheetTitle>Firmar documento</SheetTitle>
              <SheetDescription>
                Firme con su dedo o lápiz en el área designada
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex flex-col items-center">
              <div className="border rounded-lg w-full min-h-[300px] mb-6 bg-white">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: "w-full h-full signature-canvas",
                    style: { minHeight: "300px" }
                  }}
                  penColor="black"
                />
              </div>
              
              <div className="flex justify-center gap-4 w-full">
                <Button 
                  variant="outline" 
                  onClick={clearSignature}
                  className="flex-1"
                >
                  Borrar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={completeSimpleSignature}
                >
                  Completar firma
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Modal de certificador */}
        <Dialog open={isCertifierModalOpen} onOpenChange={setIsCertifierModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Firma avanzada del certificador</DialogTitle>
              <DialogDescription>
                El certificador validará y firmará el documento
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Información del documento</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Tipo: {documentTypes.find(d => d.id === documentType)?.name}
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Solicitante: {userData?.nombres || 'Usuario'}
                </p>
                <p className="text-sm text-blue-700">
                  Firma simple: Completada ✓
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                <h3 className="font-medium text-amber-800 mb-2">Validación requerida</h3>
                <p className="text-sm text-amber-700">
                  Este documento requiere la firma avanzada de un certificador oficial para su validez legal.
                </p>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="payment" className="mb-2 block">
                  Costo del trámite
                </Label>
                <div className="text-2xl font-bold mb-4">
                  ${documentTypes.find(d => d.id === documentType)?.price.toLocaleString() || '3.990'}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={processPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar y continuar
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCertifierModalOpen(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </VecinosLayout>
  );
};

export default POS_TRAMITE;
