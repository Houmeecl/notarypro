import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Info, AlertCircle, Smartphone, QrCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { generateQRCodeSVG } from "@shared/utils/document-utils";

const VerificacionIdentidadDemo: React.FC = () => {
  const [mobileVerificationActive, setMobileVerificationActive] = useState<boolean>(false);
  const [verificationQrCode, setVerificationQrCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  
  // Generar un ID de sesión único cuando se carga la página
  useEffect(() => {
    const newSessionId = `verify-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    setSessionId(newSessionId);
    
    // Usar la ruta unificada de verificación NFC
    const verificationUrl = `${window.location.origin}/verificacion-nfc?session=${newSessionId}`;
    // Generar código QR con la URL
    const qrCode = generateQRCodeSVG(verificationUrl);
    setVerificationQrCode(qrCode);
  }, []);
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Helmet>
        <title>Verificación Avanzada de Identidad - NotaryPro</title>
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Verificación Avanzada de Identidad</h1>
          <p className="text-lg text-gray-700">
            Esta verificación utiliza biometría facial y validación de documentos para asegurar la identidad.
          </p>
          
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-700">Información</AlertTitle>
            <AlertDescription className="text-blue-600">
              Para utilizar las funciones de verificación de identidad en su propia aplicación, necesita una clave API válida de GetAPI.cl.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Verificación Biométrica Avanzada</CardTitle>
              <CardDescription>
                Validación combinada de documento de identidad y reconocimiento facial con prueba de vida.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Requisitos</h3>
                  <p>Para completar la verificación avanzada se requiere:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Cédula de identidad o pasaporte válido</li>
                    <li>Cámara frontal para captura facial</li>
                    <li>Condiciones de luz adecuadas</li>
                    <li>Seguir las instrucciones de prueba de vida</li>
                  </ul>
                  
                  <Alert variant="default" className="mt-4">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      La verificación es más precisa utilizando un dispositivo móvil. Escanee el código QR para continuar desde su teléfono.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => setMobileVerificationActive(true)}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      <Smartphone className="h-5 w-5" />
                      Iniciar verificación desde este dispositivo
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4">Verificación desde dispositivo móvil</h3>
                  <p className="text-center mb-4">Escanee este código QR con su teléfono para iniciar la verificación</p>
                  
                  <div 
                    className="w-64 h-64 border p-4 bg-white rounded-lg flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: verificationQrCode }}
                  />
                  
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    ID de sesión: {sessionId}
                  </p>
                </div>
              </div>
              
              {mobileVerificationActive && (
                <div className="mt-8 p-4 border rounded-md">
                  <AdvancedVerification sessionId={sessionId} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Información técnica</h2>
          <p className="mb-4">
            Esta demostración utiliza los siguientes componentes de la integración con GetAPI.cl:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Componente <code>IdentityVerificationForm</code> para la interfaz de usuario</li>
            <li>Biblioteca <code>getapi-validator.ts</code> para la comunicación con la API</li>
            <li>Endpoints <code>/api/identity/*</code> en el servidor para manejar las solicitudes</li>
          </ul>
          <div className="mt-4">
            <a 
              href="https://developers.tuu.cl/docs/identity-verification" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              <span>Documentación de integración</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la verificación avanzada
interface AdvancedVerificationProps {
  sessionId: string;
}

const AdvancedVerification: React.FC<AdvancedVerificationProps> = ({ sessionId }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  
  // Opciones de documentos predefinidos
  const documentTemplates = [
    { id: 'cedula', name: 'Cédula de Identidad', img: '/assets/templates/cedula-identidad.png' },
    { id: 'pasaporte', name: 'Pasaporte', img: '/assets/templates/pasaporte.png' },
    { id: 'licencia', name: 'Licencia de Conducir', img: '/assets/templates/licencia-conducir.png' },
  ];
  
  // Referencia para la captura de cámara
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Iniciar cámara cuando sea necesario
  const startCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };
  
  // Detener cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Aquí se podría convertir a base64 y enviar al servidor
        // const photoData = canvas.toDataURL('image/jpeg');
        
        // Avanzar al siguiente paso después de la captura
        setStep(prev => prev + 1);
        stopCamera();
      }
    }
  };
  
  // Iniciar cámara cuando cambiamos al paso de captura facial
  useEffect(() => {
    if (step === 3) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [step]);
  
  // Manejo del envío del formulario
  const handleSubmit = async () => {
    setLoading(true);
    
    // Simular procesamiento
    setTimeout(() => {
      setLoading(false);
      setStep(5); // Completado
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>
      
      {/* Paso 1: Selección de documento */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Paso 1: Seleccione su documento</h3>
          
          <div className="flex gap-4 mb-4">
            <Button 
              variant={showTemplates ? "outline" : "default"}
              onClick={() => setShowTemplates(false)}
            >
              Subir documento
            </Button>
            <Button 
              variant={showTemplates ? "default" : "outline"}
              onClick={() => setShowTemplates(true)}
            >
              Usar formato predefinido
            </Button>
          </div>
          
          {!showTemplates ? (
            <div className="p-6 border-2 border-dashed rounded-lg text-center">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedDocument('custom');
                  }
                }}
              />
              <label 
                htmlFor="document-upload" 
                className="cursor-pointer block"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-full bg-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-gray-700">Sube tu documento de identidad</span>
                  <p className="text-sm text-gray-500">
                    Arrastra y suelta tu archivo aquí, o haz clic para buscar en tu dispositivo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formatos aceptados: JPG, PNG, PDF
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <h4 className="text-md font-medium mb-3">Seleccione un tipo de documento:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documentTemplates.map(template => (
                  <div 
                    key={template.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedDocument === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedDocument(template.id)}
                  >
                    <div className="aspect-w-4 aspect-h-3 mb-2 bg-gray-100 rounded flex items-center justify-center">
                      {/* Placeholder for document template image */}
                      <div className="text-3xl text-gray-400">📄</div>
                    </div>
                    <p className="text-center font-medium">{template.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!selectedDocument}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
      
      {/* Paso 2: Datos del documento */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Paso 2: Ingrese los datos del documento</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="doc-number" className="block text-sm font-medium mb-1">Número de documento</label>
              <input 
                type="text" 
                id="doc-number"
                className="w-full p-2 border rounded-md"
                placeholder="Ingrese el número de su documento"
              />
            </div>
            
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium mb-1">Nombre completo</label>
              <input 
                type="text" 
                id="full-name"
                className="w-full p-2 border rounded-md"
                placeholder="Como aparece en su documento"
              />
            </div>
            
            <div>
              <label htmlFor="birth-date" className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
              <input 
                type="date" 
                id="birth-date"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Atrás
            </Button>
            <Button 
              onClick={() => setStep(3)}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
      
      {/* Paso 3: Reconocimiento facial */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Paso 3: Reconocimiento facial</h3>
          
          <p className="mb-4">
            Por favor, posicione su rostro dentro del marco y mantenga una expresión neutral.
          </p>
          
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-gray-200 aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              
              {/* Marco de referencia */}
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 m-8 rounded-full z-10"></div>
            </div>
            
            {/* Canvas oculto para captura */}
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-center mt-4">
              <Button onClick={capturePhoto}>
                Capturar
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(2)}
            >
              Atrás
            </Button>
          </div>
        </div>
      )}
      
      {/* Paso 4: Prueba de vida */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Paso 4: Prueba de vida</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p>Por favor, siga las instrucciones para realizar la prueba de vida:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Mire directamente a la cámara</li>
              <li>Gire lentamente su cabeza hacia la derecha</li>
              <li>Luego gire hacia la izquierda</li>
              <li>Finalmente, pestañee tres veces</li>
            </ol>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <span className="mr-2">Procesando...</span>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : "Iniciar verificación"}
          </Button>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(3)}
            >
              Atrás
            </Button>
          </div>
        </div>
      )}
      
      {/* Paso 5: Verificación completada */}
      {step === 5 && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-green-700">¡Verificación completada!</h3>
          
          <p className="text-gray-600">
            Su identidad ha sido verificada exitosamente. Puede continuar con el proceso.
          </p>
          
          <div className="pt-4">
            <Button onClick={() => window.location.href = '/'}>
              Continuar
            </Button>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 pt-4 border-t mt-6">
        ID de sesión: {sessionId}
      </div>
    </div>
  );
};

export default VerificacionIdentidadDemo;