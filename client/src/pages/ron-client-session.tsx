import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Video, Mic, MicOff, VideoOff, Camera } from 'lucide-react';

// Declaración para el SDK de Agora (se carga vía CDN)
declare global {
  interface Window {
    AgoraRTC: any;
  }
}

export default function RonClientSession() {
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [agoraSDKLoaded, setAgoraSDKLoaded] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const localPlayerRef = useRef<HTMLDivElement>(null);
  const remotePlayerRef = useRef<HTMLDivElement>(null);
  
  // Referencias para la conexión de Agora
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

  // Cargar el SDK de Agora
  useEffect(() => {
    const loadAgoraSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Agora SDK cargado correctamente');
        setAgoraSDKLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Error al cargar Agora SDK');
        toast({
          title: 'Error al cargar la biblioteca de videollamadas',
          description: 'Por favor, recarga la página e intenta nuevamente',
          variant: 'destructive'
        });
      };
      
      document.body.appendChild(script);
    };
    
    loadAgoraSDK();
    
    return () => {
      // Limpiar la conexión cuando el componente se desmonte
      leaveSession();
    };
  }, []);

  const joinSession = async () => {
    if (!accessCode || !accessCode.startsWith('RON-')) {
      toast({
        title: 'Código inválido',
        description: 'Por favor ingresa un código válido (formato: RON-XXXXX)',
        variant: 'destructive'
      });
      return;
    }
    
    if (!agoraSDKLoaded) {
      toast({
        title: 'Sistema de videollamada no disponible',
        description: 'Por favor, recarga la página e intenta nuevamente',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Verificar el código RON con nuestro backend
      const sessionId = accessCode;
      const response = await fetch(`/api/ron/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Código RON inválido o sesión no encontrada');
      }
      
      const sessionData = await response.json();
      setSessionDetails(sessionData);
      
      // 2. Conseguir tokens de video para la sesión
      const tokenResponse = await fetch(`/api/ron/session/${sessionId}/video-tokens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!tokenResponse.ok) {
        throw new Error('No se pudieron obtener credenciales para la videollamada');
      }
      
      const tokenData = await tokenResponse.json();
      
      // 3. Inicializar Agora y unirse al canal
      const client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;
      
      // Configuración de eventos
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      
      // Unirse al canal
      const { token, channelName, userId } = tokenData;
      
      // App ID se configura en el servidor
      const APP_ID = process.env.VITE_AGORA_APP_ID;
      
      // Conexión con Agora
      await client.join(
        APP_ID, 
        channelName, 
        token,
        userId || null
      );
      
      // Crear y publicar tracks
      const localTracks = await window.AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = localTracks;
      
      const localAudioTrack = localTracks[0];
      const localVideoTrack = localTracks[1];
      
      // Mostrar el video local
      localVideoTrack.play(localPlayerRef.current);
      
      // Publicar los tracks
      await client.publish([localAudioTrack, localVideoTrack]);
      
      setConnected(true);
      
      toast({
        title: 'Conectado a la sesión',
        description: 'Sesión RON iniciada correctamente',
      });
      
    } catch (error) {
      console.error('Error al unirse a la sesión RON:', error);
      toast({
        title: 'Error al conectar',
        description: (error as Error).message || 'Hubo un problema al conectar a la sesión RON',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async () => {
    if (clientRef.current) {
      // Detener y liberar tracks
      if (localTracksRef.current.length > 0) {
        localTracksRef.current.forEach((track) => {
          if (track) {
            track.stop();
            track.close();
          }
        });
        localTracksRef.current = [];
      }
      
      // Abandonar el canal
      await clientRef.current.leave();
    }
    
    setConnected(false);
    setSessionDetails(null);
  };

  const handleUserPublished = async (user: any, mediaType: string) => {
    if (!clientRef.current) return;
    
    // Suscribirse al usuario remoto
    await clientRef.current.subscribe(user, mediaType);
    
    if (mediaType === 'video' && remotePlayerRef.current) {
      user.videoTrack.play(remotePlayerRef.current);
    }
    
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user: any, mediaType: string) => {
    // Cuando un usuario detiene su video o audio
    if (mediaType === 'video' && remotePlayerRef.current) {
      remotePlayerRef.current.innerHTML = '';
    }
  };

  const toggleVideo = async () => {
    if (!connected || localTracksRef.current.length < 2) return;
    
    const videoTrack = localTracksRef.current[1];
    if (videoEnabled) {
      await videoTrack.setEnabled(false);
    } else {
      await videoTrack.setEnabled(true);
    }
    
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = async () => {
    if (!connected || localTracksRef.current.length < 1) return;
    
    const audioTrack = localTracksRef.current[0];
    if (audioEnabled) {
      await audioTrack.setEnabled(false);
    } else {
      await audioTrack.setEnabled(true);
    }
    
    setAudioEnabled(!audioEnabled);
  };

  const captureSnapshot = async () => {
    if (connected && clientRef.current && localTracksRef.current.length > 1) {
      try {
        // Capturar imagen del video local
        const videoTrack = localTracksRef.current[1];
        const frame = videoTrack.getCurrentFrameData();
        
        // Convertir a imagen
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        ctx?.putImageData(frame, 0, 0);
        
        // Convertir a base64
        const imageBase64 = canvas.toDataURL('image/jpeg');
        
        // Enviar al servidor (esto se implementaría según necesidades)
        toast({
          title: 'Imagen capturada',
          description: 'Se capturó una imagen para verificación',
        });
        
        // Aquí se podría enviar la imagen al servidor
      } catch (error) {
        console.error('Error al capturar imagen:', error);
        toast({
          title: 'Error al capturar imagen',
          description: 'No se pudo capturar la imagen para verificación',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Sesión de Certificación RON</h1>
      
      {!connected ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Acceso a sesión RON</CardTitle>
            <CardDescription>
              Ingresa el código que recibiste para iniciar tu sesión de certificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="accessCode" className="text-sm font-medium">
                  Código de acceso
                </label>
                <Input
                  id="accessCode"
                  placeholder="Ejemplo: RON-2025-001"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={joinSession} 
              disabled={loading || !agoraSDKLoaded}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Ingresar a la sesión'
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi cámara</CardTitle>
              <CardDescription>
                {sessionDetails?.clientName || 'Cliente'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={localPlayerRef} 
                className="bg-gray-900 h-64 rounded-md overflow-hidden"
              ></div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-2">
              <Button 
                variant={videoEnabled ? "default" : "outline"}
                size="icon"
                onClick={toggleVideo}
              >
                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </Button>
              <Button 
                variant={audioEnabled ? "default" : "outline"}
                size="icon"
                onClick={toggleAudio}
              >
                {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={captureSnapshot}
              >
                <Camera size={20} />
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certificador</CardTitle>
              <CardDescription>
                {sessionDetails?.certifierName || 'Certificador'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={remotePlayerRef} 
                className="bg-gray-900 h-64 rounded-md overflow-hidden"
              ></div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detalles de la sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <dt className="font-medium">ID de sesión:</dt>
                <dd>{sessionDetails?.sessionId || '-'}</dd>
                
                <dt className="font-medium">Documento:</dt>
                <dd>{sessionDetails?.documentName || '-'}</dd>
                
                <dt className="font-medium">Certificador:</dt>
                <dd>{sessionDetails?.certifierName || '-'}</dd>
                
                <dt className="font-medium">Estado:</dt>
                <dd>{sessionDetails?.status || 'En proceso'}</dd>
              </dl>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={leaveSession}
              >
                Finalizar sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}