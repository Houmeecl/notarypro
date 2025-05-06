import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Video, Mic, MicOff, VideoOff, Camera, CheckSquare, UserCheck, FileText } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Declaración para el SDK de Agora (se carga vía CDN)
declare global {
  interface Window {
    AgoraRTC: any;
  }
}

export default function RonCertifierSession() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [agoraSDKLoaded, setAgoraSDKLoaded] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  
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
    
    // Cargar las sesiones disponibles
    fetchAvailableSessions();
    
    return () => {
      // Limpiar la conexión cuando el componente se desmonte
      leaveSession();
    };
  }, []);

  const fetchAvailableSessions = async () => {
    try {
      const response = await fetch('/api/ron/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar las sesiones');
      }
      
      const data = await response.json();
      setSessions(data || []);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      toast({
        title: 'Error al cargar sesiones',
        description: 'No se pudieron obtener las sesiones disponibles',
        variant: 'destructive'
      });
    }
  };

  const joinSession = async () => {
    if (!selectedSession) {
      toast({
        title: 'Selecciona una sesión',
        description: 'Por favor selecciona una sesión para iniciar',
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
      // 1. Obtener detalles de la sesión
      const sessionId = selectedSession;
      const response = await fetch(`/api/ron/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Sesión no encontrada o error al cargar detalles');
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
      
      // Actualizar estado de la sesión en el servidor
      await fetch(`/api/ron/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'in-progress'
        })
      });
      
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
    
    if (sessionDetails?.sessionId) {
      // Actualizar estado de la sesión en el servidor
      await fetch(`/api/ron/sessions/${sessionDetails.sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });
    }
    
    setConnected(false);
    setSessionDetails(null);
    setIdentityVerified(false);
    setSignatureCompleted(false);
    setVerificationNotes('');
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
    if (connected && clientRef.current && remotePlayerRef.current) {
      try {
        // Aquí se implementaría la captura del video remoto
        // Para este ejemplo, solo mostraremos un mensaje de éxito
        
        toast({
          title: 'Imagen capturada',
          description: 'Se capturó una imagen del cliente para verificación',
        });
        
        // Aquí se enviaría la imagen al servidor
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

  const verifyIdentity = async () => {
    if (!connected || !sessionDetails) return;
    
    try {
      // Simulación de verificación exitosa
      // Aquí se enviarían los datos al servidor
      
      setIdentityVerified(true);
      
      toast({
        title: 'Identidad verificada',
        description: 'La identidad del cliente ha sido verificada correctamente',
      });
    } catch (error) {
      console.error('Error al verificar identidad:', error);
      toast({
        title: 'Error al verificar identidad',
        description: 'No se pudo verificar la identidad del cliente',
        variant: 'destructive'
      });
    }
  };

  const initiateSignature = async () => {
    if (!connected || !sessionDetails || !identityVerified) return;
    
    try {
      // Aquí se iniciaría el proceso de firma con Zoho Sign
      // Para este ejemplo, solo mostraremos un mensaje de éxito
      
      setSignatureCompleted(true);
      
      toast({
        title: 'Firma iniciada',
        description: 'El proceso de firma ha sido iniciado correctamente',
      });
    } catch (error) {
      console.error('Error al iniciar firma:', error);
      toast({
        title: 'Error al iniciar firma',
        description: 'No se pudo iniciar el proceso de firma',
        variant: 'destructive'
      });
    }
  };

  const completeSession = async () => {
    if (!connected || !sessionDetails) return;
    
    try {
      // Aquí se completaría la sesión en el servidor
      await leaveSession();
      
      toast({
        title: 'Sesión completada',
        description: 'La sesión RON ha sido completada correctamente',
      });
    } catch (error) {
      console.error('Error al completar sesión:', error);
      toast({
        title: 'Error al completar sesión',
        description: 'No se pudo completar la sesión RON',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Panel de Certificador RON</h1>
      
      {!connected ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Iniciar Sesión RON</CardTitle>
            <CardDescription>
              Selecciona una sesión programada para comenzar la certificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="session" className="text-sm font-medium">
                  Sesión
                </label>
                <Select
                  value={selectedSession}
                  onValueChange={setSelectedSession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.sessionId} value={session.sessionId}>
                        {session.sessionId} - {session.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={joinSession} 
              disabled={loading || !agoraSDKLoaded || !selectedSession}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Iniciar Sesión'
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
                {sessionDetails?.certifierName || 'Certificador'}
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
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>
                {sessionDetails?.clientName || 'Cliente'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={remotePlayerRef} 
                className="bg-gray-900 h-64 rounded-md overflow-hidden"
              ></div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={captureSnapshot}
              >
                <Camera size={20} />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant={identityVerified ? "default" : "outline"}
                    size="sm"
                    className="ml-2"
                  >
                    <UserCheck size={16} className="mr-2" />
                    Verificar Identidad
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verificación de Identidad</DialogTitle>
                    <DialogDescription>
                      Confirma que has verificado la identidad del cliente
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <Label htmlFor="verificationNotes">Notas de verificación</Label>
                    <Textarea
                      id="verificationNotes"
                      placeholder="Documento verificado: Cédula de identidad #12345678-9"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={verifyIdentity}
                      disabled={!verificationNotes}
                    >
                      Confirmar Verificación
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Control de Sesión</CardTitle>
              <CardDescription>
                Sesión: {sessionDetails?.sessionId || '-'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant={identityVerified ? "default" : "outline"}
                    className="flex items-center justify-center"
                    disabled={!connected}
                    onClick={verifyIdentity}
                  >
                    <UserCheck size={18} className="mr-2" />
                    Verificar Identidad
                  </Button>
                  
                  <Button 
                    variant={signatureCompleted ? "default" : "outline"}
                    className="flex items-center justify-center"
                    disabled={!connected || !identityVerified}
                    onClick={initiateSignature}
                  >
                    <CheckSquare size={18} className="mr-2" />
                    Iniciar Firma
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-center"
                    disabled={!connected}
                  >
                    <FileText size={18} className="mr-2" />
                    Generar Constancia
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={leaveSession}
              >
                Cancelar
              </Button>
              
              <Button 
                variant="default" 
                onClick={completeSession}
                disabled={!identityVerified}
              >
                Completar Sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}