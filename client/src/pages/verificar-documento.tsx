import { useState, useEffect } from "react";
import { SearchIcon, CheckCircle, XCircle, ArrowRight, FileSearch, Video, AlertTriangle, HelpCircle, Star, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useParams, useLocation } from "wouter";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import VerificationRewards from "@/components/document-verification/VerificationRewards";
import { Leaderboard } from "@/components/gamification/leaderboard";
import { UserProfile } from "@/components/gamification/user-profile";
import { GamificationModal } from "@/components/gamification/gamification-modal";
import { useQuery } from "@tanstack/react-query";

interface VerificationResult {
  verified: boolean;
  message?: string;
  documentInfo?: {
    title: string;
    signatureTimestamp: string;
    signerName: string;
    pdfAvailable?: boolean;
    documentId?: number;
  };
}

export default function VerificarDocumento() {
  const params = useParams();
  const [verificationCode, setVerificationCode] = useState(params.code || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [activeTab, setActiveTab] = useState("verificar");
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Obtener información del usuario autenticado
  const { data: user, isLoading: userLoading } = useQuery({ 
    queryKey: ["/api/user"],
    queryFn: async ({ signal }) => {
      const response = await apiRequest("GET", "/api/user", undefined, { signal });
      if (response.status === 401) return null;
      return await response.json();
    }
  });
  
  const isAuthenticated = !userLoading && !!user;
  
  // Verificar automáticamente si hay un código en la URL
  const verifyDocument = async (code: string) => {
    setIsVerifying(true);
    try {
      const response = await apiRequest("GET", `/api/verificar-documento/${code}`);
      const data = await response.json();
      setResult(data);
      
      // Si la verificación fue exitosa, mostramos la pestaña de verificación
      if (data.verified) {
        setActiveTab("verificar");
      }
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el documento. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (params.code) {
      setVerificationCode(params.code);
      verifyDocument(params.code);
    }
  }, [params.code]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese un código de verificación.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiRequest("GET", `/api/verificar-documento/${verificationCode}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error de verificación",
        description: "Ocurrió un error al verificar el documento. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Función para ir a la página de autenticación
  const handleGetStarted = () => {
    setLocation("/auth");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Verificación de Documentos</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Compruebe la autenticidad de los documentos firmados en nuestra plataforma
            ingresando el código de verificación proporcionado en el documento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-md h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileSearch className="h-5 w-5 text-primary mr-2" />
                      Verificar Autenticidad
                    </CardTitle>
                    <CardDescription>
                      Introduzca el código de verificación que aparece en el documento o que obtuvo al escanear el código QR.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <ExplanatoryVideo
                      title="¿Cómo verificar un documento?"
                      description="Aprenda a comprobar la autenticidad de documentos firmados en nuestra plataforma siguiendo estos sencillos pasos."
                      videoType="verification"
                      triggerLabel="Ver tutorial"
                    >
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        Ver tutorial
                      </Button>
                    </ExplanatoryVideo>
                    
                    <ExplanatoryVideo
                      title="¿Qué significa el resultado?"
                      description="Aprenda a interpretar los resultados de la verificación y qué hacer si un documento no se verifica correctamente."
                      videoType="explanation"
                      triggerLabel="Interpretar resultados"
                    >
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <HelpCircle className="h-4 w-4" />
                        Ayuda
                      </Button>
                    </ExplanatoryVideo>
                    
                    <GamificationModal 
                      trigger={
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          Recompensas
                        </Button>
                      }
                      defaultOpen={showGamificationModal}
                      onClose={() => setShowGamificationModal(false)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej. XX-XXXX-XX"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1"
                    maxLength={9}
                    pattern="[A-Z0-9]{2}-[A-Z0-9]{4}-[A-Z0-9]{2}"
                  />
                  <Button 
                    onClick={handleVerify} 
                    disabled={isVerifying} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isVerifying ? (
                      <>
                        <span className="animate-spin mr-2">
                          <SearchIcon className="h-4 w-4" />
                        </span>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-4 w-4 mr-2" />
                        Verificar
                      </>
                    )}
                  </Button>
                </div>

                {result && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-3 duration-300">
                    {result.verified ? (
                      <div className="space-y-4">
                        <Alert variant="default" className="bg-green-50 border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <AlertTitle className="text-green-800 text-lg">Documento Verificado</AlertTitle>
                          <AlertDescription className="text-green-700">
                            El documento es auténtico y ha sido validado correctamente en nuestra plataforma.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-gray-50 p-5 rounded-md border relative overflow-hidden">
                          <div className="absolute -right-8 -top-8 opacity-5 transform rotate-12">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>

                          <div className="absolute bottom-3 right-3">
                            <div className="text-xs text-gray-400 font-semibold tracking-wider transform -rotate-6">
                              VERIFICADO
                            </div>
                          </div>

                          <h3 className="font-medium mb-4 text-gray-800 text-base">Información del Documento</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start border-b border-gray-100 pb-2">
                              <span className="font-medium w-32 text-gray-700">Título:</span>
                              <span className="flex-1 text-gray-900 font-medium">{result.documentInfo?.title}</span>
                            </li>
                            <li className="flex items-start border-b border-gray-100 pb-2">
                              <span className="font-medium w-32 text-gray-700">Firmado por:</span>
                              <span className="flex-1 text-gray-900">{result.documentInfo?.signerName}</span>
                            </li>
                            <li className="flex items-start border-b border-gray-100 pb-2">
                              <span className="font-medium w-32 text-gray-700">Fecha de firma:</span>
                              <span className="flex-1 text-gray-900">
                                {result.documentInfo?.signatureTimestamp 
                                  ? formatDate(result.documentInfo.signatureTimestamp)
                                  : "No disponible"}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-medium w-32 text-gray-700">Estado:</span>
                              <span className="flex-1 text-green-600 font-medium flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verificado y válido
                              </span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-4 rounded-md bg-blue-50 border border-blue-200 flex justify-between items-center">
                          <p className="text-sm text-blue-800">
                            Este documento ha sido verificado con éxito. 
                            {result.documentInfo?.pdfAvailable 
                              ? " Puede descargarlo y conservarlo como un registro oficial con firma avanzada."
                              : " Este documento no tiene una versión firmada disponible para descargar."}
                          </p>
                          {result.documentInfo?.pdfAvailable && result.documentInfo?.documentId && (
                            <a 
                              href={`/api/documents/${result.documentInfo.documentId}/download-pdf`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
                                size="sm"
                              >
                                <div className="absolute inset-0 w-3 bg-blue-700 transform -skew-x-[20deg] -translate-x-full group-hover:animate-shine" />
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar PDF Firmado
                              </Button>
                            </a>
                          )}
                        </div>
                        
                        {/* Componente de recompensas de verificación */}
                        <VerificationRewards 
                          verificationCode={verificationCode}
                          userId={user?.id}
                          isAuthenticated={isAuthenticated}
                          onGetStarted={handleGetStarted}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <XCircle className="h-5 w-5" />
                          <AlertTitle className="text-lg">Documento No Verificado</AlertTitle>
                          <AlertDescription>
                            {result.message || "No se pudo verificar la autenticidad del documento."}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="bg-gray-50 p-4 rounded-md border flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-base mb-1 text-gray-800">¿Necesita ayuda con la verificación?</h3>
                            <p className="text-sm text-gray-600">
                              Si tiene problemas para verificar un documento, vea nuestro tutorial 
                              o póngase en contacto con soporte técnico.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <ExplanatoryVideo
                              title="¿Problemas con la verificación?"
                              description="Aprenda qué hacer cuando un documento no se verifica correctamente y cómo resolver los problemas más comunes."
                              videoType="tutorial"
                            >
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Ver soluciones
                              </Button>
                            </ExplanatoryVideo>
                            
                            <Button variant="secondary" size="sm" className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Contactar Soporte
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!result && !isVerifying && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 flex-shrink-0 rounded-full bg-blue-100 p-2">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">¿Dónde encuentro el código?</h3>
                        <p className="mt-1 text-xs text-gray-600">
                          El código de verificación se encuentra al final del documento, junto al código QR.
                          El formato es XX-XXXX-XX (por ejemplo: AB-1234-CD).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between text-xs text-gray-500 border-t pt-4">
                <div>
                  La verificación confirma que el documento fue firmado en nuestra plataforma.
                </div>
                <Button 
                  variant="link" 
                  className="text-xs" 
                  onClick={() => setLocation("/")}
                >
                  Volver al inicio
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Tabs defaultValue="ranking" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="ranking" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger value="perfil" disabled={!isAuthenticated} className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Mi Perfil
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ranking" className="mt-3">
                <Leaderboard 
                  userId={user?.id} 
                  showHeader={true} 
                  compact={true} 
                  limit={5}
                />
              </TabsContent>
              <TabsContent value="perfil" className="mt-3">
                {isAuthenticated && user ? (
                  <UserProfile userId={user.id} compact={true} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Perfil no disponible</CardTitle>
                      <CardDescription>Debes iniciar sesión para ver tu perfil</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={handleGetStarted} className="w-full">
                        Iniciar Sesión
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Banner de gamificación para usuarios no autenticados */}
            {!isAuthenticated && (
              <div className="mt-6 bg-primary/5 rounded-lg border border-primary/20 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">¡Gana verificando!</h3>
                    <p className="text-xs text-gray-600">Únete y gana puntos por verificar documentos</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="default" 
                  className="w-full" 
                  onClick={() => setShowGamificationModal(true)}
                >
                  Conocer más
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}