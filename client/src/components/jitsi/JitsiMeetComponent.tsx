/**
 * COMPONENTE JITSI MEET PARA RON
 * Integración completa de Jitsi Meet para videollamadas RON
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Users,
  Record,
  StopCircle,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Declarar JitsiMeetExternalAPI global
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  sessionId: string;
  userRole: 'certifier' | 'client';
  onSessionEnd?: () => void;
  onError?: (error: string) => void;
}

interface JitsiConfig {
  roomName: string;
  domain: string;
  jwt?: string;
  userName: string;
  userEmail: string;
  userRole: 'certifier' | 'client';
}

export default function JitsiMeetComponent({ 
  sessionId, 
  userRole, 
  onSessionEnd, 
  onError 
}: JitsiMeetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [jitsiConfig, setJitsiConfig] = useState<JitsiConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración de Jitsi
  useEffect(() => {
    loadJitsiConfig();
  }, [sessionId]);

  // Inicializar Jitsi cuando la configuración esté lista
  useEffect(() => {
    if (jitsiConfig && jitsiContainerRef.current) {
      initializeJitsi();
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [jitsiConfig]);

  const loadJitsiConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/ron-jitsi/session/${sessionId}/config`);
      
      if (response.success) {
        setJitsiConfig(response.jitsi);
        setError(null);
      } else {
        setError(response.error || 'Error al cargar configuración');
        onError?.(response.error || 'Error al cargar configuración');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      onError?.(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeJitsi = async () => {
    if (!jitsiConfig || !jitsiContainerRef.current) return;

    try {
      // Cargar script de Jitsi si no está cargado
      if (!window.JitsiMeetExternalAPI) {
        await loadJitsiScript();
      }

      // Configuración de Jitsi
      const options = {
        roomName: jitsiConfig.roomName,
        width: '100%',
        height: '600px',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: userRole !== 'certifier',
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          prejoinPageEnabled: true,
          requireDisplayName: true,
          enableRecording: userRole === 'certifier',
          enableLiveStreaming: false,
          enableTranscription: true,
          disableDeepLinking: true,
          defaultLanguage: 'es',
          toolbarButtons: [
            'camera',
            'chat',
            'closedcaptions',
            'desktop',
            'embedmeeting',
            'fullscreen',
            'hangup',
            'microphone',
            'participants-pane',
            'profile',
            'raisehand',
            userRole === 'certifier' ? 'recording' : null,
            'settings',
            'shareaudio',
            'shortcuts',
            'stats',
            'tileview',
            'toggle-camera',
            'videoquality'
          ].filter(Boolean)
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: true,
          BRAND_WATERMARK_LINK: 'https://notarypro.cl',
          SHOW_POWERED_BY: false,
          APP_NAME: 'NotaryPro RON',
          NATIVE_APP_NAME: 'NotaryPro RON',
          DEFAULT_BACKGROUND: '#1e3a8a',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          HIDE_INVITE_MORE_HEADER: false
        },
        userInfo: {
          displayName: `${jitsiConfig.userName} (${userRole === 'certifier' ? 'Certificador' : 'Cliente'})`,
          email: jitsiConfig.userEmail
        }
      };

      // Agregar JWT si está disponible
      if (jitsiConfig.jwt) {
        options.jwt = jitsiConfig.jwt;
      }

      // Crear instancia de Jitsi
      apiRef.current = new window.JitsiMeetExternalAPI(jitsiConfig.domain, options);

      // Event listeners
      apiRef.current.addEventListener('videoConferenceJoined', handleConferenceJoined);
      apiRef.current.addEventListener('videoConferenceLeft', handleConferenceLeft);
      apiRef.current.addEventListener('participantJoined', handleParticipantJoined);
      apiRef.current.addEventListener('participantLeft', handleParticipantLeft);
      apiRef.current.addEventListener('recordingStatusChanged', handleRecordingStatusChanged);

      // Configurar nombre de usuario
      apiRef.current.executeCommand('displayName', jitsiConfig.userName);

    } catch (error: any) {
      console.error('Error inicializando Jitsi:', error);
      setError('Error al inicializar videollamada');
      onError?.('Error al inicializar videollamada');
    }
  };

  const loadJitsiScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://${jitsiConfig?.domain || 'meet.jit.si'}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error cargando script de Jitsi'));
      document.head.appendChild(script);
    });
  };

  // Event handlers
  const handleConferenceJoined = (event: any) => {
    console.log('Usuario unido a conferencia RON:', event);
    setIsConnected(true);
    setParticipants(prev => prev + 1);
    
    toast({
      title: "Conectado",
      description: "Te has unido a la sesión RON exitosamente"
    });
  };

  const handleConferenceLeft = (event: any) => {
    console.log('Usuario salió de conferencia RON:', event);
    setIsConnected(false);
    onSessionEnd?.();
  };

  const handleParticipantJoined = (event: any) => {
    console.log('Participante unido:', event);
    setParticipants(prev => prev + 1);
  };

  const handleParticipantLeft = (event: any) => {
    console.log('Participante salió:', event);
    setParticipants(prev => Math.max(0, prev - 1));
  };

  const handleRecordingStatusChanged = (event: any) => {
    console.log('Estado de grabación cambiado:', event);
    setIsRecording(event.on);
    
    toast({
      title: event.on ? "Grabación iniciada" : "Grabación detenida",
      description: event.on ? 
        "La sesión RON está siendo grabada para fines legales" :
        "La grabación ha sido detenida"
    });
  };

  // Controles de la videollamada
  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const hangUp = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
  };

  const startRecording = async () => {
    try {
      if (userRole === 'certifier' && apiRef.current) {
        apiRef.current.executeCommand('startRecording', {
          mode: 'file',
          dropboxToken: undefined,
          shouldShare: false
        });

        // Notificar al servidor
        await apiRequest('POST', `/api/ron-jitsi/session/${sessionId}/record`, {
          action: 'start'
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al iniciar grabación",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    try {
      if (userRole === 'certifier' && apiRef.current) {
        apiRef.current.executeCommand('stopRecording', 'file');

        // Notificar al servidor
        await apiRequest('POST', `/api/ron-jitsi/session/${sessionId}/record`, {
          action: 'stop'
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al detener grabación",
        variant: "destructive"
      });
    }
  };

  const finishSession = async () => {
    try {
      await apiRequest('POST', `/api/ron-jitsi/session/${sessionId}/finish`, {
        sessionSummary: 'Sesión RON completada exitosamente con Jitsi Meet'
      });

      toast({
        title: "Sesión finalizada",
        description: "La sesión RON ha sido completada y el documento certificado"
      });

      onSessionEnd?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al finalizar sesión",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            Cargando Sesión RON
          </CardTitle>
          <CardDescription>
            Preparando videollamada con Jitsi Meet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error en Sesión RON
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadJitsiConfig} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header de la sesión */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5 text-blue-600" />
                Sesión RON - {userRole === 'certifier' ? 'Certificador' : 'Cliente'}
              </CardTitle>
              <CardDescription>
                Sala: {jitsiConfig?.roomName} | Proveedor: Jitsi Meet
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
              <Badge variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {participants} participantes
              </Badge>
              {isRecording && (
                <Badge variant="destructive">
                  <Record className="mr-1 h-3 w-3" />
                  Grabando
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenedor de Jitsi */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={jitsiContainerRef}
            className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden"
          />
        </CardContent>
      </Card>

      {/* Controles de la sesión */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                disabled={!isConnected}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVideo}
                disabled={!isConnected}
              >
                <Video className="h-4 w-4" />
              </Button>

              {userRole === 'certifier' && (
                <>
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isConnected}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="mr-1 h-4 w-4" />
                        Detener Grabación
                      </>
                    ) : (
                      <>
                        <Record className="mr-1 h-4 w-4" />
                        Iniciar Grabación
                      </>
                    )}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={finishSession}
                    disabled={!isConnected}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Finalizar y Certificar
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (jitsiConfig) {
                    const directUrl = `https://${jitsiConfig.domain}/${jitsiConfig.roomName}`;
                    window.open(directUrl, '_blank');
                  }
                }}
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Abrir en Nueva Ventana
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={hangUp}
                disabled={!isConnected}
              >
                <PhoneOff className="mr-1 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>

          {/* Información de la sesión */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <strong>Sesión ID:</strong> {sessionId}
              </div>
              <div>
                <strong>Rol:</strong> {userRole === 'certifier' ? 'Certificador' : 'Cliente'}
              </div>
              <div>
                <strong>Estado:</strong> {isConnected ? 'Activa' : 'Esperando conexión'}
              </div>
            </div>
            
            {userRole === 'certifier' && (
              <div className="mt-2 text-xs text-blue-700">
                <strong>Nota:</strong> Como certificador, tienes permisos de moderador y puedes controlar la grabación.
                La sesión debe ser grabada para validez legal según la Ley 19.799.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Función auxiliar para cargar el script de Jitsi
const loadJitsiScript = (domain: string = 'meet.jit.si'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      console.log('✅ Script de Jitsi cargado exitosamente');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Jitsi');
      reject(new Error('Error cargando Jitsi Meet'));
    };
    document.head.appendChild(script);
  });
};