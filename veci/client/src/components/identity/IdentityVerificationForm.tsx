import React, { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Check, X, RefreshCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
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
  verifyLivingStatus: z.boolean().default(false).optional(),
  requiredScore: z.number().min(0).max(100).default(80).optional(),
});

type IdentityFormValues = z.infer<typeof identityFormSchema>;

// Opciones de validación
interface ValidationOptions {
  strictMode?: boolean;
  requiredScore?: number;
  verifyLivingStatus?: boolean;
}

interface IdentityVerificationFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  initialValues?: Partial<IdentityFormValues>;
  options?: ValidationOptions;
}

export function IdentityVerificationForm({
  onSuccess,
  onError,
  initialValues = {},
  options = {},
}: IdentityVerificationFormProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationMode, setVerificationMode] = useState('basic'); // 'basic', 'document', 'advanced'
  const [progress, setProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Configurar el formulario con valores predeterminados y validación
  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: {
      nombre: initialValues.nombre || '',
      apellido: initialValues.apellido || '',
      rut: initialValues.rut || '',
      verifyLivingStatus: initialValues.verifyLivingStatus || false,
      requiredScore: initialValues.requiredScore || 80,
    },
  });

  // Mutación para la verificación de identidad (API)
  const verifyIdentityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/identity/verify", data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      setValidationResult(data);
      toast({
        title: "Verificación completada",
        description: data.success 
          ? "Identidad verificada correctamente" 
          : "No se pudo verificar la identidad",
        variant: data.success ? "default" : "destructive",
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error en la verificación",
        description: error.message,
        variant: "destructive",
      });
      if (onError) onError(error);
    },
  });

  // Mutación para la verificación con documento
  const verifyDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('rut', data.rut);
      formData.append('nombre', data.nombre);
      formData.append('apellido', data.apellido);
      
      if (data.documentImage) {
        // Convertir base64 a Blob para enviar
        const blob = await fetch(data.documentImage).then(r => r.blob());
        formData.append('documentImage', blob, 'document.jpg');
      }
      
      return fetch('/api/identity/verify-document', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      setValidationResult(data);
      toast({
        title: "Verificación con documento completada",
        description: data.success 
          ? "Documento verificado correctamente" 
          : "No se pudo verificar el documento",
        variant: data.success ? "default" : "destructive",
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error en la verificación",
        description: error.message,
        variant: "destructive",
      });
      if (onError) onError(error);
    },
  });

  // Iniciar la cámara
  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: verificationMode === 'advanced' ? 'user' : 'environment' } 
      });
      
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Error accediendo a la cámara:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Por favor, asegúrese de dar permisos.",
        variant: "destructive",
      });
    }
  };

  // Detener la cámara
  const stopCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  // Capturar imagen
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    
    stopCamera();
  };

  // Descartar la imagen capturada
  const discardImage = () => {
    setCapturedImage(null);
  };

  // Realizar verificación avanzada real 
  const performAdvancedVerification = async () => {
    setProgress(0);
    
    // Iniciar la barra de progreso
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 95) { // Solo llegar al 95% automáticamente
          clearInterval(interval);
          return 95;
        }
        return prevProgress + 5;
      });
    }, 300);
    
    try {
      // Obtener datos del formulario para verificación real
      const data = form.getValues();
      
      // Validar datos mínimos requeridos
      if (!data.rut || !data.nombre || !data.apellido) {
        throw new Error("Debe proporcionar RUT, nombre y apellido para la verificación");
      }
      
      // Crear payload de verificación real
      const verificationPayload = {
        rut: data.rut,
        nombre: data.nombre,
        apellido: data.apellido,
        options: {
          strictMode: true,
          requiredScore: data.requiredScore || 80,
          verifyLivingStatus: data.verifyLivingStatus || false,
          useAdvancedVerification: true,
          verificationSource: 'identity_form'
        }
      };
      
      // Crear un objeto con todos los datos incluyendo la imagen si está disponible
      const requestPayload = {
        ...verificationPayload,
        ...(capturedImage && { selfieImage: capturedImage })
      };
      
      // Hacer la llamada API real
      const response = await fetch('/api/identity/verify-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      // Detener la barra de progreso y poner al 100%
      clearInterval(interval);
      setProgress(100);
      
      if (!response.ok) {
        throw new Error(`Error en la verificación: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      setValidationResult(result);
      
      // Registrar evento de verificación
      try {
        await apiRequest("POST", "/api/micro-interactions/record", {
          type: "identity_verification",
          points: result.success ? 75 : 0,
          metadata: { 
            source: "identity_form", 
            score: result.score || 0,
            success: result.success
          }
        });
      } catch (err) {
        console.error("Error al registrar interacción:", err);
      }
      
      toast({
        title: result.success ? "Verificación exitosa" : "Verificación fallida",
        description: `Puntuación: ${result.score || 0}/100`,
        variant: result.success ? "default" : "destructive",
      });
      
      if (onSuccess && result.success) onSuccess(result);
      if (onError && !result.success) onError(new Error(result.message || "No se pudo verificar"));
      
    } catch (error) {
      // Detener la barra de progreso
      clearInterval(interval);
      setProgress(100);
      
      console.error("Error en verificación avanzada:", error);
      
      // Crear un resultado de error
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido en la verificación',
        score: 0,
        validatedFields: []
      };
      
      setValidationResult(errorResult);
      
      toast({
        title: "Error en la verificación",
        description: errorResult.message,
        variant: "destructive",
      });
      
      if (onError) onError(error instanceof Error ? error : new Error('Error en verificación'));
    }
  };

  // Enviar el formulario para verificación básica
  const onSubmit = async (data: IdentityFormValues) => {
    if (verificationMode === 'basic') {
      // Verificación básica
      verifyIdentityMutation.mutate({
        rut: data.rut,
        nombre: data.nombre,
        apellido: data.apellido,
        options: {
          strictMode: true,
          requiredScore: data.requiredScore || 80,
          verifyLivingStatus: data.verifyLivingStatus || false
        }
      });
    } else if (verificationMode === 'document' && capturedImage) {
      // Verificación con documento
      verifyDocumentMutation.mutate({
        rut: data.rut,
        nombre: data.nombre,
        apellido: data.apellido,
        documentImage: capturedImage
      });
    } else {
      // Usar verificación avanzada real (no simulada)
      performAdvancedVerification();
    }
  };

  // Renderizar el formulario básico de verificación
  const renderBasicForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
        
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
                Ingrese el RUT completo con puntos y guión
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="verifyLivingStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Verificar estado vital</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requiredScore"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Precisión requerida:</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={verifyIdentityMutation.isPending}
        >
          {verifyIdentityMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Verificar Identidad
        </Button>
      </form>
    </Form>
  );

  // Renderizar el formulario de verificación con documento
  const renderDocumentForm = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input 
            id="nombre" 
            placeholder="Juan" 
            value={form.getValues().nombre}
            onChange={e => form.setValue('nombre', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="apellido">Apellido</Label>
          <Input 
            id="apellido" 
            placeholder="Pérez" 
            value={form.getValues().apellido}
            onChange={e => form.setValue('apellido', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="rut">RUT</Label>
        <Input 
          id="rut" 
          placeholder="12.345.678-9" 
          value={form.getValues().rut}
          onChange={e => form.setValue('rut', e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <Label>Documento de identidad</Label>
        
        {capturedImage ? (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Documento capturado" 
              className="w-full rounded-md border"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button 
                size="sm" 
                variant="destructive" 
                className="rounded-full p-2 h-8 w-8" 
                onClick={discardImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {cameraActive ? (
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full rounded-md border"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <Button onClick={captureImage} variant="secondary">
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar
                  </Button>
                  <Button onClick={stopCamera} variant="destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md border border-dashed border-gray-300">
                <Button onClick={startCamera}>
                  <Camera className="mr-2 h-5 w-5" />
                  Activar cámara
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Button 
        className="w-full"
        disabled={!capturedImage || verifyDocumentMutation.isPending}
        onClick={() => form.handleSubmit(onSubmit)()}
      >
        {verifyDocumentMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Enviar y verificar
          </>
        )}
      </Button>
    </div>
  );

  // Renderizar la verificación avanzada (biométrica)
  const renderAdvancedForm = () => (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Verificación avanzada</AlertTitle>
        <AlertDescription>
          Esta modalidad combina la verificación documental con reconocimiento facial y prueba de vida.
        </AlertDescription>
      </Alert>
      
      {/* Campos de formulario similares a los básicos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input 
            id="nombre" 
            placeholder="Juan" 
            value={form.getValues().nombre}
            onChange={e => form.setValue('nombre', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="apellido">Apellido</Label>
          <Input 
            id="apellido" 
            placeholder="Pérez" 
            value={form.getValues().apellido}
            onChange={e => form.setValue('apellido', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="rut">RUT</Label>
        <Input 
          id="rut" 
          placeholder="12.345.678-9" 
          value={form.getValues().rut}
          onChange={e => form.setValue('rut', e.target.value)}
        />
      </div>
      
      {/* Área de captura de biometría facial */}
      <div className="space-y-2">
        <Label>Verificación biométrica</Label>
        
        <div className="h-64 bg-gray-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Próximamente: Captura facial biométrica</p>
          </div>
        </div>
      </div>
      
      {/* Barra de progreso durante la verificación */}
      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Verificando...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <Button 
        className="w-full"
        onClick={() => form.handleSubmit(onSubmit)()}
      >
        Iniciar verificación avanzada
      </Button>
    </div>
  );

  // Renderizar resultados de la verificación
  const renderResults = () => {
    if (!validationResult) return null;
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Resultados de la verificación</h3>
        
        <div className={`p-4 rounded-md ${validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            {validationResult.success ? (
              <Check className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <X className="h-6 w-6 text-red-500 mr-2" />
            )}
            <span className={validationResult.success ? 'text-green-700' : 'text-red-700'}>
              {validationResult.success ? 'Verificación exitosa' : 'Verificación fallida'}
            </span>
          </div>
          
          {validationResult.score !== undefined && (
            <div className="mt-2">
              <span className="text-gray-700">Puntuación: </span>
              <span className="font-medium">{validationResult.score}/100</span>
            </div>
          )}
          
          {validationResult.message && (
            <p className="mt-2 text-gray-600">{validationResult.message}</p>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setValidationResult(null);
            setProgress(0);
            discardImage();
          }}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Nueva verificación
        </Button>
      </div>
    );
  };

  return (
    <div>
      {!validationResult ? (
        <Tabs 
          defaultValue={verificationMode} 
          onValueChange={setVerificationMode}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Básica</TabsTrigger>
            <TabsTrigger value="document">Con documento</TabsTrigger>
            <TabsTrigger value="advanced">Avanzada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="pt-4">
            {renderBasicForm()}
          </TabsContent>
          
          <TabsContent value="document" className="pt-4">
            {renderDocumentForm()}
          </TabsContent>
          
          <TabsContent value="advanced" className="pt-4">
            {renderAdvancedForm()}
          </TabsContent>
        </Tabs>
      ) : (
        renderResults()
      )}
    </div>
  );
}