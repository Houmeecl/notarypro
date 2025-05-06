import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Video, Camera, ScreenShare, Mic, MicOff, VideoOff, User, X, Check, FileCheck, Download } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

interface VecinosRonVideoVerificationProps {
  documentId: number;
  documentName: string;
  onSuccess?: (verificationData: any) => void;
  onCancel?: () => void;
}

export function VecinosRonVideoVerification({ 
  documentId, 
  documentName, 
  onSuccess, 
  onCancel 
}: VecinosRonVideoVerificationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [localVideoEnabled, setLocalVideoEnabled] = useState<boolean>(true);
  const [localMicEnabled, setLocalMicEnabled] = useState<boolean>(true);
  const [evidenceCaptures, setEvidenceCaptures] = useState<string[]>([]);

  // Referencias para elementos DOM
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Referencias para Agora
  const rtcClient = useRef<IAgoraRTCClient | null>(null);
  const localTracks = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);

  // Inicializar cliente Agora al montar el componente
  useEffect(() => {
    rtcClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    return () => {
      leaveChannel();
    };
  }, []);

  // Función para iniciar la videollamada
  const startVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      setVideoStatus('connecting');

      if (!rtcClient.current) {
        throw new Error('El cliente Agora no se ha inicializado correctamente');
      }

      // Generar un nombre de canal aleatorio
      const channelName = `document_verification_${documentId}_${Date.now()}`;
      // En producción, el token se generaría en el servidor
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      
      if (!appId) {
        throw new Error('AGORA_APP_ID no está configurado');
      }

      // Unirse al canal
      await rtcClient.current.join(appId, channelName, null, null);

      // Crear tracks locales (audio y video)
      localTracks.current = await AgoraRTC.createMicrophoneAndCameraTracks();
      const [audioTrack, videoTrack] = localTracks.current;

      // Publicar tracks al canal
      await rtcClient.current.publish(localTracks.current);

      // Mostrar video local
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Configurar eventos para tracks remotos
      rtcClient.current.on('user-published', async (user, mediaType) => {
        await rtcClient.current!.subscribe(user, mediaType);
        
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      rtcClient.current.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          user.videoTrack?.stop();
        }
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
        }
      });

      setVideoStatus('connected');
      toast({
        title: "Videollamada iniciada",
        description: "Conexión establecida correctamente",
      });

    } catch (err: any) {
      console.error('Error al iniciar video:', err);
      setError(err.message || 'Error al iniciar la videollamada');
      setVideoStatus('disconnected');
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: err.message || "No se pudo iniciar la videollamada",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para salir del canal y limpiar recursos
  const leaveChannel = async () => {
    if (localTracks.current) {
      localTracks.current.forEach(track => track.close());
      localTracks.current = null;
    }
    
    if (rtcClient.current) {
      await rtcClient.current.leave();
    }
    
    setVideoStatus('disconnected');
  };

  // Función para activar/desactivar la cámara
  const toggleVideo = async () => {
    if (!localTracks.current) return;
    
    const videoTrack = localTracks.current[1];
    if (localVideoEnabled) {
      await videoTrack.setEnabled(false);
    } else {
      await videoTrack.setEnabled(true);
    }
    
    setLocalVideoEnabled(!localVideoEnabled);
  };

  // Función para activar/desactivar el micrófono
  const toggleMic = async () => {
    if (!localTracks.current) return;
    
    const audioTrack = localTracks.current[0];
    if (localMicEnabled) {
      await audioTrack.setEnabled(false);
    } else {
      await audioTrack.setEnabled(true);
    }
    
    setLocalMicEnabled(!localMicEnabled);
  };

  // Función para capturar evidencia (foto)
  const captureSnapshot = () => {
    if (!localTracks.current || !canvasRef.current || videoStatus !== 'connected') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede capturar evidencia sin una conexión de video activa",
      });
      return;
    }

    try {
      const videoTrack = localTracks.current[1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      // Obtener imagen del track de video
      const videoElement = document.querySelector(
        `[data-video="video-${videoTrack.getTrackId()}"]`
      ) as HTMLVideoElement;

      if (!videoElement) {
        throw new Error('No se pudo encontrar el elemento de video');
      }

      // Configurar tamaño del canvas
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Dibujar el video actual en el canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convertir a imagen base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Agregar a las capturas
      setEvidenceCaptures(prev => [...prev, imageData]);
      
      toast({
        title: "Evidencia capturada",
        description: "Se ha capturado una imagen como evidencia",
      });
    } catch (err: any) {
      console.error('Error al capturar evidencia:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "No se pudo capturar la evidencia",
      });
    }
  };

  // Función para descargar una captura
  const downloadCapture = (imageData: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = `evidencia-documento-${documentId}-${index}.jpg`;
    a.click();
  };

  // Función para completar la verificación
  const completeVerification = async () => {
    if (evidenceCaptures.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Se requiere al menos una captura de evidencia para completar la verificación",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Aquí se enviaría la información de verificación al servidor
      // Para demo, simplemente simularemos éxito
      
      // En implementación real, enviar datos al servidor:
      /*
      const response = await fetch(`/api/vecinos/document-sign/verify-ron/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vecinosToken')}`
        },
        body: JSON.stringify({
          evidenceCaptures,
          verificationTime: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la verificación en el servidor');
      }
      */
      
      // Esperar simulando proceso en servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpiar recursos de video
      await leaveChannel();
      
      setVerificationComplete(true);
      
      toast({
        title: "Verificación completada",
        description: "El proceso de verificación por video ha finalizado correctamente",
      });
      
      // Llamar callback de éxito con datos
      if (onSuccess) {
        onSuccess({
          documentId,
          evidenceCount: evidenceCaptures.length,
          verificationTime: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al completar la verificación');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Ha ocurrido un error al completar la verificación",
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar mensaje de éxito
  if (verificationComplete) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            Verificación completada
          </CardTitle>
          <CardDescription>
            El proceso de verificación ha finalizado exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <Alert className="bg-green-50 border-green-200 mb-4">
            <FileCheck className="h-4 w-4 text-green-700" />
            <AlertTitle className="text-green-700">Verificación exitosa</AlertTitle>
            <AlertDescription>
              Se ha completado la verificación por video para el documento <strong>{documentName}</strong>.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Evidencia capturada:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {evidenceCaptures.map((capture, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <img src={capture} alt={`Evidencia ${index + 1}`} className="w-full h-auto" />
                  <div className="p-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadCapture(capture, index + 1)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="default" 
            onClick={() => {
              if (onSuccess) onSuccess({});
            }}
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Verificación por videollamada
        </CardTitle>
        <CardDescription>
          Verificación de identidad para el documento: {documentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Video local */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
            {videoStatus === 'disconnected' ? (
              <div className="text-center p-4">
                <User className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Videollamada no iniciada</p>
                <Button 
                  variant="default" 
                  onClick={startVideo}
                  className="mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>Conectando...</>
                  ) : (
                    <>Iniciar video</>
                  )}
                </Button>
              </div>
            ) : (
              <div 
                ref={localVideoRef} 
                className="w-full h-full bg-black"
                id="local-video"
              />
            )}
            
            {videoStatus === 'connected' && (
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  Yo
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-full ${
                      localVideoEnabled ? 'bg-gray-700' : 'bg-red-600'
                    } text-white`}
                  >
                    {localVideoEnabled ? (
                      <Camera className="h-4 w-4" />
                    ) : (
                      <VideoOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-full ${
                      localMicEnabled ? 'bg-gray-700' : 'bg-red-600'
                    } text-white`}
                  >
                    {localMicEnabled ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Video del certificador (remoto) */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
            {videoStatus !== 'connected' ? (
              <div className="text-center p-4">
                <User className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Esperando al certificador</p>
              </div>
            ) : (
              <div 
                ref={remoteVideoRef} 
                className="w-full h-full bg-black"
                id="remote-video"
              />
            )}
            
            {videoStatus === 'connected' && (
              <div className="absolute bottom-2 left-2">
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                  Certificador
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles de captura de evidencia */}
        {videoStatus === 'connected' && (
          <div className="mt-6">
            <div className="flex flex-wrap justify-between items-center gap-2 border-t border-b py-3 mb-3">
              <h3 className="text-sm font-medium">Captura de evidencia:</h3>
              <Button
                onClick={captureSnapshot}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Camera className="h-4 w-4" />
                Capturar evidencia
              </Button>
            </div>
            
            {/* Lista de capturas */}
            {evidenceCaptures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {evidenceCaptures.map((capture, index) => (
                  <div key={index} className="relative border rounded-md overflow-hidden group">
                    <img src={capture} alt={`Evidencia ${index + 1}`} className="w-full h-auto" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="text-white"
                        onClick={() => downloadCapture(capture, index + 1)}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="text-white"
                        onClick={() => {
                          setEvidenceCaptures(prev => 
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Canvas oculto para captura */}
            <canvas 
              ref={canvasRef}
              style={{ display: 'none' }}
              id="snapshot-canvas"
            ></canvas>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button 
          variant="outline" 
          onClick={async () => {
            await leaveChannel();
            if (onCancel) onCancel();
          }}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={completeVerification}
          disabled={loading || videoStatus !== 'connected' || evidenceCaptures.length === 0}
          className="flex-1 sm:flex-none"
        >
          {loading ? (
            <>Procesando...</>
          ) : (
            <>Completar verificación</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}