/**
 * PÁGINA DE SESIÓN RON CON JITSI MEET
 * Interfaz completa para videollamadas RON usando Jitsi Meet
 */

import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Video, 
  FileText, 
  User, 
  Clock, 
  Shield, 
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import JitsiMeetComponent from '@/components/jitsi/JitsiMeetComponent';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionInfo {
  session: {
    id: string;
    roomName: string;
    status: string;
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
  };
  certifier: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  client: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  document: {
    id: number;
    title: string;
    documentType: string;
    status: string;
  };
  canJoin: boolean;
  canComplete: boolean;
}

export default function RonJitsiSession() {
  const [match, params] = useRoute('/ron-jitsi/:sessionId');
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [userRole, setUserRole] = useState<'certifier' | 'client'>('client');

  const sessionId = params?.sessionId;

  // Obtener información de la sesión
  const { data: sessionInfo, isLoading, error, refetch } = useQuery<SessionInfo>({
    queryKey: [`/api/ron-jitsi/session/${sessionId}/info`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ron-jitsi/session/${sessionId}/info`);
      return response;
    },
    enabled: !!sessionId,
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });

  // Determinar rol del usuario
  useEffect(() => {
    if (sessionInfo && user) {
      if (sessionInfo.certifier.id === user.id) {
        setUserRole('certifier');
      } else if (sessionInfo.client.id === user.id) {
        setUserRole('client');
      }
    }
  }, [sessionInfo, user]);

  // Mutación para unirse a la sesión
  const joinSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', `/api/ron-jitsi/session/${sessionId}/join`);
    },
    onSuccess: (data) => {
      setSessionStarted(true);
      toast({
        title: "Sesión iniciada",
        description: "Te has unido a la sesión RON exitosamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al unirse a la sesión",
        variant: "destructive"
      });
    }
  });

  const handleSessionEnd = () => {
    setSessionStarted(false);
    toast({
      title: "Sesión finalizada",
      description: "Has salido de la sesión RON"
    });
    
    // Refrescar información de la sesión
    refetch();
  };

  const handleError = (errorMessage: string) => {
    toast({
      title: "Error en videollamada",
      description: errorMessage,
      variant: "destructive"
    });
  };

  if (!match || !sessionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Sesión no encontrada</CardTitle>
            <CardDescription>
              El ID de sesión proporcionado no es válido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/ron-platform')}>
              Volver a RON Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cargando sesión RON...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar sesión</CardTitle>
            <CardDescription>
              {error?.message || 'No se pudo cargar la información de la sesión'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={() => refetch()} variant="outline">
                Reintentar
              </Button>
              <Button onClick={() => setLocation('/ron-platform')}>
                Volver a RON Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/ron-platform')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sesión RON con Jitsi Meet
                </h1>
                <p className="text-gray-600">
                  Notarización Remota Online - Sesión {sessionId}
                </p>
              </div>
            </div>
            <Badge 
              variant={sessionInfo.session.status === 'active' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {sessionInfo.session.status === 'active' ? 'Activa' : 
               sessionInfo.session.status === 'scheduled' ? 'Programada' : 
               sessionInfo.session.status === 'completed' ? 'Completada' : 'Cancelada'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel principal de video */}
          <div className="lg:col-span-3">
            {sessionStarted ? (
              <JitsiMeetComponent
                sessionId={sessionId}
                userRole={userRole}
                onSessionEnd={handleSessionEnd}
                onError={handleError}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="mr-2 h-5 w-5" />
                    Videollamada RON
                  </CardTitle>
                  <CardDescription>
                    Haz clic en "Unirse a Sesión" para comenzar la videollamada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Sesión RON Lista
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Proveedor: Jitsi Meet | Sala: {sessionInfo.session.roomName}
                    </p>
                    
                    {sessionInfo.canJoin ? (
                      <Button
                        onClick={() => joinSessionMutation.mutate()}
                        disabled={joinSessionMutation.isPending}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {joinSessionMutation.isPending ? 'Conectando...' : 'Unirse a Sesión RON'}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-yellow-700">
                          Esta sesión no está disponible para unirse
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral con información */}
          <div className="space-y-4">
            {/* Información del documento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{sessionInfo.document.title}</p>
                  <p className="text-sm text-gray-600">{sessionInfo.document.documentType}</p>
                </div>
                <Badge variant="outline">
                  {sessionInfo.document.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Participantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Participantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Certificador</span>
                    <Badge variant="default">Moderador</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{sessionInfo.certifier.fullName}</p>
                  <p className="text-xs text-gray-500">{sessionInfo.certifier.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cliente</span>
                    <Badge variant="outline">Participante</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{sessionInfo.client.fullName}</p>
                  <p className="text-xs text-gray-500">{sessionInfo.client.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Información de la sesión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Detalles de Sesión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Programada para:</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(sessionInfo.session.scheduledAt), 'PPpp', { locale: es })}
                  </p>
                </div>
                
                {sessionInfo.session.startedAt && (
                  <div>
                    <p className="text-sm font-medium">Iniciada:</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(sessionInfo.session.startedAt), 'PPpp', { locale: es })}
                    </p>
                  </div>
                )}

                {sessionInfo.session.endedAt && (
                  <div>
                    <p className="text-sm font-medium">Finalizada:</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(sessionInfo.session.endedAt), 'PPpp', { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información legal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Marco Legal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                    <span>Conforme a Ley 19.799</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                    <span>Grabación obligatoria</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                    <span>Identificación verificada</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                    <span>Encriptación E2E</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instrucciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Info className="mr-2 h-4 w-4" />
                  Instrucciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {userRole === 'certifier' ? (
                    <>
                      <p>• Verifica la identidad del cliente</p>
                      <p>• Inicia la grabación obligatoria</p>
                      <p>• Revisa el documento a certificar</p>
                      <p>• Completa la certificación al final</p>
                    </>
                  ) : (
                    <>
                      <p>• Ten tu documento de identidad listo</p>
                      <p>• Asegúrate de tener buena iluminación</p>
                      <p>• Mantén la cámara enfocada en tu rostro</p>
                      <p>• Sigue las instrucciones del certificador</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Proveedor: Jitsi Meet</span>
                  <span>•</span>
                  <span>Sesión ID: {sessionId}</span>
                  <span>•</span>
                  <span>Usuario: {user?.fullName} ({userRole})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Sesión Segura</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}