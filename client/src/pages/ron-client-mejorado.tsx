/**
 * Versión mejorada de la página de cliente RON con mejor manejo de errores de cámara,
 * compatibilidad con diferentes navegadores y notificación clara de modo forzado.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  FileText, 
  Info, 
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react';
import ImprovedVideoSession from '@/components/ron/ImprovedVideoSession';
import ForcedModeNotification from '@/components/ron/ForcedModeNotification';

export default function RonClientMejorado() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Estados del componente
  const [accessCode, setAccessCode] = useState<string>(params.code || '');
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  
  // Unirse a la sesión con el código proporcionado
  const startSession = async () => {
    if (!accessCode) {
      toast({
        title: 'Código requerido',
        description: 'Por favor ingresa un código de sesión RON',
        variant: 'destructive'
      });
      return;
    }

    // Validar formato del código RON
    const ronCodeRegex = /^RON-\d{4}-\d{3,}$/;
    if (!ronCodeRegex.test(accessCode)) {
      toast({
        title: 'Formato inválido',
        description: 'El código debe tener el formato RON-YYYY-NNN (ej: RON-2025-001)',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    console.log('Verificando código RON:', accessCode);
    
    try {
      // Primero intentar con la API pública (que no requiere autenticación)
      const response = await fetch(`/api/ron/public/session/${accessCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Código RON inválido o sesión no encontrada');
      }
      
      const sessionData = await response.json();
      
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Error al verificar el código de sesión');
      }
      
      console.log('Sesión RON encontrada:', sessionData);
      setSessionDetails(sessionData);
      setSessionStarted(true);
      
      // Mostrar notificación de éxito
      toast({
        title: 'Sesión verificada',
        description: 'Conectando a la sesión RON...',
      });
      
      // Actualizar la URL para reflejar el código de sesión
      navigate(`/ron-client/${accessCode}`, { replace: true });
      
    } catch (error) {
      console.error('Error al verificar sesión RON:', error);
      toast({
        title: 'Error al verificar sesión',
        description: (error as Error).message || 'No se pudo verificar el código de sesión',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Si tenemos código en los parámetros y aún no hemos iniciado, verificamos automáticamente
  useEffect(() => {
    if (params.code && !sessionStarted && !loading) {
      console.log('Código RON detectado en URL:', params.code);
      setAccessCode(params.code);
      startSession();
    }
  }, [params.code, sessionStarted, loading]);
  
  // Función para manejar el fin de la sesión
  const handleSessionEnd = () => {
    setSessionStarted(false);
    setSessionDetails(null);
    navigate('/ron-platform', { replace: true });
    
    toast({
      title: 'Sesión finalizada',
      description: 'Has salido de la sesión RON',
    });
  };
  
  // Si la sesión está activa, mostramos la interfaz de video
  if (sessionStarted && sessionDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 shadow-sm py-4 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sesión RON: {accessCode}
              </h1>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 gap-6">
            {/* Notificación de Modo Forzado */}
            <ForcedModeNotification mode="forced" />
            
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Sesión de Certificación Remota
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Verificación de identidad y firma electrónica en línea
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 h-[600px]">
                <ImprovedVideoSession 
                  sessionId={accessCode}
                  role="client"
                  onSessionEnd={handleSessionEnd}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-600" />
                  Información de la sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Código de sesión:</div>
                    <div>{accessCode}</div>
                    
                    <div className="font-medium">Certificador:</div>
                    <div>{sessionDetails.certifierName || 'Certificador asignado'}</div>
                    
                    <div className="font-medium">Propósito:</div>
                    <div>{sessionDetails.purpose || 'Firma de documentos'}</div>
                    
                    <div className="font-medium">Estado:</div>
                    <div className="text-green-600 font-medium">Activo</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <AlertCircle className="h-4 w-4 mr-2 text-indigo-600" />
                  La sesión permanecerá activa mientras no se cierre la ventana
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  // Pantalla de inicio de sesión
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="flex items-center justify-center">
            <Users className="h-6 w-6 mr-2" />
            Sesión RON
          </CardTitle>
          <CardDescription className="text-center text-indigo-100">
            Verificación de identidad y firma electrónica en línea
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Notificación de Modo Forzado */}
          <ForcedModeNotification mode="forced" />
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label 
                htmlFor="accessCode" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Código de acceso RON
              </label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Formato: RON-2025-001"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingresa el código proporcionado por tu certificador notarial
              </p>
            </div>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={startSession}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Verificando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Ingresar a la sesión
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xs text-center text-slate-500 dark:text-slate-400 max-w-xs">
            Esta plataforma cumple con la Ley 19.799 sobre documentos electrónicos y firma electrónica en Chile.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}