import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import AgoraVideoCall from '@/components/ron/AgoraVideoCall';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, FileText, CheckCircle, Clock, AlertTriangle, Camera, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RONSession {
  id: string;
  documentId: string;
  documentName: string;
  clientName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
}

interface IdentityVerification {
  id: string;
  success: boolean;
  documentType?: string;
  documentNumber?: string;
  fullName?: string;
  capturedImageUrl?: string;
  timestamp?: string;
}

interface SignatureStatus {
  id: string;
  status: 'awaiting_signature' | 'signed' | 'declined' | 'expired' | 'error';
  signingUrl?: string;
  signedDocumentUrl?: string;
  signedAt?: string;
}

interface Certificate {
  id: string;
  documentId: string;
  participantName: string;
  certifierName: string;
  certificateUrl: string;
  qrCodeUrl: string;
  createdAt: string;
}

const RonVideocallPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.sessionId;
  
  // Estados
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<RONSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('video');
  const [identity, setIdentity] = useState<IdentityVerification | null>(null);
  const [signature, setSignature] = useState<SignatureStatus | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  
  // Comprobar que tenemos un ID de sesión
  useEffect(() => {
    if (!sessionId) {
      setError('No se proporcionó un ID de sesión válido');
      setLoading(false);
      return;
    }
    
    loadSessionData();
  }, [sessionId]);
  
  // Cargar datos de la sesión
  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada API para cargar los datos de la sesión
      // y los estados relacionados (verificación, firma, certificado)
      
      // Simulación de carga de datos (reemplazar con llamada real)
      setTimeout(() => {
        setSession({
          id: sessionId || '',
          documentId: 'doc-' + Math.floor(Math.random() * 10000),
          documentName: 'Contrato de compraventa',
          clientName: 'Juan Pérez',
          status: 'in_progress',
          startTime: new Date().toISOString()
        });
        
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading session data:', error);
      setError('Error al cargar los datos de la sesión');
      setLoading(false);
    }
  };
  
  // Manejar captura de documento de identidad
  const handleCaptureIdentity = async (imageBlob: Blob) => {
    try {
      setProcessingAction(true);
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'identity-document.jpg');
      formData.append('documentType', 'Cédula de identidad');
      
      const response = await fetch(`/api/ron/session/${sessionId}/capture-identity`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar la imagen de verificación');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIdentity({
          id: data.verificationId,
          success: true,
          documentType: data.documentType,
          capturedImageUrl: data.capturedImageUrl,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: 'Verificación exitosa',
          description: 'Documento de identidad capturado correctamente',
          variant: 'default',
        });
        
        // Cambiar a la pestaña de verificación
        setActiveTab('identity');
      } else {
        throw new Error(data.error || 'Error en la verificación');
      }
    } catch (error) {
      console.error('Error capturing identity:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al capturar documento',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Iniciar proceso de firma
  const startSigningProcess = async () => {
    if (!identity || !identity.success) {
      toast({
        title: 'Verificación requerida',
        description: 'Se requiere verificar la identidad antes de firmar',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setProcessingAction(true);
      
      // Aquí iría la llamada a la API para iniciar la firma
      // Se deberá cargar el documento y los firmantes
      
      // Simulación (reemplazar con implementación real)
      setTimeout(() => {
        setSignature({
          id: 'sig-' + Math.floor(Math.random() * 10000),
          status: 'awaiting_signature',
          signingUrl: 'https://example.com/sign', // URL temporal
        });
        
        toast({
          title: 'Proceso iniciado',
          description: 'Solicitud de firma iniciada correctamente',
          variant: 'default',
        });
        
        setActiveTab('signature');
        setProcessingAction(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error starting signing process:', error);
      toast({
        title: 'Error',
        description: 'Error al iniciar el proceso de firma',
        variant: 'destructive',
      });
      setProcessingAction(false);
    }
  };
  
  // Generar certificado
  const generateCertificate = async () => {
    if (!identity || !identity.success) {
      toast({
        title: 'Verificación requerida',
        description: 'Se requiere verificar la identidad antes de generar el certificado',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setProcessingAction(true);
      
      const response = await apiRequest('POST', `/api/ron/session/${sessionId}/generate-certificate`, {
        documentId: session?.documentId,
        documentName: session?.documentName,
        participantName: session?.clientName,
        verificationResult: {
          success: identity.success,
          verificationId: identity.id,
          documentType: identity.documentType,
          documentNumber: identity.documentNumber,
        },
        signatureInfo: signature ? {
          signatureId: signature.id,
          signedAt: signature.signedAt || new Date().toISOString()
        } : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el certificado');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCertificate({
          id: data.certificateId,
          documentId: session?.documentId || '',
          participantName: session?.clientName || '',
          certifierName: user?.username || 'Certificador',
          certificateUrl: data.certificateUrl || '',
          qrCodeUrl: data.qrCodeUrl || '',
          createdAt: new Date().toISOString()
        });
        
        toast({
          title: 'Certificado generado',
          description: 'Constancia de certificación generada correctamente',
          variant: 'default',
        });
        
        // Cambiar a la pestaña de certificado
        setActiveTab('certificate');
      } else {
        throw new Error(data.error || 'Error en la generación del certificado');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al generar certificado',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Completar sesión
  const completeSession = async () => {
    try {
      setProcessingAction(true);
      
      const response = await apiRequest('POST', `/api/ron/session/${sessionId}/complete`, {
        documentId: session?.documentId,
        clientId: '1', // Aquí debería ir el ID real del cliente
        verificationId: identity?.id,
        signatureId: signature?.id,
        certificateId: certificate?.id,
        status: 'completed',
        notes: 'Sesión completada exitosamente'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar la sesión');
      }
      
      toast({
        title: 'Sesión completada',
        description: 'La sesión RON ha sido completada exitosamente',
        variant: 'default',
      });
      
      // Redirigir a la lista de sesiones o dashboard
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al completar la sesión',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="container py-8 mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Cargando sesión RON...</p>
      </div>
    );
  }
  
  // Mostrar error
  if (error) {
    return (
      <div className="container py-8 mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button onClick={() => setLocation('/dashboard')}>
          Volver al Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sesión de Certificación Remota</h1>
          <p className="text-gray-600">ID: {sessionId}</p>
        </div>
        
        <Badge variant={
          session?.status === 'completed' ? 'success' : 
          session?.status === 'in_progress' ? 'default' :
          session?.status === 'cancelled' ? 'destructive' : 'outline'
        }>
          {session?.status === 'completed' ? 'Completada' :
           session?.status === 'in_progress' ? 'En Progreso' :
           session?.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de información */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información de la sesión</CardTitle>
              <CardDescription>Detalles del documento y participantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Documento</p>
                  <p className="text-base">{session?.documentName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Participante</p>
                  <p className="text-base">{session?.clientName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Certificador</p>
                  <p className="text-base">{user?.username || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Inicio</p>
                  <p className="text-base">
                    {session?.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
                
                {/* Progreso del proceso */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Progreso del proceso</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${true ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Sesión iniciada</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${identity?.success ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Verificación de identidad</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${signature?.status === 'signed' ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Firma de documento</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${certificate ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Constancia generada</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Botones de acción */}
          <div className="mt-6 space-y-3">
            <Button 
              className="w-full" 
              disabled={!identity?.success || processingAction}
              onClick={startSigningProcess}
            >
              {processingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              Iniciar Firma Electrónica
            </Button>
            
            <Button 
              className="w-full" 
              disabled={!identity?.success || processingAction}
              variant="outline"
              onClick={generateCertificate}
            >
              {processingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generar Constancia
            </Button>
            
            <Button 
              className="w-full" 
              variant="default"
              disabled={processingAction}
              onClick={completeSession}
            >
              {processingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Completar Sesión
            </Button>
          </div>
        </div>
        
        {/* Columna de contenido principal */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="video">Videollamada</TabsTrigger>
              <TabsTrigger value="identity">Identidad</TabsTrigger>
              <TabsTrigger value="signature">Firma</TabsTrigger>
              <TabsTrigger value="certificate">Constancia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="video">
              <Card>
                <CardHeader>
                  <CardTitle>Videollamada</CardTitle>
                  <CardDescription>
                    Conexión en tiempo real con el participante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Componente de videollamada */}
                  <AgoraVideoCall 
                    sessionId={sessionId || ''} 
                    role={user?.role === 'certifier' ? 'host' : 'audience'}
                    onCaptureIdentity={handleCaptureIdentity}
                  />
                  
                  {/* Instrucciones para certificador */}
                  {user?.role === 'certifier' && (
                    <Alert className="mt-4">
                      <Camera className="h-4 w-4" />
                      <AlertTitle>Instrucciones para el certificador</AlertTitle>
                      <AlertDescription>
                        Utilice el botón de captura para tomar una imagen del documento de identidad del participante.
                        Asegúrese de que el documento sea claramente visible antes de capturar.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="identity">
              <Card>
                <CardHeader>
                  <CardTitle>Verificación de Identidad</CardTitle>
                  <CardDescription>
                    Resultado de la verificación del documento de identidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {identity ? (
                    <div>
                      <div className="mb-4">
                        <Badge variant={identity.success ? 'default' : 'destructive'}>
                          {identity.success ? 'Verificado' : 'No verificado'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Tipo de documento</p>
                          <p className="text-base">{identity.documentType || 'No especificado'}</p>
                          
                          {identity.documentNumber && (
                            <>
                              <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Número de documento</p>
                              <p className="text-base">{identity.documentNumber}</p>
                            </>
                          )}
                          
                          {identity.fullName && (
                            <>
                              <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Nombre completo</p>
                              <p className="text-base">{identity.fullName}</p>
                            </>
                          )}
                          
                          <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Fecha y hora</p>
                          <p className="text-base">
                            {identity.timestamp ? new Date(identity.timestamp).toLocaleString() : 'No disponible'}
                          </p>
                        </div>
                        
                        <div>
                          {identity.capturedImageUrl ? (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">Imagen capturada</p>
                              <div className="border rounded overflow-hidden">
                                <img 
                                  src={identity.capturedImageUrl} 
                                  alt="Documento de identidad" 
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
                              <p className="text-gray-500">Imagen no disponible</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Verificación pendiente</h3>
                      <p className="text-center text-gray-500 max-w-md">
                        Aún no se ha realizado la verificación de identidad. 
                        Utilice la videollamada para capturar la imagen del documento.
                      </p>
                      
                      <Button 
                        className="mt-6" 
                        variant="outline"
                        onClick={() => setActiveTab('video')}
                      >
                        Volver a la videollamada
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signature">
              <Card>
                <CardHeader>
                  <CardTitle>Firma Electrónica</CardTitle>
                  <CardDescription>
                    Proceso de firma del documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {signature ? (
                    <div>
                      <div className="mb-4">
                        <Badge variant={
                          signature.status === 'signed' ? 'success' : 
                          signature.status === 'awaiting_signature' ? 'default' :
                          'destructive'
                        }>
                          {signature.status === 'signed' ? 'Firmado' : 
                           signature.status === 'awaiting_signature' ? 'Pendiente de firma' :
                           signature.status === 'declined' ? 'Rechazado' :
                           signature.status === 'expired' ? 'Expirado' : 'Error'}
                        </Badge>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">ID de firma</p>
                        <p className="text-base">{signature.id}</p>
                        
                        {signature.signedAt && (
                          <>
                            <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Fecha y hora de firma</p>
                            <p className="text-base">{new Date(signature.signedAt).toLocaleString()}</p>
                          </>
                        )}
                      </div>
                      
                      {signature.status === 'awaiting_signature' && signature.signingUrl && (
                        <div className="mt-6">
                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertTitle>Firma pendiente</AlertTitle>
                            <AlertDescription>
                              El documento está listo para ser firmado. Utilice el enlace de firma para completar el proceso.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="mt-4">
                            <Button 
                              className="w-full" 
                              onClick={() => window.open(signature.signingUrl, '_blank')}
                            >
                              Abrir enlace de firma
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {signature.status === 'signed' && signature.signedDocumentUrl && (
                        <div className="mt-6">
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Documento firmado</AlertTitle>
                            <AlertDescription>
                              El documento ha sido firmado correctamente.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="mt-4">
                            <Button 
                              className="w-full" 
                              onClick={() => window.open(signature.signedDocumentUrl, '_blank')}
                              variant="outline"
                            >
                              Ver documento firmado
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Firma pendiente</h3>
                      <p className="text-center text-gray-500 max-w-md">
                        El proceso de firma electrónica aún no ha sido iniciado.
                        Primero verifique la identidad del participante y luego inicie el proceso de firma.
                      </p>
                      
                      <Button 
                        className="mt-6" 
                        disabled={!identity?.success}
                        onClick={startSigningProcess}
                      >
                        Iniciar proceso de firma
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="certificate">
              <Card>
                <CardHeader>
                  <CardTitle>Constancia de Certificación</CardTitle>
                  <CardDescription>
                    Documento oficial que certifica el proceso RON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certificate ? (
                    <div>
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-1">ID de constancia</p>
                        <p className="text-base">{certificate.id}</p>
                        
                        <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Documento</p>
                        <p className="text-base">{session?.documentName}</p>
                        
                        <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Participante</p>
                        <p className="text-base">{certificate.participantName}</p>
                        
                        <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Certificador</p>
                        <p className="text-base">{certificate.certifierName}</p>
                        
                        <p className="text-sm font-medium text-gray-500 mb-1 mt-3">Fecha de emisión</p>
                        <p className="text-base">{new Date(certificate.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Código QR de verificación</p>
                          {certificate.qrCodeUrl ? (
                            <div className="border rounded p-4 bg-white">
                              <img 
                                src={certificate.qrCodeUrl} 
                                alt="Código QR de verificación" 
                                className="w-full h-auto max-w-[200px] mx-auto"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-40 bg-gray-100 rounded">
                              <p className="text-gray-500">QR no disponible</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-500 mb-2">Acciones</p>
                          
                          <Button 
                            className="mb-3" 
                            onClick={() => window.open(certificate.certificateUrl, '_blank')}
                            disabled={!certificate.certificateUrl}
                          >
                            Ver constancia
                          </Button>
                          
                          <Button 
                            variant="outline"
                            onClick={() => {
                              // Lógica para descargar la constancia
                              if (certificate.certificateUrl) {
                                const link = document.createElement('a');
                                link.href = certificate.certificateUrl;
                                link.download = `constancia-${certificate.id}.pdf`;
                                link.click();
                              }
                            }}
                            disabled={!certificate.certificateUrl}
                          >
                            Descargar constancia
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Constancia pendiente</h3>
                      <p className="text-center text-gray-500 max-w-md">
                        Aún no se ha generado la constancia de certificación. 
                        Complete el proceso de verificación y firma primero.
                      </p>
                      
                      <Button 
                        className="mt-6" 
                        disabled={!identity?.success}
                        onClick={generateCertificate}
                      >
                        Generar constancia
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RonVideocallPage;