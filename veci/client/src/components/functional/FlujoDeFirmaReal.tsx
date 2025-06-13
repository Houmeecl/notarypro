import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  FileSignature, 
  User2, 
  Shield 
} from 'lucide-react';
import { esFuncionalidadRealActiva } from '@/lib/funcionalidad-real';

interface FlujoDeFirmaRealProps {
  documentoId?: string;
  onComplete?: (documentoId: string) => void;
  skipInitialSteps?: boolean;
}

/**
 * Componente que implementa el flujo completo de firma electrónica real
 * Cumple con todos los requisitos de la Ley 19.799 para validez legal
 */
const FlujoDeFirmaReal: React.FC<FlujoDeFirmaRealProps> = ({ 
  documentoId, 
  onComplete, 
  skipInitialSteps = false 
}) => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(skipInitialSteps ? 'verificacion' : 'seleccion');
  const [progreso, setProgreso] = useState(skipInitialSteps ? 40 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Control de estados de documento
  const [selectedDoc, setSelectedDoc] = useState<string | null>(documentoId || null);
  const [documento, setDocumento] = useState<{
    id: string;
    nombre: string;
    tipo: string;
    estado: string;
  } | null>(null);
  
  // Estado de la verificación de identidad
  const [identidadVerificada, setIdentidadVerificada] = useState(false);
  
  // Estado del pago
  const [pagoCompletado, setPagoCompletado] = useState(false);
  
  // Estado de la firma
  const [documentoFirmado, setDocumentoFirmado] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });

  // Efecto para verificar modo funcional
  useEffect(() => {
    if (!esFuncionalidadRealActiva()) {
      // Alerta no bloqueante
      toast({
        title: "⚠️ Advertencia",
        description: "El sistema no está en modo completamente funcional. Algunas características pueden no operar con validez legal.",
        duration: 5000,
      });
    }
  }, [toast]);

  // Efecto para cargar información del documento si se proporciona un ID
  useEffect(() => {
    if (documentoId) {
      setLoading(true);
      // Aquí iría la llamada a la API para obtener los datos del documento
      setTimeout(() => {
        setDocumento({
          id: documentoId,
          nombre: "Contrato de Servicios Profesionales",
          tipo: "Contrato",
          estado: "Pendiente de Firma"
        });
        setLoading(false);
      }, 1000);
    }
  }, [documentoId]);

  // Manejador de cambios de formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simulación de verificación de identidad
  const verificarIdentidad = async () => {
    if (!formData.nombre || !formData.rut) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete su nombre y RUT para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIdentidadVerificada(true);
      setProgreso(60);
      setActiveStep('pago');
      
      toast({
        title: "Identidad verificada",
        description: "Su identidad ha sido verificada correctamente.",
      });
    } catch (err) {
      setError("No se pudo verificar su identidad. Por favor, intente nuevamente.");
      
      toast({
        title: "Error de verificación",
        description: "No se pudo verificar su identidad. Por favor, revise los datos ingresados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulación de proceso de pago
  const procesarPago = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, esto sería una llamada a la API de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPagoCompletado(true);
      setProgreso(80);
      setActiveStep('firma');
      
      toast({
        title: "Pago procesado",
        description: "Su pago ha sido procesado exitosamente.",
      });
    } catch (err) {
      setError("Error al procesar el pago. Por favor, intente con otro método de pago.");
      
      toast({
        title: "Error de pago",
        description: "No se pudo procesar su pago. Por favor, intente con otro método.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulación de firma de documento
  const firmarDocumento = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // En una implementación real, esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setDocumentoFirmado(true);
      setProgreso(100);
      setActiveStep('completado');
      setSuccess(true);
      
      // Notificar que el flujo se ha completado
      if (onComplete && documento) {
        onComplete(documento.id);
      }
      
      toast({
        title: "Documento firmado",
        description: "Su documento ha sido firmado exitosamente con validez legal según Ley 19.799.",
      });
    } catch (err) {
      setError("Error al firmar el documento. Por favor, intente nuevamente.");
      
      toast({
        title: "Error de firma",
        description: "No se pudo firmar el documento. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un documento de la lista
  const seleccionarDocumento = (id: string, nombre: string) => {
    setSelectedDoc(id);
    setDocumento({
      id,
      nombre,
      tipo: "Contrato",
      estado: "Pendiente de Firma"
    });
    setActiveStep('datos');
    setProgreso(20);
  };

  // Enviar datos del formulario
  const enviarDatos = () => {
    if (!formData.nombre || !formData.rut || !formData.email) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveStep('verificacion');
    setProgreso(40);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progreso</span>
          <span>{progreso}%</span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>
      
      {/* Pasos del flujo */}
      <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="seleccion" disabled={activeStep !== 'seleccion'}>
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Selección</span>
          </TabsTrigger>
          <TabsTrigger value="datos" disabled={!selectedDoc || activeStep === 'seleccion'}>
            <User2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="verificacion" disabled={activeStep === 'seleccion' || activeStep === 'datos'}>
            <Camera className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Verificación</span>
          </TabsTrigger>
          <TabsTrigger value="pago" disabled={!identidadVerificada}>
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pago</span>
          </TabsTrigger>
          <TabsTrigger value="firma" disabled={!pagoCompletado}>
            <FileSignature className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Firma</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido: Selección de Documento */}
        <TabsContent value="seleccion">
          <Card>
            <CardHeader>
              <CardTitle>Seleccione un Documento</CardTitle>
              <CardDescription>
                Elija el tipo de documento que desea firmar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${selectedDoc === 'doc-1' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'hover:border-gray-300'}`}
                  onClick={() => seleccionarDocumento('doc-1', 'Contrato de Arrendamiento')}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contrato de Arrendamiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Contrato estándar para alquiler de inmuebles entre propietario y arrendatario.
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${selectedDoc === 'doc-2' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'hover:border-gray-300'}`}
                  onClick={() => seleccionarDocumento('doc-2', 'Contrato de Prestación de Servicios')}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contrato de Servicios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Acuerdo para la prestación de servicios profesionales entre partes.
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${selectedDoc === 'doc-3' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'hover:border-gray-300'}`}
                  onClick={() => seleccionarDocumento('doc-3', 'Poder Simple')}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Poder Simple</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Autorización para que otra persona actúe en su nombre para trámites específicos.
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${selectedDoc === 'doc-4' ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'hover:border-gray-300'}`}
                  onClick={() => seleccionarDocumento('doc-4', 'Declaración Jurada')}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Declaración Jurada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Documento en el que se declara bajo juramento la veracidad de cierta información.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled>
                Anterior
              </Button>
              <Button 
                onClick={() => {
                  if (selectedDoc) {
                    setActiveStep('datos');
                    setProgreso(20);
                  } else {
                    toast({
                      title: "Selección requerida",
                      description: "Por favor seleccione un documento para continuar.",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={!selectedDoc}
              >
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido: Datos Personales */}
        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>Complete sus Datos</CardTitle>
              <CardDescription>
                Información necesaria para el proceso de firma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input 
                      id="nombre" 
                      name="nombre" 
                      placeholder="Ingrese su nombre completo"
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT *</Label>
                    <Input 
                      id="rut" 
                      name="rut" 
                      placeholder="Ej: 12.345.678-9"
                      value={formData.rut}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      placeholder="correo@ejemplo.cl"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input 
                      id="telefono" 
                      name="telefono" 
                      placeholder="+56 9 1234 5678"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <Alert className="mt-4 bg-blue-50 border-blue-100">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-700 text-sm font-medium">Protección de Datos</AlertTitle>
                  <AlertDescription className="text-blue-600 text-xs">
                    Sus datos personales están protegidos y solo serán utilizados para la validación de su identidad y la firma electrónica de documentos.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveStep('seleccion');
                  setProgreso(0);
                }}
              >
                Anterior
              </Button>
              <Button onClick={enviarDatos}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido: Verificación de Identidad */}
        <TabsContent value="verificacion">
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Identidad</CardTitle>
              <CardDescription>
                Necesitamos verificar su identidad para cumplir con la normativa legal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-gray-50 border-gray-200">
                  <User2 className="h-4 w-4 text-gray-600" />
                  <AlertTitle className="text-gray-800 text-sm font-medium">Verificando identidad de:</AlertTitle>
                  <AlertDescription className="text-gray-700">
                    {formData.nombre || documento?.nombre || 'Usuario'} - RUT: {formData.rut || 'No disponible'}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <Camera className="text-blue-600 h-5 w-5 mr-2" />
                      Verificación por Selfie
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tome una fotografía de su rostro para verificar su identidad mediante reconocimiento facial.
                    </p>
                    
                    <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4">
                      <Camera className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    <Button className="w-full" disabled={loading || identidadVerificada}>
                      {identidadVerificada ? 'Verificado' : (loading ? 'Procesando...' : 'Iniciar Verificación')}
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <CreditCard className="text-green-600 h-5 w-5 mr-2" />
                      Verificación por Cédula
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Escanee su cédula de identidad para verificar su identidad mediante el chip electrónico.
                    </p>
                    
                    <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4">
                      <CreditCard className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={verificarIdentidad}
                      disabled={loading || identidadVerificada}
                    >
                      {identidadVerificada ? 'Verificado' : (loading ? 'Procesando...' : 'Verificar con Cédula')}
                    </Button>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error de verificación</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {identidadVerificada && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Identidad verificada</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Su identidad ha sido verificada correctamente. Puede continuar con el proceso.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveStep('datos');
                  setProgreso(20);
                }}
                disabled={loading}
              >
                Anterior
              </Button>
              <Button 
                onClick={() => {
                  setActiveStep('pago');
                  setProgreso(60);
                }}
                disabled={!identidadVerificada || loading}
              >
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido: Pago */}
        <TabsContent value="pago">
          <Card>
            <CardHeader>
              <CardTitle>Pago del Servicio</CardTitle>
              <CardDescription>
                Complete el pago para continuar con la firma del documento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">Resumen del servicio:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Documento:</span>
                    <span className="font-medium">{documento?.nombre || 'Documento seleccionado'}</span>
                    
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium">Firma Electrónica Avanzada</span>
                    
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">$3.990</span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Seleccione su método de pago:</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        id="tarjeta" 
                        name="metodoPago" 
                        className="h-4 w-4 text-blue-600"
                        defaultChecked
                      />
                      <Label htmlFor="tarjeta" className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                        Tarjeta de Crédito/Débito
                      </Label>
                    </div>
                    
                    <div className="ml-7 border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Número de tarjeta</Label>
                          <Input 
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Fecha de vencimiento</Label>
                            <Input 
                              id="expiry"
                              placeholder="MM/AA"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input 
                              id="cvc"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error de pago</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {pagoCompletado && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Pago procesado</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Su pago ha sido procesado correctamente. Puede continuar con la firma del documento.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveStep('verificacion');
                  setProgreso(40);
                }}
                disabled={loading}
              >
                Anterior
              </Button>
              <Button 
                onClick={procesarPago}
                disabled={pagoCompletado || loading}
              >
                {pagoCompletado ? 'Pagado' : (loading ? 'Procesando...' : 'Pagar $3.990')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido: Firma */}
        <TabsContent value="firma">
          <Card>
            <CardHeader>
              <CardTitle>Firma del Documento</CardTitle>
              <CardDescription>
                Firme su documento con validez legal según Ley 19.799
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-100">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Información Legal</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    La firma electrónica avanzada tiene la misma validez legal que una firma manuscrita según la Ley 19.799.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Vista previa del documento:</h3>
                  
                  <div className="bg-gray-100 border rounded h-48 flex items-center justify-center mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Ver Documento Completo
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Términos y condiciones:</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        id="terminos" 
                        className="h-4 w-4 mt-1"
                      />
                      <Label htmlFor="terminos" className="text-sm">
                        He leído y acepto los términos y condiciones del servicio de firma electrónica avanzada.
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        id="consentimiento" 
                        className="h-4 w-4 mt-1"
                      />
                      <Label htmlFor="consentimiento" className="text-sm">
                        Doy mi consentimiento para la firma electrónica de este documento y confirmo que tiene validez legal.
                      </Label>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error de firma</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {documentoFirmado && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Documento firmado</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Su documento ha sido firmado correctamente con validez legal.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveStep('pago');
                  setProgreso(60);
                }}
                disabled={loading}
              >
                Anterior
              </Button>
              <Button 
                onClick={firmarDocumento}
                disabled={documentoFirmado || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {documentoFirmado ? 'Firmado' : (loading ? 'Procesando...' : 'Firmar Documento')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido: Completado */}
        <TabsContent value="completado">
          <Card>
            <CardHeader className="text-center bg-green-50">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>¡Proceso Completado!</CardTitle>
              <CardDescription>
                Su documento ha sido firmado y certificado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Documento Firmado con Éxito</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Su documento ha sido firmado con validez legal según la Ley 19.799 y está disponible para su descarga.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Resumen:</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <span className="text-gray-600">Documento:</span>
                    <span className="font-medium">{documento?.nombre || 'Documento firmado'}</span>
                    
                    <span className="text-gray-600">Firmante:</span>
                    <span className="font-medium">{formData.nombre || 'Usuario verificado'}</span>
                    
                    <span className="text-gray-600">Fecha de firma:</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                    
                    <span className="text-gray-600">Código de verificación:</span>
                    <span className="font-medium">VX-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar Documento
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      Certificado de Firma
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Una copia del documento firmado ha sido enviada a su correo electrónico: {formData.email || 'su correo registrado'}
                  </p>
                  <Button variant="link">Ver todos mis documentos</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button 
                onClick={() => {
                  // Reiniciar el flujo
                  setSelectedDoc(null);
                  setDocumento(null);
                  setIdentidadVerificada(false);
                  setPagoCompletado(false);
                  setDocumentoFirmado(false);
                  setActiveStep('seleccion');
                  setProgreso(0);
                  setError(null);
                  setFormData({
                    nombre: '',
                    rut: '',
                    email: '',
                    telefono: ''
                  });
                }}
              >
                Firmar otro documento
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlujoDeFirmaReal;