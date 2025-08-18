/**
 * PÁGINA DE SESIÓN COLABORATIVA CERTIFICADOR-CLIENTE
 * Interfaz para sesión en tiempo real entre certificador y cliente
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  FileText,
  Edit,
  Eye,
  Send,
  MessageSquare,
  Share2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import SignatureCanvas from '@/components/signature/SignatureCanvas';

interface SessionParticipant {
  type: 'certifier' | 'client';
  name: string;
  connected: boolean;
  role: string;
}

interface SessionDocument {
  id: string;
  title: string;
  status: string;
  previewUrl: string;
  signatureToken?: string;
}

interface SessionStatus {
  id: string;
  status: 'waiting' | 'active' | 'document_review' | 'signing' | 'completed';
  participants: SessionParticipant[];
  currentStep: string;
  steps: Record<string, any>;
  documents: SessionDocument[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'certifier' | 'client';
  message: string;
  timestamp: Date;
  type: 'text' | 'document' | 'action';
}

export default function CertifierClientSession() {
  const [match, params] = useRoute('/session/:sessionId');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const sessionId = params?.sessionId || '';
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SessionDocument | null>(null);
  const [documentVariables, setDocumentVariables] = useState<Record<string, any>>({});
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

  // Obtener estado de sesión
  const { data: sessionStatus, refetch: refetchSession } = useQuery<SessionStatus>({
    queryKey: [`/api/identity/session/${sessionId}/status`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/identity/session/${sessionId}/status`);
      return response.session;
    },
    refetchInterval: 5000, // Actualizar cada 5 segundos
    enabled: !!sessionId
  });

  // Ejecutar acción en sesión
  const sessionActionMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      return apiRequest('POST', `/api/identity/session/${sessionId}/action`, {
        action,
        data
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Acción ejecutada",
        description: `${data.action.action} realizada exitosamente`
      });
      refetchSession();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al ejecutar acción",
        variant: "destructive"
      });
    }
  });

  // Crear documento
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return apiRequest('POST', '/api/identity/create-document', {
        templateId: 1,
        clientId: sessionStatus?.participants.find(p => p.type === 'client')?.id || 1,
        documentData
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Documento creado",
        description: "Documento generado exitosamente"
      });
      refetchSession();
      setActiveTab('documents');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear documento",
        variant: "destructive"
      });
    }
  });

  // Enviar vista preliminar
  const sendPreviewMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const client = sessionStatus?.participants.find(p => p.type === 'client');
      return apiRequest('POST', `/api/identity/send-preview/${documentId}`, {
        clientEmail: 'cliente@test.com' // En implementación real, obtener del participante
      });
    },
    onSuccess: () => {
      toast({
        title: "Vista preliminar enviada",
        description: "El cliente ha recibido el documento para revisión"
      });
      refetchSession();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al enviar vista preliminar",
        variant: "destructive"
      });
    }
  });

  // Enviar mensaje de chat
  const sendChatMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: user?.fullName || 'Usuario',
      senderType: user?.role?.includes('certifier') ? 'certifier' : 'client',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // En implementación real, enviar por WebSocket
    console.log('Mensaje enviado:', message);
  }, [newMessage, user]);

  // Manejar firma
  const handleSignature = useCallback((signatureData: string) => {
    if (!selectedDocument) return;

    // Procesar firma
    const signaturePayload = {
      signatureToken: selectedDocument.signatureToken,
      signatureImage: signatureData,
      signerType: user?.role?.includes('certifier') ? 'certifier' : 'client',
      signerInfo: {
        name: user?.fullName,
        email: user?.email,
        role: user?.role
      }
    };

    // En implementación real, enviar a API
    console.log('Firma capturada:', signaturePayload);
    
    toast({
      title: "Firma capturada",
      description: "Su firma ha sido registrada exitosamente"
    });

    setShowSignatureCanvas(false);
    refetchSession();
  }, [selectedDocument, user, toast, refetchSession]);

  // Determinar si es certificador
  const isCertifier = user?.role?.includes('certifier') || user?.role?.includes('admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sesión Colaborativa RON
              </h1>
              <p className="text-gray-600">
                Sesión ID: {sessionId} | Estado: {sessionStatus?.status || 'Cargando...'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={sessionStatus?.status === 'active' ? 'default' : 'secondary'}>
                {sessionStatus?.status === 'active' ? 'Activa' : 'En espera'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSession()}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  Sesión de Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Videollamada RON</p>
                    <p className="text-sm opacity-75">
                      {sessionStatus?.participants.filter(p => p.connected).length || 0} participantes conectados
                    </p>
                  </div>
                </div>
                
                {/* Controles de video */}
                <div className="flex justify-center space-x-4 mt-4">
                  <Button
                    variant={isCameraOn ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isMicOn ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs principales */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="signature">Firma</TabsTrigger>
                <TabsTrigger value="actions">Acciones</TabsTrigger>
              </TabsList>

              {/* Tab: Resumen */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de la Sesión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progreso de pasos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(sessionStatus?.steps || {}).map(([step, data]: [string, any]) => (
                          <div
                            key={step}
                            className={`p-3 rounded-lg border ${
                              data.completed
                                ? 'bg-green-50 border-green-200'
                                : data.active
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              {data.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              ) : data.active ? (
                                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span className="text-sm font-medium">
                                {step.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Participantes */}
                      <div>
                        <h4 className="font-semibold mb-2">Participantes</h4>
                        <div className="space-y-2">
                          {sessionStatus?.participants.map((participant, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="font-medium">{participant.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {participant.type}
                                </Badge>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${
                                participant.connected ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Documentos */}
              <TabsContent value="documents" className="space-y-4">
                {isCertifier && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Crear Documento</CardTitle>
                      <CardDescription>
                        Generar nuevo documento para la sesión
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Título del documento"
                          value={documentVariables.title || ''}
                          onChange={(e) => setDocumentVariables(prev => ({
                            ...prev,
                            title: e.target.value
                          }))}
                        />
                        <Input
                          placeholder="Nombre del cliente"
                          value={documentVariables.nombreCliente || ''}
                          onChange={(e) => setDocumentVariables(prev => ({
                            ...prev,
                            nombreCliente: e.target.value
                          }))}
                        />
                        <Input
                          placeholder="RUT del cliente"
                          value={documentVariables.cedulaCliente || ''}
                          onChange={(e) => setDocumentVariables(prev => ({
                            ...prev,
                            cedulaCliente: e.target.value
                          }))}
                        />
                        <Input
                          placeholder="Valor del contrato"
                          type="number"
                          value={documentVariables.valor || ''}
                          onChange={(e) => setDocumentVariables(prev => ({
                            ...prev,
                            valor: e.target.value
                          }))}
                        />
                      </div>
                      
                      <Textarea
                        placeholder="Objeto del contrato"
                        value={documentVariables.objetoContrato || ''}
                        onChange={(e) => setDocumentVariables(prev => ({
                          ...prev,
                          objetoContrato: e.target.value
                        }))}
                        rows={3}
                      />

                      <Button
                        onClick={() => createDocumentMutation.mutate({
                          title: documentVariables.title || 'Contrato de Servicios',
                          variables: {
                            ciudad: 'Santiago',
                            fecha: new Date().toLocaleDateString('es-CL'),
                            nombreCertificador: user?.fullName || 'Certificador',
                            cedulaCertificador: '11.111.111-1',
                            ...documentVariables
                          }
                        })}
                        disabled={createDocumentMutation.isPending}
                        className="w-full"
                      >
                        {createDocumentMutation.isPending ? 'Creando...' : 'Crear Documento'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de documentos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos de la Sesión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionStatus?.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-gray-600">Estado: {doc.status}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isCertifier && doc.status === 'preview' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendPreviewMutation.mutate(doc.id)}
                                disabled={sendPreviewMutation.isPending}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Firma */}
              <TabsContent value="signature" className="space-y-4">
                {selectedDocument ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Firmar Documento</CardTitle>
                        <CardDescription>
                          Documento: {selectedDocument.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {showSignatureCanvas ? (
                          <SignatureCanvas
                            onSignatureComplete={handleSignature}
                            signerName={user?.fullName}
                            documentTitle={selectedDocument.title}
                            width={600}
                            height={200}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold mb-2">
                              Listo para Firmar
                            </p>
                            <p className="text-gray-600 mb-4">
                              Haga clic para abrir el canvas de firma
                            </p>
                            <Button
                              onClick={() => setShowSignatureCanvas(true)}
                              size="lg"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Abrir Canvas de Firma
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold mb-2">
                        Seleccione un Documento
                      </p>
                      <p className="text-gray-600">
                        Vaya a la pestaña Documentos y seleccione un documento para firmar
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Acciones */}
              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Sesión</CardTitle>
                    <CardDescription>
                      Controlar el flujo de la sesión
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isCertifier && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => sessionActionMutation.mutate({ action: 'start_document_review' })}
                            disabled={sessionActionMutation.isPending}
                          >
                            Iniciar Revisión
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => sessionActionMutation.mutate({ action: 'approve_document' })}
                            disabled={sessionActionMutation.isPending}
                          >
                            Aprobar Documento
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => sessionActionMutation.mutate({ action: 'start_signature_process' })}
                            disabled={sessionActionMutation.isPending}
                          >
                            Iniciar Firmas
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => sessionActionMutation.mutate({ action: 'finish_session' })}
                            disabled={sessionActionMutation.isPending}
                          >
                            Finalizar Sesión
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => sessionActionMutation.mutate({ action: 'request_changes' })}
                        disabled={sessionActionMutation.isPending}
                      >
                        Solicitar Cambios
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => sessionActionMutation.mutate({ action: 'complete_signature' })}
                        disabled={sessionActionMutation.isPending}
                      >
                        Completar Firma
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Chat de Sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 mb-4">
                  <div className="space-y-2">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 rounded-lg ${
                          message.senderType === 'certifier'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold">{message.sender}</span>
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Escribir mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button size="sm" onClick={sendChatMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información de sesión */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p><strong>Sesión:</strong> {sessionId}</p>
                  <p><strong>Iniciada:</strong> {sessionStatus?.createdAt ? new Date(sessionStatus.createdAt).toLocaleString() : 'N/A'}</p>
                  <p><strong>Actualizada:</strong> {sessionStatus?.updatedAt ? new Date(sessionStatus.updatedAt).toLocaleString() : 'N/A'}</p>
                  <p><strong>Paso actual:</strong> {sessionStatus?.currentStep || 'N/A'}</p>
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600">
                    Esta sesión está siendo grabada para fines legales y de auditoría conforme a la normativa vigente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}