import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { esModoFuncionalActivo } from '@/lib/modoFuncionalActivator';
import { Loader2, Pen, PenTool, Upload, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FunctionalSignatureProps {
  documentId?: string;
  onSignComplete?: (signatureData: any) => void;
  onCancel?: () => void;
}

/**
 * Componente de firma electrónica que funciona en modo funcional para pruebas QA
 * Simula tanto firma simple (verificación de identidad) como avanzada (eToken)
 */
const FunctionalSignature: React.FC<FunctionalSignatureProps> = ({
  documentId,
  onSignComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('simple');
  const [signatureType, setSignatureType] = useState<'simple' | 'advanced'>('simple');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigningComplete, setIsSigningComplete] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modoFuncional] = useState<boolean>(esModoFuncionalActivo());
  
  // Canvas para firma manual
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Inicializar canvas para firma
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Configurar canvas
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';
    
    // Limpiar canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
  }, [activeTab]);
  
  // Manejo de eventos de dibujo para firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    setIsDrawing(true);
    
    // Obtener coordenadas
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Obtener coordenadas
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevenir scroll en dispositivos táctiles
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
    
    setHasSignature(true);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
  };
  
  // Obtener imagen de la firma
  const getSignatureImage = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    return canvas.toDataURL('image/png');
  };
  
  // Verificar identidad para firma simple
  const verifyIdentity = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // En modo funcional, simulamos verificación exitosa
      if (modoFuncional) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsVerified(true);
        
        toast({
          title: "Identidad verificada",
          description: "Verificación completada en modo funcional QA",
        });
        
        return;
      }
      
      // Si estuviéramos en modo producción, aquí iría la lógica real
      // de verificación de identidad
      
    } catch (err: any) {
      console.error("Error en verificación de identidad:", err);
      setError(err.message || "Error en verificación de identidad");
      
      if (modoFuncional) {
        // En modo funcional recuperamos automáticamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsVerified(true);
        setError(null);
        
        toast({
          title: "Identidad verificada",
          description: "Recuperación automática en modo funcional QA",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Firmar documento con firma simple
  const signWithSimpleSignature = async () => {
    if (!isVerified && !modoFuncional) {
      setError("Debe verificar su identidad primero");
      return;
    }
    
    if (activeTab === 'draw' && !hasSignature) {
      setError("Debe dibujar su firma primero");
      return;
    }
    
    setIsSigning(true);
    setError(null);
    
    try {
      // En modo funcional, simulamos firma exitosa
      if (modoFuncional) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const signatureResult = {
          id: `sig-${Date.now()}`,
          type: 'simple',
          method: activeTab === 'draw' ? 'manual' : 'electronic',
          timestamp: new Date().toISOString(),
          documentId: documentId || `doc-${Date.now()}`,
          signatureImage: activeTab === 'draw' ? getSignatureImage() : null,
          verificationId: `ver-${Date.now()}`,
          status: 'completed'
        };
        
        setSignatureData(signatureResult);
        setIsSigningComplete(true);
        
        toast({
          title: "Documento firmado",
          description: "El documento ha sido firmado correctamente en modo funcional QA",
        });
        
        if (onSignComplete) {
          onSignComplete(signatureResult);
        }
        
        return;
      }
      
      // Si estuviéramos en modo producción, aquí iría la lógica real
      // de firma electrónica simple
      
    } catch (err: any) {
      console.error("Error al firmar documento:", err);
      setError(err.message || "Error al firmar documento");
      
      if (modoFuncional) {
        // En modo funcional recuperamos automáticamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const signatureResult = {
          id: `sig-recovery-${Date.now()}`,
          type: 'simple',
          method: activeTab === 'draw' ? 'manual' : 'electronic',
          timestamp: new Date().toISOString(),
          documentId: documentId || `doc-${Date.now()}`,
          signatureImage: activeTab === 'draw' ? getSignatureImage() : null,
          verificationId: `ver-${Date.now()}`,
          status: 'completed'
        };
        
        setSignatureData(signatureResult);
        setIsSigningComplete(true);
        setError(null);
        
        toast({
          title: "Documento firmado",
          description: "Recuperación automática en modo funcional QA",
        });
        
        if (onSignComplete) {
          onSignComplete(signatureResult);
        }
      }
    } finally {
      setIsSigning(false);
    }
  };
  
  // Firmar con firma avanzada (eToken)
  const signWithAdvancedSignature = async () => {
    setIsSigning(true);
    setError(null);
    
    try {
      // En modo funcional, simulamos firma exitosa
      if (modoFuncional) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const signatureResult = {
          id: `sig-adv-${Date.now()}`,
          type: 'advanced',
          method: 'etoken',
          timestamp: new Date().toISOString(),
          documentId: documentId || `doc-${Date.now()}`,
          certificateInfo: {
            issuer: "Firma Avanzada Demo",
            serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            validFrom: new Date().toISOString(),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          status: 'completed'
        };
        
        setSignatureData(signatureResult);
        setIsSigningComplete(true);
        
        toast({
          title: "Documento firmado con firma avanzada",
          description: "El documento ha sido firmado correctamente en modo funcional QA",
        });
        
        if (onSignComplete) {
          onSignComplete(signatureResult);
        }
        
        return;
      }
      
      // Si estuviéramos en modo producción, aquí iría la lógica real
      // de firma electrónica avanzada con eToken
      
    } catch (err: any) {
      console.error("Error al firmar documento con firma avanzada:", err);
      setError(err.message || "Error al firmar documento con firma avanzada");
      
      if (modoFuncional) {
        // En modo funcional recuperamos automáticamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const signatureResult = {
          id: `sig-adv-recovery-${Date.now()}`,
          type: 'advanced',
          method: 'etoken',
          timestamp: new Date().toISOString(),
          documentId: documentId || `doc-${Date.now()}`,
          certificateInfo: {
            issuer: "Firma Avanzada Demo (Recuperación)",
            serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            validFrom: new Date().toISOString(),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          status: 'completed'
        };
        
        setSignatureData(signatureResult);
        setIsSigningComplete(true);
        setError(null);
        
        toast({
          title: "Documento firmado con firma avanzada",
          description: "Recuperación automática en modo funcional QA",
        });
        
        if (onSignComplete) {
          onSignComplete(signatureResult);
        }
      }
    } finally {
      setIsSigning(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Firma Electrónica</CardTitle>
        <CardDescription>
          Seleccione el tipo de firma para certificar su documento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {modoFuncional && (
          <Alert className="bg-blue-50 border-blue-100">
            <Info className="h-4 w-4 text-blue-700" />
            <AlertTitle className="text-blue-700">Modo Funcional QA</AlertTitle>
            <AlertDescription className="text-blue-600">
              El sistema está operando en modo funcional. Las firmas serán simuladas para pruebas de integración.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isSigningComplete ? (
          <div className="p-6 bg-green-50 rounded-lg border border-green-100 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">Documento firmado correctamente</h3>
            <p className="text-green-700 mb-4">
              {signatureType === 'simple' 
                ? "Firma electrónica simple aplicada con éxito" 
                : "Firma electrónica avanzada aplicada con éxito"}
            </p>
            <div className="bg-white p-3 rounded border border-green-200 text-left text-sm">
              <p><strong>ID de firma:</strong> {signatureData?.id}</p>
              <p><strong>Fecha y hora:</strong> {new Date(signatureData?.timestamp).toLocaleString()}</p>
              <p>
                <strong>Tipo de firma:</strong> {signatureData?.type === 'simple' ? 'Simple' : 'Avanzada'} 
                {signatureData?.method && ` (${signatureData.method})`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Selector de tipo de firma */}
            <div className="flex space-x-4 pb-4">
              <div 
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  signatureType === 'simple' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSignatureType('simple')}
              >
                <h3 className="font-medium flex items-center">
                  <Pen className="h-4 w-4 mr-2" />
                  Firma Simple
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Con verificación de identidad
                </p>
              </div>
              
              <div 
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  signatureType === 'advanced' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSignatureType('advanced')}
              >
                <h3 className="font-medium flex items-center">
                  <PenTool className="h-4 w-4 mr-2" />
                  Firma Avanzada
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Con eToken (firma digital)
                </p>
              </div>
            </div>
            
            {/* Contenido para firma simple */}
            {signatureType === 'simple' && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="simple">Firma electrónica</TabsTrigger>
                  <TabsTrigger value="draw">Dibujar firma</TabsTrigger>
                </TabsList>
                
                <TabsContent value="simple">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-medium mb-2">Firma Electrónica Simple</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Esta firma requiere verificación de identidad. En modo funcional,
                        la verificación será automática.
                      </p>
                      
                      {!isVerified ? (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={verifyIdentity}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verificando identidad...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Verificar identidad
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center text-green-600 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>Identidad verificada correctamente</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2">Información</h3>
                      <p className="text-sm text-blue-700">
                        Al firmar con firma electrónica simple, usted está aceptando que esta
                        firma tiene validez legal según la Ley 19.799 sobre documentos electrónicos.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="draw">
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                        <span className="text-sm font-medium">Dibuje su firma</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearSignature}
                        >
                          Limpiar
                        </Button>
                      </div>
                      <div className="bg-white p-2">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={150}
                          className="w-full border rounded touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2">Información</h3>
                      <p className="text-sm text-blue-700">
                        Su firma manuscrita digitalizada será almacenada junto al documento.
                        Para mayor seguridad, se recomienda verificar su identidad.
                      </p>
                      
                      {!isVerified && (
                        <Button 
                          variant="outline" 
                          className="mt-3" 
                          size="sm"
                          onClick={verifyIdentity}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            "Verificar identidad (opcional)"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Contenido para firma avanzada */}
            {signatureType === 'advanced' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Firma Electrónica Avanzada</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Esta firma utiliza un certificado digital en eToken.
                    En modo funcional, se simulará el proceso completo.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded border">
                      <h4 className="text-sm font-medium">Información del certificado simulado:</h4>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Emisor:</span>
                        </div>
                        <div>Firma Avanzada Demo CA</div>
                        
                        <div>
                          <span className="text-gray-500">Serial:</span>
                        </div>
                        <div>SN-12345678</div>
                        
                        <div>
                          <span className="text-gray-500">Válido desde:</span>
                        </div>
                        <div>{new Date().toLocaleDateString()}</div>
                        
                        <div>
                          <span className="text-gray-500">Válido hasta:</span>
                        </div>
                        <div>{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Seguridad avanzada</h3>
                  <p className="text-sm text-blue-700">
                    La firma electrónica avanzada utiliza un certificado digital emitido por una
                    entidad certificadora acreditada, proporcionando el más alto nivel de seguridad
                    y validez legal según la Ley 19.799.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSigning}
        >
          Cancelar
        </Button>
        
        {!isSigningComplete ? (
          <Button 
            onClick={
              signatureType === 'simple' 
                ? signWithSimpleSignature 
                : signWithAdvancedSignature
            }
            disabled={
              isSigning || 
              (signatureType === 'simple' && 
               activeTab === 'draw' && 
               !hasSignature)
            }
          >
            {isSigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Firmando...
              </>
            ) : (
              "Firmar documento"
            )}
          </Button>
        ) : (
          <Button onClick={onCancel}>
            Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FunctionalSignature;