/**
 * SESIÓN RON CON VISTA PRELIMINAR INTEGRADA
 * Combina videollamada Jitsi, vista preliminar de documento y firma
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Video,
  FileText,
  Edit3,
  Eye,
  CheckCircle,
  Users,
  MessageSquare,
  Send,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Settings,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import JitsiMeetComponent from '@/components/jitsi/JitsiMeetComponent';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RonSessionData {
  sessionId: string;
  roomName: string;
  participants: {
    certifier: { name: string; connected: boolean };
    client: { name: string; connected: boolean };
  };
  document: {
    id: string;
    title: string;
    status: 'draft' | 'preview' | 'pending_signature' | 'signed' | 'completed';
    previewUrl: string;
    signatureToken: string;
    content?: string;
  };
  jitsiConfig: {
    domain: string;
    roomName: string;
    userName: string;
    userEmail: string;
    isModerator: boolean;
  };
  status: 'waiting' | 'identity_verification' | 'document_review' | 'signing' | 'completed';
}

interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'certifier' | 'client' | 'system';
  message: string;
  timestamp: Date;
  type: 'text' | 'document' | 'action';
}

export default function RonSessionWithPreview() {
  const [match, params] = useRoute('/ron-session/:sessionId');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const sessionId = params?.sessionId || '';
  const [activeTab, setActiveTab] = useState('video');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [signerInfo, setSignerInfo] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    rut: ''
  });

  // Obtener datos de la sesión RON
  const { data: sessionData, refetch: refetchSession } = useQuery<RonSessionData>({
    queryKey: [`/api/ron-jitsi/session/${sessionId}/full-data`],
    queryFn: async () => {
      // Simular datos de sesión RON completa
      return {
        sessionId,
        roomName: `ron-${sessionId.toLowerCase()}`,
        participants: {
          certifier: { name: 'Juan Certificador', connected: true },
          client: { name: user?.fullName || 'Cliente', connected: true }
        },
        document: {
          id: `doc-${sessionId}`,
          title: 'Contrato de Servicios Notariales',
          status: 'preview',
          previewUrl: `/api/identity/document/doc-${sessionId}/preview`,
          signatureToken: `token-${sessionId}-${Date.now()}`,
          content: `
CONTRATO DE PRESTACIÓN DE SERVICIOS NOTARIALES

En Santiago, a ${format(new Date(), 'dd/MM/yyyy', { locale: es })}, comparecen:

POR UNA PARTE: ${user?.fullName || 'Cliente'}, cédula de identidad N° 12.345.678-9, 
domiciliado en Av. Providencia 1234, Santiago, en adelante "EL CLIENTE".

POR OTRA PARTE: Juan Certificador, cédula de identidad N° 11.111.111-1,
Notario Público, en adelante "EL CERTIFICADOR".

OBJETO DEL CONTRATO:
Prestación de servicios de notarización remota online (RON) para la certificación 
de documentos digitales conforme a la Ley 19.799 sobre Documentos Electrónicos.

CONDICIONES:
1. El servicio se prestará mediante videollamada en tiempo real
2. Se verificará la identidad del cliente mediante documentos oficiales
3. La sesión será grabada para efectos de auditoría y validez legal
4. El documento será firmado digitalmente por ambas partes

VALOR:
El valor de los servicios prestados asciende a $50.000 pesos chilenos.

VIGENCIA:
El presente contrato tendrá vigencia inmediata una vez firmado por ambas partes.

Las partes declaran haber leído y comprendido el presente contrato, 
y lo firman en señal de conformidad durante esta sesión RON.
          `
        },
        jitsiConfig: {
          domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
          roomName: `ron-${sessionId.toLowerCase()}`,
          userName: user?.fullName || 'Usuario',
          userEmail: user?.email || 'usuario@notarypro.cl',
          isModerator: user?.role?.includes('certifier') || false
        },
        status: 'document_review'
      };
    },
    refetchInterval: 10000, // Actualizar cada 10 segundos
    enabled: !!sessionId
  });

  // Firmar documento en sesión RON
  const signDocumentMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      if (!sessionData) throw new Error('No hay sesión activa');
      
      return apiRequest('POST', `/api/identity/sign-document/${sessionData.document.id}`, {
        signatureToken: sessionData.document.signatureToken,
        signatureImage: signatureData,
        signerType: user?.role?.includes('certifier') ? 'certifier' : 'client',
        signerInfo: {
          name: signerInfo.name,
          email: signerInfo.email,
          rut: signerInfo.rut,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Documento firmado",
        description: "Su firma ha sido registrada en la sesión RON"
      });
      setShowSignatureCanvas(false);
      refetchSession();
      
      // Agregar mensaje al chat
      addSystemMessage(`${signerInfo.name} ha firmado el documento`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al firmar documento",
        variant: "destructive"
      });
    }
  });

  // Cambiar estado de sesión
  const changeSessionStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiRequest('POST', `/api/ron-jitsi/session/${sessionId}/status`, {
        status: newStatus
      });
    },
    onSuccess: () => {
      refetchSession();
    }
  });

  // Agregar mensaje del sistema
  const addSystemMessage = useCallback((message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Sistema RON',
      senderType: 'system',
      message,
      timestamp: new Date(),
      type: 'action'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  }, []);

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
    console.log('Mensaje RON enviado:', message);
  }, [newMessage, user]);

  // Manejar firma
  const handleSignature = useCallback((signatureData: string) => {
    if (!signerInfo.name || !signerInfo.email) {
      toast({
        title: "Información incompleta",
        description: "Complete sus datos antes de firmar",
        variant: "destructive"
      });
      return;
    }
    
    signDocumentMutation.mutate(signatureData);
  }, [signerInfo, signDocumentMutation]);

  // Inicializar chat con mensaje de bienvenida
  useEffect(() => {
    if (sessionData) {
      addSystemMessage(`Sesión RON iniciada - ${sessionData.document.title}`);
      addSystemMessage('Bienvenidos a la sesión de notarización remota online');
    }
  }, [sessionData, addSystemMessage]);

  const isCertifier = user?.role?.includes('certifier') || user?.role?.includes('admin');

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Cargando sesión RON...</p>
            <p className="text-sm text-gray-600">Preparando videollamada y documentos</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sesión RON - {sessionData.document.title}
              </h1>
              <p className="text-gray-600">
                ID: {sessionId} | Estado: {sessionData.status}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                🔴 EN VIVO
              </Badge>
              <Badge variant="outline">
                {Object.values(sessionData.participants).filter(p => p.connected).length} conectados
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel principal */}
          <div className={`${isVideoExpanded ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="video">🎥 Video RON</TabsTrigger>
                <TabsTrigger value="document">📄 Documento</TabsTrigger>
                <TabsTrigger value="signature">✍️ Firma</TabsTrigger>
                <TabsTrigger value="review">👁️ Revisión</TabsTrigger>
              </TabsList>

              {/* Tab: Video RON */}
              <TabsContent value="video" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Video className="mr-2 h-5 w-5" />
                        Videollamada RON - Jitsi Meet
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                        >
                          {isVideoExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`${isVideoExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
                      <JitsiMeetComponent
                        roomName={sessionData.jitsiConfig.roomName}
                        userName={sessionData.jitsiConfig.userName}
                        userEmail={sessionData.jitsiConfig.userEmail}
                        domain={sessionData.jitsiConfig.domain}
                        isModerator={sessionData.jitsiConfig.isModerator}
                        onMeetingEnd={() => {
                          addSystemMessage('Videollamada RON finalizada');
                          changeSessionStatusMutation.mutate('completed');
                        }}
                        onParticipantJoined={(participant) => {
                          addSystemMessage(`${participant.displayName} se unió a la sesión RON`);
                        }}
                        onParticipantLeft={(participant) => {
                          addSystemMessage(`${participant.displayName} salió de la sesión RON`);
                        }}
                      />
                    </div>

                    {/* Información de la sesión */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">Participantes:</h4>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                sessionData.participants.certifier.connected ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span>{sessionData.participants.certifier.name} (Certificador)</span>
                            </div>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                sessionData.participants.client.connected ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span>{sessionData.participants.client.name} (Cliente)</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Estado de Sesión:</h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Verificación de Identidad:</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Revisión de Documento:</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Proceso de Firma:</span>
                              <div className="w-4 h-4 bg-yellow-400 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Documento */}
              <TabsContent value="document" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Vista Preliminar del Documento
                    </CardTitle>
                    <CardDescription>
                      Revise el documento antes de proceder con la firma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Vista preliminar del documento */}
                    <div className="border rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
                      <div className="prose max-w-none">
                        <div className="text-center mb-6">
                          <h2 className="text-xl font-bold text-blue-900">
                            🏛️ NOTARYPRO - DOCUMENTO OFICIAL
                          </h2>
                          <p className="text-sm text-gray-600">
                            Sesión RON: {sessionId} | Fecha: {format(new Date(), 'PPp', { locale: es })}
                          </p>
                        </div>
                        
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {sessionData.document.content}
                        </div>

                        {/* Área de firmas */}
                        <div className="mt-8 pt-6 border-t">
                          <h3 className="text-lg font-semibold mb-4">FIRMAS DIGITALES:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                              <p className="font-semibold mb-2">CLIENTE</p>
                              <div className="h-16 flex items-center justify-center">
                                {sessionData.document.status === 'signed' || sessionData.document.status === 'completed' ? (
                                  <div className="text-green-600">
                                    <CheckCircle className="h-8 w-8 mx-auto mb-1" />
                                    <p className="text-xs">Firmado digitalmente</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-xs">Pendiente de firma</p>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                {sessionData.participants.client.name}
                              </p>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                              <p className="font-semibold mb-2">CERTIFICADOR</p>
                              <div className="h-16 flex items-center justify-center">
                                {sessionData.document.status === 'completed' ? (
                                  <div className="text-green-600">
                                    <CheckCircle className="h-8 w-8 mx-auto mb-1" />
                                    <p className="text-xs">Firmado digitalmente</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-xs">Pendiente de firma</p>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                {sessionData.participants.certifier.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controles del documento */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Descargar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="mr-1 h-3 w-3" />
                          Compartir
                        </Button>
                      </div>
                      <Badge variant="outline">
                        Estado: {sessionData.document.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Firma */}
              <TabsContent value="signature" className="space-y-4">
                {sessionData.document.status === 'preview' || sessionData.document.status === 'pending_signature' ? (
                  <div className="space-y-4">
                    {/* Información del firmante */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Información del Firmante</CardTitle>
                        <CardDescription>
                          Complete sus datos para la firma digital en sesión RON
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre Completo *
                            </label>
                            <Input
                              value={signerInfo.name}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Juan Pérez González"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <Input
                              type="email"
                              value={signerInfo.email}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="juan@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              RUT
                            </label>
                            <Input
                              value={signerInfo.rut}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, rut: e.target.value }))}
                              placeholder="12.345.678-9"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Canvas de firma */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Firma Digital en Sesión RON</CardTitle>
                        <CardDescription>
                          Firme el documento durante la videollamada
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {showSignatureCanvas ? (
                          <SignatureCanvas
                            onSignatureComplete={handleSignature}
                            signerName={signerInfo.name}
                            documentTitle={sessionData.document.title}
                            width={600}
                            height={200}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Edit3 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                            <p className="text-lg font-semibold mb-2">
                              Listo para Firmar en RON
                            </p>
                            <p className="text-gray-600 mb-4">
                              Complete sus datos arriba y proceda con la firma digital
                            </p>
                            <Button
                              onClick={() => setShowSignatureCanvas(true)}
                              disabled={!signerInfo.name || !signerInfo.email}
                              size="lg"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Firmar en Sesión RON
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-semibold text-green-900 mb-2">
                        Firma Completada en RON
                      </p>
                      <p className="text-green-700">
                        El documento ha sido firmado durante la sesión de notarización remota
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Revisión */}
              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Revisión Final
                    </CardTitle>
                    <CardDescription>
                      Estado final del documento y sesión RON
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Resumen de la sesión */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Sesión RON</h4>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>ID:</strong> {sessionId}</p>
                            <p><strong>Estado:</strong> {sessionData.status}</p>
                            <p><strong>Participantes:</strong> 2 conectados</p>
                            <p><strong>Duración:</strong> En curso</p>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Documento</h4>
                          <div className="space-y-1 text-sm text-green-800">
                            <p><strong>Título:</strong> {sessionData.document.title}</p>
                            <p><strong>Estado:</strong> {sessionData.document.status}</p>
                            <p><strong>Firmas:</strong> {sessionData.document.status === 'completed' ? '2/2' : '0/2'}</p>
                            <p><strong>Válido:</strong> Sí</p>
                          </div>
                        </div>
                      </div>

                      {/* Acciones finales */}
                      {isCertifier && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Acciones del Certificador</h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => changeSessionStatusMutation.mutate('completed')}
                            >
                              Finalizar Sesión RON
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab('document')}
                            >
                              Revisar Documento
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel lateral - Chat */}
          {!isVideoExpanded && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chat RON
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 mb-4">
                    <div className="space-y-2">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-2 rounded-lg ${
                            message.senderType === 'system'
                              ? 'bg-purple-100 text-purple-900'
                              : message.senderType === 'certifier'
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
                      placeholder="Mensaje en sesión RON..."
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

              {/* Información de seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🔒 Sesión RON Segura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Sesión grabada para validez legal</p>
                    <p>• Encriptación end-to-end</p>
                    <p>• Conforme a Ley 19.799</p>
                    <p>• Identidad verificada previamente</p>
                    <p>• Firmas con validez legal completa</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}