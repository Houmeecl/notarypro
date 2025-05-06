import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DocumentNavbar from '@/components/layout/DocumentNavbar';
import { FileUp, FileText, Upload, CheckCircle, User, Camera, Download, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Componente principal
const DocumentoFuncional: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useNavigate();
  const [activeTab, setActiveTab] = useState('subir');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [docSigned, setDocSigned] = useState(false);

  // Referencia al input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Crear URL para preview
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Disparar clic en input de archivo
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Verificación de identidad
  const handleIdentityVerification = () => {
    toast({
      title: "Verificación iniciada",
      description: "Procesando verificación de identidad en modo funcional...",
    });
    
    // Simulamos proceso de verificación en modo funcional
    setTimeout(() => {
      setIsVerified(true);
      toast({
        title: "✅ Verificación exitosa",
        description: "Identidad verificada correctamente en modo funcional",
      });
    }, 1500);
  };

  // Firma del documento
  const handleSignDocument = () => {
    if (!isVerified) {
      toast({
        title: "Verificación requerida",
        description: "Primero debe verificar su identidad",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Firmando documento",
      description: "Procesando firma electrónica en modo funcional...",
    });
    
    // Simulamos proceso de firma en modo funcional
    setTimeout(() => {
      setDocSigned(true);
      toast({
        title: "✅ Documento firmado",
        description: "Documento firmado correctamente en modo funcional",
      });
    }, 1500);
  };

  // Subir documento
  const handleUploadDocument = async () => {
    if (!selectedFile || !documentTitle) {
      toast({
        title: "Datos incompletos",
        description: "Por favor agregue un título y seleccione un documento",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Creamos un FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', documentTitle);
    formData.append('description', documentDescription);
    
    try {
      // En modo funcional, simulamos éxito pero mostramos el flujo completo
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "Documento subido correctamente",
          description: "Su documento ha sido procesado con éxito en modo funcional",
        });
        
        // Redirigir a pantalla de verificación
        setActiveTab('verificar');
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      console.error("Error al subir documento:", error);
      toast({
        title: "Error al subir documento",
        description: "Hubo un problema al procesar su documento. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Finalizar el proceso
  const handleCompleteProcess = () => {
    if (!docSigned) {
      toast({
        title: "Firma requerida",
        description: "Debe firmar el documento para completar el proceso",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "✅ Proceso completado",
      description: "El documento ha sido verificado, firmado y validado correctamente",
    });
    
    // Redirigir a vista de documento
    setTimeout(() => {
      navigate('/documents');
    }, 1500);
  };

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8 max-w-5xl">
        <Helmet>
          <title>Documento con Verificación - VecinoXpress</title>
        </Helmet>

        <h1 className="text-3xl font-bold mb-2">Certificación de Documento</h1>
        <p className="text-muted-foreground mb-8">
          Suba, verifique y firme su documento para darle validez legal
        </p>

        <Alert className="mb-6 bg-blue-50 border-blue-100">
          <CheckCircle className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-700 font-medium">Modo Funcional Activado</AlertTitle>
          <AlertDescription className="text-blue-600">
            El sistema está operando en modo funcional para pruebas QA. Todas las verificaciones y firmas serán simuladas correctamente.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="subir" disabled={activeTab !== 'subir' && activeTab !== 'verificar' && activeTab !== 'firmar'}>
              <FileUp className="h-4 w-4 mr-2" />
              Subir Documento
            </TabsTrigger>
            <TabsTrigger value="verificar" disabled={activeTab !== 'verificar' && activeTab !== 'firmar'}>
              <User className="h-4 w-4 mr-2" />
              Verificar Identidad
            </TabsTrigger>
            <TabsTrigger value="firmar" disabled={activeTab !== 'firmar'}>
              <FileText className="h-4 w-4 mr-2" />
              Firmar Documento
            </TabsTrigger>
          </TabsList>

          {/* Contenido de Subir Documento */}
          <TabsContent value="subir">
            <Card>
              <CardHeader>
                <CardTitle>Subir Documento</CardTitle>
                <CardDescription>
                  Seleccione el documento que desea certificar y agregar información relevante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="document-title">Título del documento</Label>
                    <Input 
                      id="document-title" 
                      placeholder="Ej. Contrato de arriendo" 
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="document-description">Descripción (opcional)</Label>
                    <Input 
                      id="document-description" 
                      placeholder="Breve descripción del documento" 
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <Label>Documento</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />

                    {!selectedFile ? (
                      <div 
                        onClick={handleSelectFileClick}
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-1">Haga clic para seleccionar un documento</p>
                        <p className="text-sm text-gray-500">
                          Formatos admitidos: PDF, DOC, DOCX, JPG, PNG
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-500 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium truncate">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleSelectFileClick}>
                            Cambiar
                          </Button>
                        </div>
                        {previewUrl && selectedFile.type.startsWith('image/') && (
                          <div className="mt-4 relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/document-categories')}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUploadDocument}
                  disabled={isUploading || !selectedFile}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Contenido de Verificar Identidad */}
          <TabsContent value="verificar">
            <Card>
              <CardHeader>
                <CardTitle>Verificación de Identidad</CardTitle>
                <CardDescription>
                  Complete la verificación de identidad para poder firmar el documento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Verificación Requerida</h3>
                      <p className="text-gray-600 mb-4">
                        Para firmar documentos con validez legal, es necesario verificar su identidad. 
                        En modo funcional, esta verificación será automática.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={handleIdentityVerification}
                          disabled={isVerified}
                        >
                          <Camera className="h-4 w-4" />
                          {isVerified ? "Verificado correctamente" : "Verificar con selfie"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Documento a certificar</h3>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">{documentTitle || "Documento sin título"}</p>
                        <p className="text-sm text-gray-500">
                          {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Tamaño desconocido"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('subir')}>
                  Atrás
                </Button>
                <Button
                  onClick={() => setActiveTab('firmar')}
                  disabled={!isVerified}
                  className="flex items-center gap-2"
                >
                  Continuar a firmar <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Contenido de Firmar Documento */}
          <TabsContent value="firmar">
            <Card>
              <CardHeader>
                <CardTitle>Firmar Documento</CardTitle>
                <CardDescription>
                  Firme electrónicamente su documento para darle validez legal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  <div className="bg-green-50 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Identidad Verificada</h3>
                    <p className="text-gray-600">
                      Su identidad ha sido verificada correctamente en modo funcional QA.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Documento a firmar</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">{documentTitle || "Documento sin título"}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </Button>
                    </div>
                    <div className="p-4 bg-white flex justify-center">
                      {previewUrl && selectedFile?.type.startsWith('image/') ? (
                        <img 
                          src={previewUrl} 
                          alt="Vista previa" 
                          className="max-h-[400px] object-contain"
                        />
                      ) : (
                        <div className="p-8 text-center">
                          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Vista previa no disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-blue-800">Firma Electrónica Simple</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Este documento será firmado con una firma electrónica simple con validación de identidad.
                  </p>
                  <Button
                    onClick={handleSignDocument}
                    disabled={docSigned}
                    className="w-full"
                  >
                    {docSigned ? "✅ Documento firmado" : "Firmar documento"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('verificar')}>
                  Atrás
                </Button>
                <Button
                  onClick={handleCompleteProcess}
                  disabled={!docSigned}
                >
                  Completar proceso
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DocumentoFuncional;