import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  User, 
  Shield, 
  CreditCard,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';
import { activarModoFuncional, esModoFuncionalActivo } from '@/lib/modoFuncionalActivator';
import { useToast } from '@/hooks/use-toast';

/**
 * Página central de activación y gestión del Modo Funcional
 * para pruebas QA sin validaciones estrictas
 */
const ModoFuncionalPage: React.FC = () => {
  const { toast } = useToast();
  const [modoFuncional, setModoFuncional] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('estado');
  
  // Verificar estado del modo funcional al cargar
  useEffect(() => {
    const activo = esModoFuncionalActivo();
    setModoFuncional(activo);
    
    if (activo) {
      toast({
        title: "Modo Funcional Activo",
        description: "El sistema está operando en modo funcional para pruebas QA sin validaciones estrictas",
      });
    }
  }, []);
  
  // Activar modo funcional
  const handleActivarModoFuncional = () => {
    const resultado = activarModoFuncional();
    
    if (resultado) {
      setModoFuncional(true);
      toast({
        title: "✅ Modo Funcional Activado",
        description: "El sistema ahora operará en modo funcional sin validaciones estrictas",
      });
    } else {
      toast({
        title: "Error al activar",
        description: "No se pudo activar el modo funcional. Consulte la consola para más detalles.",
        variant: "destructive",
      });
    }
  };
  
  // Recargar la página con parámetros del modo funcional
  const handleRecargarConModoFuncional = () => {
    // Añadir parámetros funcionales a la URL
    const url = new URL(window.location.href);
    url.searchParams.set('functional', 'true');
    url.searchParams.set('real', 'true');
    url.searchParams.set('qa', 'true');
    
    // Recargar con la nueva URL
    window.location.href = url.toString();
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Helmet>
        <title>Modo Funcional QA - VecinoXpress</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Modo Funcional</h1>
            <Badge variant={modoFuncional ? "default" : "outline"} className={modoFuncional ? "bg-green-600" : ""}>
              {modoFuncional ? "Activado" : "Desactivado"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Configuración y gestión del modo para pruebas QA sin validaciones estrictas
          </p>
        </div>
        
        {!modoFuncional && (
          <Button onClick={handleActivarModoFuncional} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Activar Modo Funcional
          </Button>
        )}
      </div>
      
      {modoFuncional && (
        <Alert className="mb-6 bg-green-50 border-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 font-medium">Modo Funcional Activo</AlertTitle>
          <AlertDescription className="text-green-600">
            El sistema está operando en modo funcional. Todas las verificaciones están desactivadas,
            permitiendo probar el flujo completo sin interrupciones.
          </AlertDescription>
        </Alert>
      )}
      
      {!modoFuncional && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo Producción sin bypasses</AlertTitle>
          <AlertDescription>
            Actualmente el sistema está en modo producción con todas las validaciones activas.
            Esto puede impedir completar flujos de prueba si no se cumplen todos los requisitos reales.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="estado">Estado del sistema</TabsTrigger>
          <TabsTrigger value="modulos">Módulos disponibles</TabsTrigger>
          <TabsTrigger value="ayuda">Ayuda</TabsTrigger>
        </TabsList>
        
        {/* Estado del sistema */}
        <TabsContent value="estado">
          <Card>
            <CardHeader>
              <CardTitle>Estado actual del sistema</CardTitle>
              <CardDescription>
                Resumen de la configuración del modo funcional y estados de los módulos principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center text-lg">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Sistema de verificación
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Modo de verificación:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Funcional" : "Estricto"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Salteo de verificaciones:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Activado" : "Desactivado"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Verificación NFC:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Real"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Sistema de documentos
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Modo de operación:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Funcional" : "Producción"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Validación de firma:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Estricta"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Firma avanzada:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Real (eToken)"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    Sistema RON
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Modo de operación:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Funcional" : "Real"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Check de identidad:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulado" : "Estricto"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Validación documental:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Estricta"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center text-lg">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    Sistema de pagos
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Modo de operación:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Funcional" : "Producción"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Verificación de pago:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Real"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Pasarela de pagos:</span>
                      <Badge variant={modoFuncional ? "default" : "destructive"}>
                        {modoFuncional ? "Simulada" : "Real"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {modoFuncional ? (
                <Button onClick={handleRecargarConModoFuncional} className="ml-auto flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Recargar con parámetros funcionales
                </Button>
              ) : (
                <Button onClick={handleActivarModoFuncional} className="ml-auto flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Activar modo funcional
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Módulos disponibles */}
        <TabsContent value="modulos">
          <Card>
            <CardHeader>
              <CardTitle>Módulos disponibles en modo funcional</CardTitle>
              <CardDescription>
                Acceda directamente a los módulos más importantes configurados en modo funcional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Link href="/documento-funcional">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-md bg-blue-50">
                          <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Documento con firma</h3>
                          <p className="text-sm text-muted-foreground">
                            Subir, verificar y firmar documentos con validez legal
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">
                        Incluye verificación de identidad y firma electrónica en modo funcional
                      </p>
                      <div className="flex justify-end mt-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Link href="/verificacion-identidad-demo">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-md bg-green-50">
                          <User className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Verificación de identidad</h3>
                          <p className="text-sm text-muted-foreground">
                            Verificación biométrica y documental
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">
                        Sistema de verificación con cédula de identidad y biometría facial
                      </p>
                      <div className="flex justify-end mt-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Link href="/documents">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-md bg-purple-50">
                          <FileText className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Documentos</h3>
                          <p className="text-sm text-muted-foreground">
                            Gestión de documentos electrónicos
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">
                        Ver, editar y gestionar documentos en el sistema
                      </p>
                      <div className="flex justify-end mt-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Link href="/ron-platform">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-md bg-indigo-50">
                          <User className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Plataforma RON</h3>
                          <p className="text-sm text-muted-foreground">
                            Certificación remota en vivo
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">
                        Sistema de verificación y certificación notarial en línea
                      </p>
                      <div className="flex justify-end mt-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!modoFuncional && (
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Modo funcional inactivo</AlertTitle>
                  <AlertDescription>
                    Los módulos pueden no funcionar correctamente si el modo funcional no está activado.
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Ayuda */}
        <TabsContent value="ayuda">
          <Card>
            <CardHeader>
              <CardTitle>Ayuda del Modo Funcional</CardTitle>
              <CardDescription>
                Información y resolución de problemas con el modo funcional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">¿Qué es el Modo Funcional?</h3>
                <p className="text-gray-600 mb-4">
                  El Modo Funcional es una configuración especial diseñada para pruebas QA que permite:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Saltear verificaciones estrictas de identidad</li>
                  <li>Simular firmas electrónicas avanzadas sin eToken real</li>
                  <li>Procesar documentos sin requisitos completos</li>
                  <li>Validar sesiones RON sin verificaciones reales</li>
                  <li>Completar flujos de negocio completos para pruebas</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Resolución de problemas</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">El modo funcional no se activa correctamente</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Intente recargar la página o utilice el botón "Recargar con parámetros funcionales" 
                      que añade los parámetros necesarios a la URL.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Las verificaciones siguen fallando en modo funcional</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Es posible que el módulo específico no esté correctamente configurado para modo funcional.
                      Verifique la consola del navegador para mensajes de error específicos.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Verificación NFC no funciona en modo funcional</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      El sistema NFC puede requerir permisos especiales en algunos navegadores.
                      En modo funcional, debería saltear estos requisitos automáticamente.
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-100">
                <div className="flex-shrink-0 mr-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <AlertTitle className="text-blue-700">Uso responsable</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    El Modo Funcional está diseñado exclusivamente para pruebas QA y desarrollo.
                    No debe utilizarse en entornos de producción real donde se requieran 
                    verificaciones y validaciones legales estrictas.
                  </AlertDescription>
                </div>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              {!modoFuncional ? (
                <Button onClick={handleActivarModoFuncional} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Activar modo funcional
                </Button>
              ) : (
                <Button onClick={handleRecargarConModoFuncional} variant="outline" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Recargar parámetros
                </Button>
              )}
              
              <Link href="/documento-funcional">
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Probar documento funcional
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModoFuncionalPage;