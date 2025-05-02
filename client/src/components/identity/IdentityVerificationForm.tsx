import React, { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Check, X, RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Definición del esquema de validación para el formulario
const identityFormSchema = z.object({
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres',
  }),
  apellido: z.string().min(2, {
    message: 'El apellido debe tener al menos 2 caracteres',
  }),
  rut: z.string().min(8, {
    message: 'Ingrese un RUT válido',
  }),
  fechaNacimiento: z.string().optional(),
  email: z.string().email({
    message: 'Ingrese un email válido',
  }).optional(),
  strictMode: z.boolean().default(false),
  verifyLivingStatus: z.boolean().default(true),
});

type IdentityFormValues = z.infer<typeof identityFormSchema>;

// Definición de las propiedades del componente
interface IdentityVerificationFormProps {
  onVerificationComplete?: (result: any) => void;
  defaultValues?: Partial<IdentityFormValues>;
  documentRequired?: boolean;
  selfieRequired?: boolean;
}

export function IdentityVerificationForm({
  onVerificationComplete,
  defaultValues,
  documentRequired = false,
  selfieRequired = false,
}: IdentityVerificationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados de la webcam
  const [captureMode, setCaptureMode] = useState<'document' | 'selfie' | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Referencias para la webcam
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estado de verificación
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [inProgress, setInProgress] = useState(false);
  
  // Formulario
  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: {
      nombre: defaultValues?.nombre || '',
      apellido: defaultValues?.apellido || '',
      rut: defaultValues?.rut || '',
      fechaNacimiento: defaultValues?.fechaNacimiento || '',
      email: defaultValues?.email || '',
      strictMode: defaultValues?.strictMode || false,
      verifyLivingStatus: defaultValues?.verifyLivingStatus !== undefined 
        ? defaultValues.verifyLivingStatus 
        : true,
    },
  });

  // Mutación para verificación básica
  const verifyIdentityMutation = useMutation({
    mutationFn: async (values: IdentityFormValues) => {
      const response = await apiRequest('POST', '/api/identity/verify', {
        person: {
          nombre: values.nombre,
          apellido: values.apellido,
          rut: values.rut,
          fechaNacimiento: values.fechaNacimiento,
          email: values.email,
        },
        options: {
          strictMode: values.strictMode,
          verifyLivingStatus: values.verifyLivingStatus,
          requiredScore: 80,
        },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      if (data.verified) {
        toast({
          title: 'Verificación exitosa',
          description: `Identidad verificada con un puntaje de ${data.score}/100`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Verificación fallida',
          description: data.message || 'No se pudo verificar la identidad',
          variant: 'destructive',
        });
      }
      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al verificar la identidad',
        variant: 'destructive',
      });
    },
  });

  // Mutación para verificación con documento
  const verifyWithDocumentMutation = useMutation({
    mutationFn: async (data: {
      person: Partial<IdentityFormValues>,
      document: string,
      selfie?: string
    }) => {
      const response = await apiRequest('POST', '/api/identity/verify-document', {
        person: {
          nombre: data.person.nombre,
          apellido: data.person.apellido,
          rut: data.person.rut,
          fechaNacimiento: data.person.fechaNacimiento,
          email: data.person.email,
        },
        document: {
          image: data.document,
        },
        ...(data.selfie && { selfie: { image: data.selfie } }),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      if (data.verified) {
        toast({
          title: 'Verificación exitosa',
          description: `Documento verificado con un puntaje de ${data.score}/100`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Verificación fallida',
          description: data.message || 'No se pudo verificar el documento',
          variant: 'destructive',
        });
      }
      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al verificar con documento',
        variant: 'destructive',
      });
    },
  });

  // Control de la cámara
  const startCamera = async (mode: 'document' | 'selfie') => {
    try {
      setCaptureMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara. Verifica los permisos.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setCaptureMode(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Extraer la parte Base64 sin el prefijo
        const base64Data = imageDataUrl.split(',')[1];
        
        if (captureMode === 'document') {
          setDocumentImage(base64Data);
        } else if (captureMode === 'selfie') {
          setSelfieImage(base64Data);
        }
        
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'selfie') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Extraer la parte Base64 sin el prefijo
        const base64Data = result.split(',')[1];
        
        if (type === 'document') {
          setDocumentImage(base64Data);
        } else {
          setSelfieImage(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo del envío del formulario
  const onSubmit = (values: IdentityFormValues) => {
    setInProgress(true);
    if (documentRequired) {
      // Si se requiere documento pero no hay imagen
      if (!documentImage) {
        toast({
          title: 'Imagen requerida',
          description: 'Debe capturar o subir una imagen del documento de identidad',
          variant: 'destructive',
        });
        setInProgress(false);
        return;
      }
      
      // Si se requiere selfie pero no hay imagen
      if (selfieRequired && !selfieImage) {
        toast({
          title: 'Selfie requerida',
          description: 'Debe capturar o subir una imagen de su rostro',
          variant: 'destructive',
        });
        setInProgress(false);
        return;
      }
      
      // Verificación con documento (y selfie opcional)
      verifyWithDocumentMutation.mutate({
        person: values,
        document: documentImage,
        ...(selfieImage && { selfie: selfieImage }),
      });
    } else {
      // Verificación básica (solo datos)
      verifyIdentityMutation.mutate(values);
    }
  };

  // Renderizado de resultados
  const renderVerificationResult = () => {
    if (!verificationResult) return null;
    
    return (
      <Alert className={verificationResult.verified ? 'bg-green-50' : 'bg-red-50'}>
        <div className="flex items-center gap-2">
          {verificationResult.verified ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-red-600" />
          )}
          <AlertTitle>
            {verificationResult.verified 
              ? 'Verificación exitosa' 
              : 'Verificación fallida'}
          </AlertTitle>
        </div>
        <AlertDescription>
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Puntaje:</span> 
              <Progress 
                value={verificationResult.score} 
                max={100} 
                className={`h-2 w-24 ${
                  verificationResult.score > 70 
                    ? 'bg-green-100' 
                    : verificationResult.score > 40 
                      ? 'bg-yellow-100' 
                      : 'bg-red-100'
                }`} 
              />
              <span>{verificationResult.score}/100</span>
            </div>
            
            {verificationResult.details && (
              <div className="text-sm mt-2">
                {verificationResult.details.nameMatch !== undefined && (
                  <div className="flex items-center gap-2">
                    {verificationResult.details.nameMatch ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span>Coincidencia de nombre</span>
                  </div>
                )}
                
                {verificationResult.details.lastNameMatch !== undefined && (
                  <div className="flex items-center gap-2">
                    {verificationResult.details.lastNameMatch ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span>Coincidencia de apellido</span>
                  </div>
                )}
                
                {verificationResult.details.dateOfBirthMatch !== undefined && (
                  <div className="flex items-center gap-2">
                    {verificationResult.details.dateOfBirthMatch ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span>Coincidencia de fecha de nacimiento</span>
                  </div>
                )}
                
                {verificationResult.details.documentValid !== undefined && (
                  <div className="flex items-center gap-2">
                    {verificationResult.details.documentValid ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    <span>Documento válido</span>
                  </div>
                )}
                
                {verificationResult.details.livingStatus && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estado vital:</span>
                    <span className={
                      verificationResult.details.livingStatus === 'alive' 
                        ? 'text-green-600' 
                        : verificationResult.details.livingStatus === 'deceased' 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                    }>
                      {verificationResult.details.livingStatus === 'alive' 
                        ? 'Vivo' 
                        : verificationResult.details.livingStatus === 'deceased' 
                          ? 'Fallecido' 
                          : 'Desconocido'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {verificationResult.message && (
              <div className="mt-2 text-sm text-gray-600">
                {verificationResult.message}
              </div>
            )}
            
            {verificationResult.referenceId && (
              <div className="mt-2 text-xs text-gray-500">
                ID de referencia: {verificationResult.referenceId}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Determinar si estamos cargando/procesando
  const isLoading = verifyIdentityMutation.isPending || verifyWithDocumentMutation.isPending || inProgress;

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Verificación de Identidad</CardTitle>
        <CardDescription>
          Ingrese sus datos para verificar su identidad a través de GetAPI.cl
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Datos Personales</TabsTrigger>
            <TabsTrigger 
              value="document" 
              disabled={!documentRequired && !selfieRequired}>
              Documento y Selfie
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUT</FormLabel>
                      <FormControl>
                        <Input placeholder="12.345.678-9" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ingrese el RUT sin puntos o con formato XX.XXX.XXX-X
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Opcional: mejora la precisión de la verificación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ejemplo@correo.cl" {...field} />
                      </FormControl>
                      <FormDescription>
                        Opcional: para recibir confirmación de verificación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-4">
                  <FormField
                    control={form.control}
                    name="strictMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Modo estricto</FormLabel>
                          <FormDescription>
                            Aumenta el nivel de validación requerido
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="verifyLivingStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Verificar estado vital</FormLabel>
                          <FormDescription>
                            Comprueba si la persona está viva o fallecida
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {verificationResult && (
                  <div className="mt-4">
                    {renderVerificationResult()}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : verificationResult ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Verificar nuevamente
                    </>
                  ) : (
                    'Verificar identidad'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="document">
            <div className="space-y-6">
              {documentRequired && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Documento de identidad</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startCamera('document')}
                        disabled={isCameraActive}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Cámara
                      </Button>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isCameraActive}
                          className="relative"
                          onClick={() => document.getElementById('document-upload')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                        <input
                          id="document-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'document')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative min-h-[200px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                    {isCameraActive && captureMode === 'document' ? (
                      <div className="relative w-full h-full">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button 
                            type="button"
                            onClick={captureImage}
                            variant="secondary"
                          >
                            Capturar
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={stopCamera}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : documentImage ? (
                      <div className="relative w-full h-full min-h-[200px]">
                        <img 
                          src={`data:image/jpeg;base64,${documentImage}`}
                          alt="Documento capturado" 
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setDocumentImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-gray-500">
                        <p>Capture o suba una imagen de su documento de identidad</p>
                        <p className="text-sm mt-2">Use una imagen clara y bien iluminada</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selfieRequired && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Selfie</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startCamera('selfie')}
                        disabled={isCameraActive}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Cámara
                      </Button>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isCameraActive}
                          className="relative"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                        <input
                          id="selfie-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'selfie')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative min-h-[200px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                    {isCameraActive && captureMode === 'selfie' ? (
                      <div className="relative w-full h-full">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button 
                            type="button"
                            onClick={captureImage}
                            variant="secondary"
                          >
                            Capturar
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={stopCamera}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : selfieImage ? (
                      <div className="relative w-full h-full min-h-[200px]">
                        <img 
                          src={`data:image/jpeg;base64,${selfieImage}`}
                          alt="Selfie capturada" 
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setSelfieImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-gray-500">
                        <p>Capture o suba una selfie de su rostro</p>
                        <p className="text-sm mt-2">Asegúrese que su rostro sea visible y esté bien iluminado</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {verificationResult && (
                <div className="mt-4">
                  {renderVerificationResult()}
                </div>
              )}
              
              <Button 
                type="button" 
                className="w-full"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isLoading || (documentRequired && !documentImage) || (selfieRequired && !selfieImage)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : verificationResult ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Verificar nuevamente
                  </>
                ) : (
                  'Verificar identidad'
                )}
              </Button>
            </div>
            
            {/* Canvas oculto para captura de imágenes */}
            <canvas ref={canvasRef} className="hidden" />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-gray-500">
          La verificación se realiza de forma segura a través de GetAPI.cl.
          Sus datos son protegidos conforme a la legislación chilena de protección de datos personales.
        </p>
      </CardFooter>
    </Card>
  );
}