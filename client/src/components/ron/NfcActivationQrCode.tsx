/**
 * Componente NfcActivationQrCode
 * 
 * Este componente genera un código QR que, al ser escaneado con un dispositivo móvil,
 * activa la función NFC del teléfono para leer la cédula de identidad.
 */
import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, NfcIcon, ArrowDown, Share2, Copy, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface NfcActivationQrCodeProps {
  onReadComplete?: (data: any) => void;
  documentInfo?: {
    type?: string;
    number?: string;
  };
  sessionId?: string;
}

const NfcActivationQrCode: React.FC<NfcActivationQrCodeProps> = ({ 
  onReadComplete,
  documentInfo,
  sessionId = 'session-' + Math.random().toString(36).substring(2, 9) 
}) => {
  // Estados
  const [qrValue, setQrValue] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('qrcode');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  
  // Hooks
  const { toast } = useToast();
  
  // Generar datos para el código QR
  useEffect(() => {
    generateQrData();
  }, [documentInfo, sessionId]);
  
  // Función para generar datos del QR
  const generateQrData = () => {
    setIsGenerating(true);
    
    try {
      // URL base para el lector NFC
      const webUrl = `${window.location.origin}/nfc-reader.html?id=${sessionId}&callback=${encodeURIComponent(`${window.location.origin}/verificacion-nfc-puente/result/${sessionId}`)}`;
      
      // Crear URL para Android Intent (protocolo intent://)
      const androidIntentUrl = `intent://${window.location.host}/nfc-reader.html?id=${sessionId}&callback=${encodeURIComponent(`${window.location.origin}/verificacion-nfc-puente/result/${sessionId}`)}&direct=true#Intent;scheme=https;package=com.android.chrome;end`;
      
      // URL de esquema personalizado para Web NFC (web+nfc://)
      const webNfcUrl = `web+nfc://read?url=${encodeURIComponent(webUrl)}&direct=true`;
      
      // Para el QR usamos la URL basada en intent:// que tiene mayor compatibilidad con Android
      // Esta URL intentará abrir Chrome directamente con el lector NFC
      setQrValue(androidIntentUrl);
      
      // Para compartir y botones usamos la URL web estándar
      setQrUrl(webUrl);
      
      console.log("URL del lector NFC (web):", webUrl);
      console.log("URL del lector NFC (Android Intent):", androidIntentUrl);
      console.log("URL del lector NFC (Web NFC Scheme):", webNfcUrl);
      
      // Guardar URLs para uso futuro
      sessionStorage.setItem(`nfc_url_web_${sessionId}`, webUrl);
      sessionStorage.setItem(`nfc_url_android_${sessionId}`, androidIntentUrl);
      sessionStorage.setItem(`nfc_url_scheme_${sessionId}`, webNfcUrl);
      
      // Simular tiempo de generación
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    } catch (error) {
      console.error('Error al generar datos QR:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el código QR para activación NFC.',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  };
  
  // Función para copiar la URL al portapapeles
  const copyUrlToClipboard = () => {
    if (!qrUrl) return;
    
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace de activación NFC ha sido copiado al portapapeles.',
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Error al copiar al portapapeles:', err);
      toast({
        title: 'Error',
        description: 'No se pudo copiar el enlace al portapapeles.',
        variant: 'destructive'
      });
    });
  };
  
  // Función para abrir directamente la URL del lector NFC
  const shareUrl = () => {
    if (!qrUrl) return;
    
    try {
      // Abrir el lector NFC en una nueva pestaña/ventana
      const newWindow = window.open(qrUrl, '_blank');
      
      // Verificar si la ventana se abrió correctamente
      if (newWindow) {
        toast({
          title: 'Lector NFC abierto',
          description: 'Se ha abierto el lector NFC en una nueva pestaña.'
        });
      } else {
        // Es posible que los popups estén bloqueados
        toast({
          title: 'No se pudo abrir el lector',
          description: 'Por favor, permita las ventanas emergentes para este sitio.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error al abrir el lector NFC:', error);
      toast({
        title: 'Error',
        description: 'No se pudo abrir el lector NFC. Intente escanear el código QR directamente.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NfcIcon className="h-5 w-5 text-primary" />
            <CardTitle>Activación NFC</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Paso 1
          </Badge>
        </div>
        <CardDescription>
          Escanee este código QR con su teléfono para activar el lector NFC
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="qrcode" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="qrcode">Código QR</TabsTrigger>
            <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcode" className="space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-lg">
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">Generando código QR...</p>
              </div>
            ) : qrValue ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 relative">
                  <QRCodeSVG 
                    value={qrValue}
                    size={256}
                    level="H" // Alta corrección de errores
                    includeMargin={true}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <NfcIcon className="h-16 w-16 text-primary opacity-70" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Escanee este código con la cámara de su teléfono
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDown className="h-4 w-4 text-primary animate-bounce" />
                    <Smartphone className="h-5 w-5 text-primary" />
                    <ArrowDown className="h-4 w-4 text-primary animate-bounce" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se abrirá la aplicación de lectura NFC automáticamente
                  </p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyUrlToClipboard}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar enlace</span>
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareUrl}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Abrir lector NFC</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <QrCode className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No se pudo generar el código QR. Por favor, refresque la página e intente nuevamente.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <div className="space-y-4 p-2">
              <h3 className="font-medium text-base">Cómo usar este código QR:</h3>
              
              <ol className="space-y-3 ml-5 list-decimal">
                <li className="text-sm">
                  <span className="font-medium">Escanee el código QR</span>
                  <p className="text-muted-foreground">
                    Abra la cámara de su teléfono y apunte al código QR mostrado en pantalla.
                  </p>
                </li>
                
                <li className="text-sm">
                  <span className="font-medium">Permita abrir la aplicación</span>
                  <p className="text-muted-foreground">
                    Su teléfono le pedirá permiso para abrir la aplicación NFC o el navegador.
                  </p>
                </li>
                
                <li className="text-sm">
                  <span className="font-medium">Active NFC en su teléfono</span>
                  <p className="text-muted-foreground">
                    Si no está activado, el sistema le pedirá que active NFC en su dispositivo.
                  </p>
                </li>
                
                <li className="text-sm">
                  <span className="font-medium">Acerque su cédula al teléfono</span>
                  <p className="text-muted-foreground">
                    Coloque la cédula de identidad en la parte trasera del teléfono para leer el chip NFC.
                  </p>
                </li>
                
                <li className="text-sm">
                  <span className="font-medium">Confirme la lectura</span>
                  <p className="text-muted-foreground">
                    Una vez leído el chip, el sistema verificará automáticamente la identidad.
                  </p>
                </li>
              </ol>
              
              <Alert className="mt-4">
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Nota importante</AlertTitle>
                <AlertDescription>
                  La ubicación exacta del sensor NFC varía según el modelo de teléfono. 
                  Generalmente se encuentra en la parte central o superior de la parte trasera.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={() => generateQrData()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerar código
        </Button>
        
        <Button onClick={() => setActiveTab(activeTab === 'qrcode' ? 'instructions' : 'qrcode')}>
          {activeTab === 'qrcode' ? 'Ver instrucciones' : 'Ver código QR'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NfcActivationQrCode;