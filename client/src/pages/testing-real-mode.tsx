/**
 * Página de prueba para modo real (Real Mode Testing)
 * 
 * Esta página está diseñada específicamente para probar el sistema en modo real
 * y ayudar a diagnosticar errores que solo ocurren cuando las funciones reales
 * están habilitadas (en lugar del modo demo).
 */

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NFCReader from '@/components/identity/NFCReader';
import QRVerification from '@/components/identity/QRVerification';
import VerificacionIntegrada from '@/components/identity/VerificacionIntegrada';
import { AlertCircle, Camera, CreditCard, CheckCircle, Activity, Database, Server, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeviceMode } from '@/lib/deviceModeDetector';
import { getRemoteConfigValue } from '@/lib/remoteConfig';

// Utilidad para el registro de errores
class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: Array<{timestamp: number; type: string; message: string; stack?: string}> = [];
  private maxLogs: number = 50;

  private constructor() {
    // Capturar errores no manejados
    window.addEventListener('error', (event) => {
      this.logError('unhandled', event.message, event.error?.stack);
    });
    
    // Capturar promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('promise', event.reason.message || 'Promesa rechazada', event.reason.stack);
    });
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(type: string, message: string, stack?: string): void {
    this.logs.unshift({
      timestamp: Date.now(),
      type,
      message,
      stack
    });
    
    // Limitar el número de logs almacenados
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // También registrar en la consola para facilitar depuración
    console.error(`[${type}]`, message, stack);
  }
  
  public getLogs(): Array<{timestamp: number; type: string; message: string; stack?: string}> {
    return [...this.logs];
  }
  
  public clearLogs(): void {
    this.logs = [];
  }
}

const TestingRealMode: React.FC = () => {
  const { toast } = useToast();
  const { isDemo, deviceId, setRealMode } = useDeviceMode();
  const [activeTab, setActiveTab] = useState('status');
  const [nfcData, setNfcData] = useState<any>(null);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [errorLogs, setErrorLogs] = useState<Array<{timestamp: number; type: string; message: string; stack?: string}>>([]);
  
  // Inicializar el logger de errores
  const errorLogger = ErrorLogger.getInstance();
  
  // Actualizar los logs periódicamente
  useEffect(() => {
    const getLatestLogs = () => {
      setErrorLogs(errorLogger.getLogs());
    };
    
    // Actualizar logs inmediatamente
    getLatestLogs();
    
    // Actualizar periódicamente
    const interval = setInterval(getLatestLogs, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Verificar el soporte de NFC en el dispositivo
  useEffect(() => {
    const checkNfcSupport = async () => {
      try {
        // Verificar si el navegador soporta la API Web NFC
        if ('NDEFReader' in window) {
          setNfcSupported(true);
        } else {
          // Verificar si es un dispositivo Android con soporte NFC
          const userAgent = navigator.userAgent.toLowerCase();
          const isAndroid = userAgent.includes('android');
          
          if (isAndroid && (
            userAgent.includes('p2mini') || 
            userAgent.includes('8766wb') || 
            userAgent.includes('sunmi') ||
            userAgent.includes('v2pro') ||
            userAgent.includes('tuu')
          )) {
            setNfcSupported(true);
          } else {
            setNfcSupported(false);
          }
        }
      } catch (error) {
        console.error("Error verificando soporte NFC:", error);
        setNfcSupported(false);
      }
    };

    checkNfcSupport();
  }, []);
  
  // Forzar modo real al iniciar esta página
  useEffect(() => {
    if (isDemo) {
      setRealMode();
      
      // Notificar al usuario
      toast({
        title: "Modo real activado",
        description: "La página ahora está configurada para usar todas las APIs y funciones en modo real",
      });
    }
  }, [isDemo, setRealMode, toast]);
  
  // Manejar éxito de lectura NFC
  const handleNfcSuccess = (data: any) => {
    setNfcData(data);
    setNfcError(null);
    
    toast({
      title: "Lectura NFC exitosa",
      description: "Se ha leído correctamente la información del chip NFC",
    });
  };
  
  // Manejar error de lectura NFC con más detalles
  const handleNfcError = (error: string) => {
    console.error("Error detallado NFC:", error);
    setNfcError(error);
    setNfcData(null);
    
    // Analizar el error para mostrar información más detallada
    let errorMessage = error;
    let errorDetails = "";
    
    if (error.includes("NDEFReader")) {
      errorDetails = "El navegador no soporta la API Web NFC. Esto es normal en navegadores de escritorio.";
    } else if (error.includes("NotAllowedError")) {
      errorDetails = "El usuario no ha concedido permiso para acceder al NFC. Verifique los permisos.";
    } else if (error.includes("NotSupportedError")) {
      errorDetails = "Este dispositivo no soporta NFC o el hardware está desactivado.";
    } else if (error.includes("NetworkError")) {
      errorDetails = "Error de red al comunicarse con el servicio NFC.";
    } else if (error.includes("timeout")) {
      errorDetails = "La lectura NFC ha excedido el tiempo máximo de espera.";
    } else if (error.includes("AbortError")) {
      errorDetails = "La operación NFC fue cancelada por el usuario o el sistema.";
    }
    
    toast({
      title: "Error en lectura NFC",
      description: errorDetails || error,
      variant: "destructive",
    });
  };
  
  // Manejar éxito de lectura QR
  const handleQrSuccess = (data: any) => {
    setQrData(data);
    setQrError(null);
    
    toast({
      title: "Lectura QR exitosa",
      description: "Se ha escaneado correctamente el código QR",
    });
  };
  
  // Manejar error de lectura QR con más detalles
  const handleQrError = (error: string) => {
    console.error("Error detallado QR:", error);
    setQrError(error);
    setQrData(null);
    
    // Analizar el error para mostrar información más detallada
    let errorDetails = "";
    
    if (error.includes("getUserMedia") || error.includes("NotAllowedError")) {
      errorDetails = "No se han otorgado permisos para acceder a la cámara. Verifique la configuración de permisos.";
    } else if (error.includes("NotFoundError")) {
      errorDetails = "No se ha encontrado una cámara en este dispositivo.";
    } else if (error.includes("NotReadableError")) {
      errorDetails = "La cámara está siendo utilizada por otra aplicación o no está disponible.";
    } else if (error.includes("OverconstrainedError")) {
      errorDetails = "La resolución solicitada no es compatible con esta cámara.";
    } else if (error.includes("SecurityError")) {
      errorDetails = "El uso de la cámara ha sido bloqueado por políticas de seguridad.";
    } else if (error.includes("AbortError")) {
      errorDetails = "La operación de escaneo QR fue cancelada.";
    } else if (error.includes("timeout")) {
      errorDetails = "Tiempo de espera agotado para el escaneo QR.";
    } else if (error.includes("NetworkError")) {
      errorDetails = "Error de red al procesar el código QR.";
    }
    
    toast({
      title: "Error en lectura QR",
      description: errorDetails || error,
      variant: "destructive",
    });
  };
  
  // Prueba de configuración remota
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getRemoteConfigValue('payment');
        setPaymentConfig(config);
      } catch (error) {
        console.error("Error al obtener configuración:", error);
      }
    };
    
    fetchConfig();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-[#2d219b]/20 to-[#2d219b]/5">
          <CardTitle className="text-2xl text-[#2d219b]">
            Pruebas de Modo Real
          </CardTitle>
          <CardDescription>
            Herramienta de diagnóstico para verificar el funcionamiento de las APIs y servicios en modo real
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Alert className={isDemo ? "bg-amber-50 border-amber-200 mb-6" : "bg-green-50 border-green-200 mb-6"}>
            <ShieldCheck className={isDemo ? "h-4 w-4 text-amber-600" : "h-4 w-4 text-green-600"} />
            <AlertTitle className={isDemo ? "text-amber-800" : "text-green-800"}>
              {isDemo ? "Modo de demostración activo" : "Modo real activado"}
            </AlertTitle>
            <AlertDescription className={isDemo ? "text-amber-700" : "text-green-700"}>
              {isDemo 
                ? "La aplicación está utilizando datos simulados. Haga clic en 'Activar modo real' para usar APIs reales."
                : "La aplicación está utilizando APIs reales y accediendo a hardware del dispositivo cuando sea necesario."}
            </AlertDescription>
            
            {isDemo && (
              <Button onClick={setRealMode} className="mt-2" variant="outline">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activar modo real
              </Button>
            )}
          </Alert>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="status">
                <Activity className="h-4 w-4 mr-2" />
                Estado del sistema
              </TabsTrigger>
              <TabsTrigger value="nfc">
                <CreditCard className="h-4 w-4 mr-2" />
                Prueba NFC
              </TabsTrigger>
              <TabsTrigger value="qr">
                <Smartphone className="h-4 w-4 mr-2" />
                Prueba QR
              </TabsTrigger>
              <TabsTrigger value="verification">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verificación Completa
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Errores
              </TabsTrigger>
            </TabsList>
            
            {/* TAB: ESTADO DEL SISTEMA */}
            <TabsContent value="status" className="space-y-6">
              <h2 className="text-lg font-medium text-[#2d219b]">Diagnóstico del Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado del modo */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Modo del dispositivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {isDemo === null ? (
                        <div className="flex items-center text-amber-600">
                          <Activity className="animate-pulse h-5 w-5 mr-2" />
                          <span>Detectando...</span>
                        </div>
                      ) : isDemo ? (
                        <div className="flex items-center text-amber-600">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          <span>Modo demostración</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>Modo real</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      ID de dispositivo: {deviceId || 'Desconocido'}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Soporte NFC */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Soporte de NFC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {nfcSupported === null ? (
                        <div className="flex items-center text-amber-600">
                          <Activity className="animate-pulse h-5 w-5 mr-2" />
                          <span>Verificando...</span>
                        </div>
                      ) : nfcSupported ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>NFC soportado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <ShieldAlert className="h-5 w-5 mr-2" />
                          <span>NFC no soportado</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {nfcSupported === null 
                        ? 'Verificando la disponibilidad de NFC en este dispositivo...'
                        : nfcSupported 
                          ? 'Este dispositivo tiene capacidad de lectura NFC.'
                          : 'Este dispositivo no tiene capacidad de lectura NFC o el navegador no lo soporta.'}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Configuración de pago */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Configuración de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentConfig ? (
                      <div>
                        <div className="flex items-center">
                          {paymentConfig.demoModeEnabled ? (
                            <div className="flex items-center text-amber-600">
                              <AlertCircle className="h-5 w-5 mr-2" />
                              <span>Modo demo de pagos activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              <span>Modo real de pagos activo</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 space-y-1 text-xs text-gray-500">
                          <div className="grid grid-cols-2 gap-1">
                            <div>Reintentos máximos:</div>
                            <div>{paymentConfig.maxRetries}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>Tiempo de espera:</div>
                            <div>{paymentConfig.retryTimeout}ms</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>API alternativa:</div>
                            <div>{paymentConfig.fallbackApiUrl || 'No configurada'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <Activity className="animate-pulse h-5 w-5 mr-2" />
                        <span>Cargando configuración...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Información del navegador */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Información del Navegador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="font-medium">User Agent:</div>
                        <div className="truncate">{navigator.userAgent}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="font-medium">Plataforma:</div>
                        <div>{navigator.platform}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="font-medium">En línea:</div>
                        <div>{navigator.onLine ? 'Sí' : 'No'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="font-medium">Cookies habilitadas:</div>
                        <div>{navigator.cookieEnabled ? 'Sí' : 'No'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    // Limpiar localStorage
                    localStorage.removeItem('vx_force_demo');
                    
                    // Recargar la página para aplicar los cambios
                    window.location.reload();
                  }}
                  variant="outline"
                  className="mr-2"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Limpiar caché local
                </Button>
                
                <Button 
                  onClick={() => {
                    // Forzar modo real
                    setRealMode();
                    
                    // Notificar al usuario
                    toast({
                      title: "Modo real activado",
                      description: "Se ha forzado el modo real en la aplicación",
                    });
                  }}
                >
                  <Server className="mr-2 h-4 w-4" />
                  Forzar modo real
                </Button>
              </div>
            </TabsContent>
            
            {/* TAB: PRUEBA NFC */}
            <TabsContent value="nfc" className="space-y-6">
              <h2 className="text-lg font-medium text-[#2d219b]">Prueba de Lectura NFC</h2>
              
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="text-center mb-6">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 text-[#2d219b]" />
                  <h3 className="text-base font-medium">Acerque su documento al lector NFC</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Coloque su cédula de identidad cerca del lector NFC de su dispositivo para probar la funcionalidad.
                  </p>
                </div>
                
                <NFCReader 
                  onSuccess={handleNfcSuccess}
                  onError={handleNfcError}
                  demoMode={false} // Forzar modo real
                />
              </div>
              
              {nfcError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en lectura NFC</AlertTitle>
                  <AlertDescription>
                    {nfcError}
                  </AlertDescription>
                </Alert>
              )}
              
              {nfcData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Datos leídos del chip NFC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto max-h-60">
                      {JSON.stringify(nfcData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* TAB: PRUEBA QR */}
            <TabsContent value="qr" className="space-y-6">
              <h2 className="text-lg font-medium text-[#2d219b]">Prueba de Escaneo QR</h2>
              
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="text-center mb-6">
                  <Smartphone className="h-10 w-10 mx-auto mb-2 text-[#2d219b]" />
                  <h3 className="text-base font-medium">Escanea un código QR</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Utiliza la cámara para escanear cualquier código QR y probar la funcionalidad.
                  </p>
                </div>
                
                <QRVerification 
                  onSuccess={handleQrSuccess}
                  onError={handleQrError}
                  demoMode={false} // Forzar modo real
                />
              </div>
              
              {qrError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en lectura QR</AlertTitle>
                  <AlertDescription>
                    {qrError}
                  </AlertDescription>
                </Alert>
              )}
              
              {qrData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Datos leídos del código QR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto max-h-60">
                      {JSON.stringify(qrData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* TAB: VERIFICACIÓN COMPLETA */}
            <TabsContent value="verification" className="space-y-6">
              <h2 className="text-lg font-medium text-[#2d219b]">Verificación Completa</h2>
              
              <VerificacionIntegrada 
                onComplete={(data) => {
                  toast({
                    title: "Verificación completada",
                    description: "Todos los pasos se han completado correctamente",
                  });
                  
                  console.log("Datos de verificación completa:", data);
                }}
                onError={(error) => {
                  toast({
                    title: "Error en verificación",
                    description: error,
                    variant: "destructive",
                  });
                  
                  // Registrar el error en el logger
                  errorLogger.logError('verification', error);
                }}
                demoMode={false} // Forzar modo real
              />
            </TabsContent>
            
            {/* TAB: ERRORES */}
            <TabsContent value="errors" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#2d219b]">Registro de Errores</h2>
                <Button 
                  onClick={() => {
                    errorLogger.clearLogs();
                    setErrorLogs([]);
                    toast({
                      title: "Registro de errores limpiado",
                      description: "Se han borrado todos los errores registrados",
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Limpiar registros
                </Button>
              </div>
              
              {errorLogs.length === 0 ? (
                <Alert className="bg-gray-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>No hay errores registrados</AlertTitle>
                  <AlertDescription>
                    No se han detectado errores durante esta sesión. Si ocurre algún error, aparecerá aquí.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Se han detectado {errorLogs.length} errores durante esta sesión.
                  </p>
                  
                  {errorLogs.map((log, index) => (
                    <Card key={index} className="border-red-200">
                      <CardHeader className="pb-2 bg-red-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            <CardTitle className="text-sm font-medium text-red-600">
                              Error tipo: {log.type}
                            </CardTitle>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm mb-2">{log.message}</p>
                        {log.stack && (
                          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32 border border-gray-200">
                            {log.stack}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t p-4 text-xs text-gray-500">
          <div>
            Esta herramienta de diagnóstico muestra errores detallados para ayudar a identificar problemas
            específicos cuando se utiliza el sistema en modo real.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestingRealMode;