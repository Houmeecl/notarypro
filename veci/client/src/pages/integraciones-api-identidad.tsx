import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function IntegracionesApiIdentidad() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('TEST_API_KEY_NOTARYPRO');
  const [callbackUrl, setCallbackUrl] = useState('https://tu-aplicacion.cl/verificacion-callback');
  const [sessionResponse, setSessionResponse] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    });
  };

  const createSession = async () => {
    setLoading(true);
    // Simulamos la llamada a la API
    try {
      // En un entorno real, esto sería una llamada a la API:
      // const response = await fetch('/api/identity-api/create-session', {...});
      
      // Simulamos respuesta de la API
      const mockResponse = {
        success: true,
        data: {
          sessionId: `session-${Math.random().toString(36).substring(2, 10)}`,
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Math.random().toString(36).substring(2, 15)}.${Math.random().toString(36).substring(2, 15)}`,
          verificationUrl: `https://notarypro.cl/identity-verification/${Math.random().toString(36).substring(2, 10)}`,
          expiresIn: 3600
        }
      };
      
      setTimeout(() => {
        setSessionResponse(mockResponse);
        setSessionId(mockResponse.data.sessionId);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al crear sesión:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Hubo un error al crear la sesión de verificación",
        variant: "destructive"
      });
    }
  };

  const getSessionStatus = async () => {
    setLoading(true);
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await fetch(`/api/identity-api/session/${sessionId}`, {...});
      
      // Simulamos respuesta de la API
      const mockResponse = {
        success: true,
        data: {
          sessionId: sessionId,
          status: "in_progress",
          requiredVerifications: ["document", "facial", "nfc"],
          completedVerifications: ["document"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      setTimeout(() => {
        setSessionResponse(mockResponse);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al obtener estado de sesión:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Hubo un error al obtener el estado de la sesión",
        variant: "destructive"
      });
    }
  };

  const createSessionCode = `
// Ejemplo de código para crear una sesión de verificación
const createIdentityVerificationSession = async () => {
  try {
    const response = await fetch('https://notarypro.cl/api/identity-api/create-session', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callbackUrl: '${callbackUrl}',
        userData: {
          // Datos opcionales del usuario para personalizar la experiencia
          name: 'Juan Pérez',
          email: 'juan@ejemplo.cl',
          // Cualquier dato adicional que necesites para tu aplicación
        },
        requiredVerifications: ['document', 'facial', 'nfc'], // Verificaciones requeridas
        customBranding: {
          // Opcional: Personalización de marca
          logo: 'https://tu-aplicacion.cl/logo.png',
          primaryColor: '#FF0000',
          secondaryColor: '#000000'
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirigir al usuario a la URL de verificación
      window.location.href = data.data.verificationUrl;
      // O mostrar un enlace para que el usuario pueda acceder a la verificación
      // setVerificationUrl(data.data.verificationUrl);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error creating verification session:', error);
  }
};
  `;

  const getSessionCode = `
// Ejemplo de código para consultar el estado de una sesión
const checkVerificationStatus = async (sessionId) => {
  try {
    const response = await fetch(\`https://notarypro.cl/api/identity-api/session/\${sessionId}\`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      const { status, completedVerifications, requiredVerifications } = data.data;
      
      // Verificar si el proceso está completo
      if (status === 'completed') {
        // Proceso de verificación completado exitosamente
        console.log('Verificación completada!');
      } else if (status === 'failed') {
        // El proceso falló por alguna razón
        console.log('Verificación fallida:', data.data.verificationResult?.reason);
      } else {
        // En progreso, verificar cuáles verificaciones se han completado
        const progress = completedVerifications.length / requiredVerifications.length * 100;
        console.log(\`Verificación en progreso: \${progress}%\`);
      }
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error checking verification status:', error);
  }
};
  `;
  
  const callbackCode = `
// Ejemplo de endpoint para recibir la notificación webhook
// Este código debe ser implementado en tu servidor
app.post('/verificacion-callback', async (req, res) => {
  try {
    // Verificar firma del webhook para seguridad (implementación recomendada)
    // const isValidSignature = verifyWebhookSignature(req);
    // if (!isValidSignature) return res.status(401).send('Unauthorized');
    
    const { sessionId, status, verificationResult } = req.body;
    
    if (status === 'completed') {
      // Actualizamos el estado del usuario en nuestra base de datos
      await updateUserVerificationStatus(sessionId, true, verificationResult);
      
      // Notificar al usuario que su verificación fue exitosa
      await sendVerificationSuccessEmail(verificationResult.userData.email);
    } else if (status === 'failed') {
      // Manejar verificación fallida
      await updateUserVerificationStatus(sessionId, false, verificationResult);
      
      // Notificar al usuario que su verificación falló
      await sendVerificationFailedEmail(
        verificationResult.userData.email,
        verificationResult.reason
      );
    }
    
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
});
  `;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API de Verificación de Identidad NotaryPro</h1>
        <p className="text-gray-500 mb-6">
          Integra verificación de identidad avanzada con NFC en tu aplicación utilizando nuestra API.
        </p>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Esta es una API privada que requiere autenticación. Para solicitar acceso, contacta a <a href="mailto:api@notarypro.cl" className="text-primary underline">api@notarypro.cl</a>.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuración API</CardTitle>
            <CardDescription>Configura tus credenciales y URL de callback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  placeholder="Tu API Key" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callback-url">URL de Callback</Label>
                <Input 
                  id="callback-url" 
                  value={callbackUrl} 
                  onChange={(e) => setCallbackUrl(e.target.value)} 
                  placeholder="https://tu-aplicacion.cl/callback" 
                />
                <p className="text-sm text-gray-500">Tu servidor recibirá notificaciones de verificación en esta URL</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={createSession} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Sesión de Verificación'}
            </Button>
            <Button 
              variant="outline" 
              onClick={getSessionStatus} 
              disabled={!sessionId || loading}
            >
              {loading ? 'Consultando...' : 'Consultar Estado'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Respuesta API</CardTitle>
            <CardDescription>Resultado de la última operación</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] overflow-auto">
            {sessionResponse ? (
              <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto">
                {JSON.stringify(sessionResponse, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No hay datos para mostrar. Crea una sesión o consulta el estado.
              </div>
            )}
          </CardContent>
          <CardFooter>
            {sessionResponse?.success && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Operación exitosa</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Integración</h2>
        <p className="mb-4">
          Nuestra API de verificación de identidad permite validar documentos de identidad, 
          realizar reconocimiento facial y leer chips NFC de las cédulas chilenas.
        </p>
      </div>

      <Tabs defaultValue="create-session" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="create-session">Crear Sesión</TabsTrigger>
          <TabsTrigger value="check-status">Consultar Estado</TabsTrigger>
          <TabsTrigger value="callback">Recibir Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create-session">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Crear una sesión de verificación</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopyCode(createSessionCode)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>POST /api/identity-api/create-session</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto">{createSessionCode}</pre>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Debes almacenar el <code>sessionId</code> para futuras consultas del estado de verificación.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="check-status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Consultar estado de verificación</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopyCode(getSessionCode)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>GET /api/identity-api/session/:sessionId</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto">{getSessionCode}</pre>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Puedes consultar el estado tantas veces como necesites mientras la sesión esté activa.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="callback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Implementar endpoint de notificaciones</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopyCode(callbackCode)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Recibe actualizaciones del estado de verificación</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto">{callbackCode}</pre>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Implementa este endpoint en tu servidor para recibir notificaciones automáticas.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Verificaciones Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Validación de cédula de identidad chilena mediante fotografías.
                Análisis OCR para extracción de datos y validación de marca de agua.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reconocimiento Facial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Comparación biométrica entre la selfie del usuario y la foto del documento de identidad.
                Incluye detección de vida (liveness).
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lectura NFC</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Lectura del chip NFC incorporado en las cédulas chilenas para verificación
                criptográfica de la autenticidad del documento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Documentación Completa</h2>
        <Card>
          <CardContent className="mt-6">
            <p className="mb-4">
              Para acceder a la documentación completa de la API, visite nuestro portal de desarrolladores:
            </p>
            <Button variant="outline" className="gap-2" onClick={() => window.open('https://developers.notarypro.cl/docs')}>
              Portal de Desarrolladores <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}