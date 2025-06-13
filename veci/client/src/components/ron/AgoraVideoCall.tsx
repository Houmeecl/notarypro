import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff, Camera, CameraOff, PhoneOff, Image } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AgoraVideoCallProps {
  sessionId: string;
  role: 'host' | 'audience'; // host = certifier, audience = client
  onCaptureIdentity?: (image: Blob) => void;
  onCallEnded?: () => void;
}

const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({ 
  sessionId, 
  role, 
  onCaptureIdentity,
  onCallEnded
}) => {
  // Referencias para contenedores de video
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  
  // Controles de estado
  const [loading, setLoading] = useState<boolean>(true);
  const [joined, setJoined] = useState<boolean>(false);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({
    videoTrack: null,
    audioTrack: null
  });
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  
  // Estados de control de dispositivos
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Configuración inicial
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Obtener token del servidor
        const response = await apiRequest("GET", `/api/ron/session/${sessionId}/video-tokens`);
        const data = await response.json();
        
        if (!data.token) {
          throw new Error('No se pudo obtener el token de video');
        }
        
        const { token, channelName } = data;
        
        // Inicializar cliente Agora
        const agoraClient = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8'
        });
        
        setClient(agoraClient);
        
        // Configurar eventos de cliente
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-unpublished', handleUserUnpublished);
        agoraClient.on('user-joined', handleUserJoined);
        agoraClient.on('user-left', handleUserLeft);
        agoraClient.on('exception', handleException);
        
        // Unirse al canal
        const uid = await agoraClient.join(
          import.meta.env.VITE_AGORA_APP_ID,
          channelName,
          token.token,
          undefined // Usar uid generado por Agora
        );
        
        console.log('Joined channel:', channelName, 'with UID:', uid);
        
        // Inicializar dispositivos locales
        if (role === 'host' || role === 'audience') {
          const [audioTrack, videoTrack] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack()
          ]);
          
          setLocalTracks({
            audioTrack,
            videoTrack
          });
          
          // Mostrar video local
          if (videoTrack && localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
          
          // Publicar tracks para que otros usuarios puedan ver/escuchar
          await agoraClient.publish([audioTrack, videoTrack]);
          console.log('Local tracks published');
        }
        
        setJoined(true);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing Agora:', error);
        setError('Error al inicializar la videollamada: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        setLoading(false);
      }
    };
    
    init();
    
    // Limpieza al desmontar
    return () => {
      leaveCall();
    };
  }, [sessionId, role]);
  
  // Manejar cuando un usuario remoto publica video/audio
  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    await client?.subscribe(user, mediaType);
    
    setRemoteUsers(prev => {
      if (prev.findIndex(u => u.uid === user.uid) === -1) {
        return [...prev, user];
      }
      return prev;
    });
    
    if (mediaType === 'video' && user.videoTrack && remoteVideoRef.current) {
      // Pequeño tiempo de espera para asegurar que el contenedor esté listo
      setTimeout(() => {
        if (user.videoTrack && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      }, 100);
    }
    
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  };
  
  // Manejar cuando un usuario remoto deja de publicar video/audio
  const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
    // No necesitamos hacer nada especial aquí más que notificar
    console.log('User unpublished:', user.uid);
  };
  
  // Manejar cuando un usuario se une
  const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
    console.log('User joined:', user.uid);
  };
  
  // Manejar cuando un usuario se va
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    console.log('User left:', user.uid);
  };
  
  // Manejar excepciones
  const handleException = (event: any) => {
    console.error('Agora exception:', event);
    setError('Error en la videollamada: ' + event.msg);
  };
  
  // Alternar micrófono
  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      if (micEnabled) {
        await localTracks.audioTrack.setEnabled(false);
      } else {
        await localTracks.audioTrack.setEnabled(true);
      }
      setMicEnabled(!micEnabled);
    }
  };
  
  // Alternar cámara
  const toggleCamera = async () => {
    if (localTracks.videoTrack) {
      if (cameraEnabled) {
        await localTracks.videoTrack.setEnabled(false);
      } else {
        await localTracks.videoTrack.setEnabled(true);
      }
      setCameraEnabled(!cameraEnabled);
    }
  };
  
  // Capturar imagen de documento de identidad
  const captureIdentityDocument = async () => {
    if (!localTracks.videoTrack) return;
    
    try {
      // Tomar captura de la cámara remota
      const frameBlob = await captureVideoFrame();
      
      if (frameBlob && onCaptureIdentity) {
        onCaptureIdentity(frameBlob);
      }
    } catch (error) {
      console.error('Error capturando documento:', error);
      setError('Error al capturar documento de identidad');
    }
  };
  
  // Función auxiliar para capturar un frame de video
  const captureVideoFrame = async (): Promise<Blob | null> => {
    // Si hay un usuario remoto con video, capturar su frame
    if (remoteUsers.length > 0 && remoteUsers[0].videoTrack) {
      return new Promise((resolve) => {
        remoteUsers[0].videoTrack?.createScreenshot()
          .then(screenshot => {
            // Convertir data URL a Blob
            fetch(screenshot)
              .then(res => res.blob())
              .then(blob => resolve(blob))
              .catch(error => {
                console.error('Error converting screenshot to blob:', error);
                resolve(null);
              });
          })
          .catch(error => {
            console.error('Error creating screenshot:', error);
            resolve(null);
          });
      });
    }
    
    return null;
  };
  
  // Salir de la llamada
  const leaveCall = async () => {
    try {
      // Detener y cerrar tracks locales
      if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
      }
      
      if (localTracks.videoTrack) {
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      
      // Salir del canal
      await client?.leave();
      
      setJoined(false);
      setRemoteUsers([]);
      setLocalTracks({ videoTrack: null, audioTrack: null });
      
      if (onCallEnded) {
        onCallEnded();
      }
      
      console.log('Left channel successfully');
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };
  
  // Renderizado condicional durante carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Iniciando videollamada...</p>
      </div>
    );
  }
  
  // Renderizado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg text-red-600 p-6">
        <p className="font-bold">Error</p>
        <p className="text-center mt-2">{error}</p>
        <Button 
          className="mt-4"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg bg-gray-100 overflow-hidden">
      {/* Área de videos */}
      <div className="relative h-[500px] bg-black">
        {/* Video remoto (grande) */}
        <div 
          ref={remoteVideoRef} 
          className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center"
        >
          {remoteUsers.length === 0 && (
            <div className="text-white text-center">
              <p>Esperando a que otros participantes se unan...</p>
            </div>
          )}
        </div>
        
        {/* Video local (pequeño, esquina) */}
        <div 
          ref={localVideoRef}
          className="absolute bottom-4 right-4 w-56 h-36 bg-gray-900 rounded overflow-hidden border-2 border-white shadow-lg"
        />
      </div>
      
      {/* Controles de videollamada */}
      <div className="p-4 bg-gray-200 flex items-center justify-center space-x-4">
        <Button
          variant={micEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full p-3 h-12 w-12"
          onClick={toggleMic}
        >
          {micEnabled ? <Mic /> : <MicOff />}
        </Button>
        
        <Button
          variant={cameraEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full p-3 h-12 w-12"
          onClick={toggleCamera}
        >
          {cameraEnabled ? <Camera /> : <CameraOff />}
        </Button>
        
        {role === 'host' && onCaptureIdentity && (
          <Button
            variant="default"
            size="lg"
            className="rounded-full p-3 h-12 w-12 bg-green-600 hover:bg-green-700"
            onClick={captureIdentityDocument}
          >
            <Image />
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="lg"
          className="rounded-full p-3 h-12 w-12"
          onClick={leaveCall}
        >
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
};

export default AgoraVideoCall;