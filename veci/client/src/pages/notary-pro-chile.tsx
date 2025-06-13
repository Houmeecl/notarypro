import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Upload, 
  Video, 
  User, 
  Shield, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ChevronRight,
  Camera,
  QrCode,
  FileSignature,
  CreditCard,
  Building
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

/**
 * Implementación completa de NotaryPro Chile
 * Sistema de notarización digital remota según Ley 19.799
 */
const NotaryProChile: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inicio');
  const [, navigate] = useLocation();
  
  // Estados para gestión de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'regular' | 'notary' | 'corporate' | null>(null);

  useEffect(() => {
    // Comprobar si hay una sesión activa
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          
          // Determinar tipo de usuario
          if (userData.role === 'notary') {
            setUserType('notary');
          } else if (userData.role === 'corporate') {
            setUserType('corporate');
          } else {
            setUserType('regular');
          }
          
          toast({
            title: "Sesión activa",
            description: `Bienvenido de nuevo, ${userData.name || userData.username}`,
          });
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      }
    };
    
    checkSession();
  }, [toast]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>NotaryPro Chile - Notarización Digital Remota</title>
        <meta name="description" content="Plataforma de notarización digital remota para Chile, cumpliendo con Ley 19.799" />
      </Helmet>
      
      <header className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-800">NotaryPro Chile</h1>
            <p className="text-xl text-gray-600 mt-2">
              Notarización digital remota con validez legal
            </p>
          </div>
          
          {isLoggedIn ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/notary-profile')}>
                Mi Perfil
              </Button>
              <Button 
                onClick={() => navigate('/notary-dashboard')}
                className="bg-blue-700 hover:bg-blue-800"
              >
                Mi Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => navigate('/auth?register=true')}
                className="bg-blue-700 hover:bg-blue-800"
              >
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="inicio">Inicio</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="proceso">Cómo Funciona</TabsTrigger>
          <TabsTrigger value="legal">Marco Legal</TabsTrigger>
        </TabsList>
        
        {/* Contenido de la pestaña Inicio */}
        <TabsContent value="inicio">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="col-span-3">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg p-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">Notarización Digital Remota en Chile</h2>
                <p className="text-lg mb-6">
                  La primera plataforma en Chile que permite notarizar documentos legalmente desde cualquier lugar, sin trámites presenciales.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-white text-blue-900 hover:bg-blue-100"
                    size="lg"
                    onClick={() => navigate('/document-upload')}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Notarizar Documento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-blue-800"
                    size="lg"
                    onClick={() => setActiveTab('proceso')}
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Cómo Funciona
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Notarización Digital con Validez Legal</h3>
                <p className="text-gray-700">
                  NotaryPro Chile es la solución definitiva para la notarización digital de documentos en Chile, 
                  cumpliendo con todas las exigencias de la Ley 19.799 sobre Documentos Electrónicos, 
                  Firma Electrónica y Certificación de la Información.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-10 w-10 text-blue-600 mr-3" />
                      <h4 className="text-xl font-medium">Validez Legal</h4>
                    </div>
                    <p className="text-gray-600">
                      Todos los documentos notarizados a través de nuestra plataforma tienen plena validez legal 
                      en Chile gracias al cumplimiento de la Ley 19.799 y el uso de firma electrónica avanzada.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Video className="h-10 w-10 text-green-600 mr-3" />
                      <h4 className="text-xl font-medium">Verificación Remota</h4>
                    </div>
                    <p className="text-gray-600">
                      Verificamos su identidad mediante videollamada con un notario certificado y tecnología 
                      de reconocimiento biométrico que cumple con los estándares de seguridad más exigentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Acceso Rápido</CardTitle>
                  <CardDescription>Inicie su proceso de notarización ahora</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => navigate('/document-upload')}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Subir Documento para Notarizar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/verify-document')}
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Verificar Autenticidad de Documento
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/schedule-notary')}
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Programar Sesión con Notario
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">¿Nuevo en NotaryPro?</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Vea nuestro video tutorial de cómo notarizar documentos en menos de 15 minutos.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-blue-700">
                      Ver tutorial
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Alert className="bg-amber-50 border-amber-100">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 font-medium">¿Es empresa?</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Conozca nuestras soluciones de notarización masiva para empresas con descuentos exclusivos.
                      <Button variant="link" className="p-0 h-auto text-amber-700 mt-1">
                        Soluciones Corporativas
                      </Button>
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
              
              <div className="mt-6 bg-gray-50 border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Estadísticas de la plataforma</h3>
                  <Badge variant="outline">En tiempo real</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Documentos notarizados:</span>
                    <span className="font-semibold">53,289</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Notarios disponibles:</span>
                    <span className="font-semibold">124</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tiempo promedio:</span>
                    <span className="font-semibold">15 minutos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8">¿Por qué elegir NotaryPro Chile?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-700" />
                </div>
                <h4 className="text-xl font-medium mb-2">100% Legal</h4>
                <p className="text-gray-600">
                  Cumplimos con la Ley 19.799 y estamos certificados por el Ministerio de Justicia para proveer servicios de notarización digital.
                </p>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-700" />
                </div>
                <h4 className="text-xl font-medium mb-2">Rápido y Eficiente</h4>
                <p className="text-gray-600">
                  Complete su proceso de notarización en minutos, sin filas ni trámites presenciales. Disponible 24/7.
                </p>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-purple-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockIcon className="h-8 w-8 text-purple-700" />
                </div>
                <h4 className="text-xl font-medium mb-2">Seguridad Garantizada</h4>
                <p className="text-gray-600">
                  Utilizamos tecnología de encriptación avanzada y verificación biométrica para proteger su identidad y documentos.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Contenido de la pestaña Servicios */}
        <TabsContent value="servicios">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-blue-800 mb-6">Nuestros Servicios de Notarización Digital</h2>
              <p className="text-lg text-gray-700 mb-8">
                NotaryPro Chile ofrece una amplia gama de servicios notariales digitales que cumplen con todos los requisitos legales según la Ley 19.799 sobre Documentos Electrónicos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50">
                    <FileSignature className="h-8 w-8 text-blue-700 mb-2" />
                    <CardTitle>Notarización de Documentos</CardTitle>
                    <CardDescription>
                      Certificación legal de documentos electrónicos con validez nacional
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Contratos de todo tipo</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Poderes simples y notariales</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Declaraciones juradas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Actas de juntas y asambleas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Autorización de documentos</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/document-upload')}
                    >
                      Iniciar Notarización
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-100 to-green-50">
                    <Video className="h-8 w-8 text-green-700 mb-2" />
                    <CardTitle>Verificación de Identidad</CardTitle>
                    <CardDescription>
                      Validación segura de identidad mediante certificación biométrica
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Verificación por videollamada con notario</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Reconocimiento facial biométrico</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Validación de cédula de identidad</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Lectura NFC de cédula electrónica</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Certificado de verificación</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/identity-verification')}
                    >
                      Verificar Identidad
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50">
                    <Building className="h-8 w-8 text-purple-700 mb-2" />
                    <CardTitle>Servicios Corporativos</CardTitle>
                    <CardDescription>
                      Soluciones de notarización masiva para empresas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Notarización masiva de documentos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>API de integración para sistemas corporativos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Dashboard administrativo avanzado</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Firma masiva de contratos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Soporte prioritario 24/7</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/corporate-solutions')}
                    >
                      Soluciones Empresariales
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Planes y Tarifas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle>Plan Básico</CardTitle>
                    <CardDescription>
                      Para usuarios individuales y necesidades puntuales
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$5.990</span>
                      <span className="text-gray-500"> / por documento</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>1 documento notarizado</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Verificación de identidad incluida</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Certificado digital con QR</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Validez legal 100%</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Seleccionar Plan
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-green-200 relative">
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                    POPULAR
                  </div>
                  <CardHeader>
                    <CardTitle>Plan Estándar</CardTitle>
                    <CardDescription>
                      Para necesidades regulares de notarización
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$14.990</span>
                      <span className="text-gray-500"> / mensual</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>5 documentos notarizados al mes</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Verificación de identidad ilimitada</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Almacenamiento seguro por 5 años</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Soporte prioritario</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Acceso a plantillas legales</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Seleccionar Plan
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle>Plan Corporativo</CardTitle>
                    <CardDescription>
                      Para empresas y alto volumen de notarizaciones
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">Personalizado</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Notarizaciones ilimitadas</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>API de integración completa</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Dashboard administrativo</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Soporte técnico dedicado 24/7</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Almacenamiento seguro por 10 años</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Contactar Ventas
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Contenido de la pestaña Cómo Funciona */}
        <TabsContent value="proceso">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-800 mb-6">Cómo Funciona NotaryPro Chile</h2>
              <p className="text-lg text-gray-700 mb-8">
                Nuestro proceso de notarización digital es simple, seguro y totalmente legal. Siga estos pasos para obtener sus documentos notarizados en minutos.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="border rounded-lg p-6 relative">
                  <div className="absolute top-0 left-0 -mt-4 -ml-4 bg-blue-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-medium mb-3">Crear Cuenta</h3>
                    <p className="text-gray-600 mb-4">
                      Regístrese en nuestra plataforma y verifique su correo electrónico para activar su cuenta.
                    </p>
                    <div className="flex justify-center mb-4">
                      <User className="h-16 w-16 text-blue-500" />
                    </div>
                    <Button 
                      variant="link" 
                      className="text-blue-600 p-0 h-auto"
                      onClick={() => navigate('/auth?register=true')}
                    >
                      Registrarse ahora <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 relative">
                  <div className="absolute top-0 left-0 -mt-4 -ml-4 bg-blue-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-medium mb-3">Subir Documento</h3>
                    <p className="text-gray-600 mb-4">
                      Suba el documento que desea notarizar en formato PDF, DOC o JPG.
                    </p>
                    <div className="flex justify-center mb-4">
                      <Upload className="h-16 w-16 text-blue-500" />
                    </div>
                    <Button 
                      variant="link" 
                      className="text-blue-600 p-0 h-auto"
                      onClick={() => navigate('/document-upload')}
                    >
                      Subir documento <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 relative">
                  <div className="absolute top-0 left-0 -mt-4 -ml-4 bg-blue-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-medium mb-3">Verificar Identidad</h3>
                    <p className="text-gray-600 mb-4">
                      Complete la verificación de identidad mediante videollamada con un notario y validación de su cédula.
                    </p>
                    <div className="flex justify-center mb-4">
                      <Video className="h-16 w-16 text-blue-500" />
                    </div>
                    <Button 
                      variant="link" 
                      className="text-blue-600 p-0 h-auto"
                      onClick={() => navigate('/identity-verification')}
                    >
                      Más información <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 relative">
                  <div className="absolute top-0 left-0 -mt-4 -ml-4 bg-blue-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-medium mb-3">Recibir Documento Notarizado</h3>
                    <p className="text-gray-600 mb-4">
                      Reciba su documento notarizado con certificado digital, firma electrónica avanzada y código QR de verificación.
                    </p>
                    <div className="flex justify-center mb-4">
                      <FileSignature className="h-16 w-16 text-blue-500" />
                    </div>
                    <Button 
                      variant="link" 
                      className="text-blue-600 p-0 h-auto"
                      onClick={() => navigate('/sample-document')}
                    >
                      Ver ejemplo <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Verificación de Identidad en NotaryPro Chile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-medium mb-4 flex items-center">
                    <Camera className="h-6 w-6 text-blue-600 mr-2" />
                    Verificación Biométrica
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Nuestro sistema de verificación biométrica utiliza tecnología de reconocimiento facial para confirmar su identidad con un alto nivel de seguridad.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Comparación con foto de cédula de identidad</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Detección de vida para prevenir fraudes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Encriptación de datos biométricos</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-medium mb-4 flex items-center">
                    <Video className="h-6 w-6 text-blue-600 mr-2" />
                    Verificación por Videollamada
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Un notario certificado verificará su identidad mediante una videollamada en tiempo real, cumpliendo con todos los requisitos legales.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Notarios certificados disponibles 24/7</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Sesiones grabadas con consentimiento</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Validación de documentos en tiempo real</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-xl font-medium mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  Lectura NFC de Cédula Electrónica
                </h4>
                <p className="text-gray-700 mb-4">
                  Nuestra plataforma permite la lectura del chip NFC de la cédula de identidad electrónica chilena para una verificación aún más segura.
                </p>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Compatibilidad de dispositivos</AlertTitle>
                  <AlertDescription>
                    Para utilizar esta función necesita un smartphone o tablet con capacidad NFC. La mayoría de los dispositivos Android y los iPhone recientes son compatibles.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-2">¿Los documentos notarizados digitalmente tienen la misma validez legal que los notarizados tradicionalmente?</h4>
                  <p className="text-gray-700">
                    Sí, los documentos notarizados a través de NotaryPro Chile tienen plena validez legal según la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Certificación de la Información.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">¿Qué tipos de documentos puedo notarizar digitalmente?</h4>
                  <p className="text-gray-700">
                    Puede notarizar contratos, declaraciones juradas, poderes simples, actas, autorizaciones y la mayoría de los documentos que tradicionalmente requieren notarización.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">¿Cómo puedo verificar la autenticidad de un documento notarizado digitalmente?</h4>
                  <p className="text-gray-700">
                    Todos los documentos notarizados incluyen un código QR que puede escanear para verificar su autenticidad en tiempo real. También puede ingresar el código de verificación en nuestro sitio web.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">¿Cuánto tiempo tarda el proceso de notarización digital?</h4>
                  <p className="text-gray-700">
                    El proceso completo puede tardar entre 15 y 30 minutos, dependiendo del tipo de documento y la disponibilidad de notarios. Una vez verificada su identidad, las notarizaciones posteriores son más rápidas.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button onClick={() => navigate('/faq')}>
                  Ver todas las preguntas frecuentes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Contenido de la pestaña Marco Legal */}
        <TabsContent value="legal">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-800 mb-6">Marco Legal</h2>
              <p className="text-lg text-gray-700 mb-8">
                NotaryPro Chile opera bajo estricto cumplimiento de la legislación chilena sobre firma electrónica y documentos digitales.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 border rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Ley 19.799</h3>
                  <p className="text-gray-700 mb-4">
                    La Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Certificación de la Información es el marco legal principal que regula nuestros servicios.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Esta ley establece que los documentos electrónicos firmados con firma electrónica avanzada tienen la misma validez legal que los documentos en papel firmados de manera manuscrita.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={() => window.open('https://www.bcn.cl/leychile/navegar?idNorma=196640', '_blank')}>
                    Ver texto completo de la ley
                  </Button>
                </div>
                
                <div className="bg-white p-6 border rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Firma Electrónica Avanzada</h3>
                  <p className="text-gray-700 mb-4">
                    NotaryPro Chile utiliza Firma Electrónica Avanzada, que según la Ley 19.799 debe cumplir con los siguientes requisitos:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Estar certificada por un prestador acreditado</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Permitir la identificación del firmante</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Haber sido creada usando medios que el firmante mantiene bajo su exclusivo control</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Ser susceptible de verificación</span>
                    </li>
                  </ul>
                  <Badge>Certificación oficial</Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Certificaciones y Acreditaciones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-10 w-10 text-blue-600 mr-3" />
                    <h4 className="text-xl font-medium">Prestador Acreditado</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    NotaryPro Chile está acreditado como prestador de servicios de certificación según lo establecido por la Ley 19.799.
                  </p>
                  <Badge className="mt-2">Verificado</Badge>
                </div>
                
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <LockIcon className="h-10 w-10 text-green-600 mr-3" />
                    <h4 className="text-xl font-medium">ISO 27001</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Contamos con certificación ISO 27001 en seguridad de la información, garantizando los más altos estándares en protección de datos.
                  </p>
                  <Badge className="mt-2">Certificado</Badge>
                </div>
                
                <div className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-10 w-10 text-purple-600 mr-3" />
                    <h4 className="text-xl font-medium">Registro Civil</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nuestros procesos de verificación de identidad están validados por el Servicio de Registro Civil e Identificación de Chile.
                  </p>
                  <Badge className="mt-2">Autorizado</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Políticas de Seguridad y Privacidad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-medium mb-4">Seguridad de la Información</h4>
                  <p className="text-gray-700 mb-4">
                    Empleamos las más avanzadas medidas de seguridad para proteger la integridad y confidencialidad de sus documentos e información personal:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Encriptación de extremo a extremo (AES-256)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Autenticación de dos factores</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Auditorías de seguridad regulares</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Centros de datos certificados Tier III</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-medium mb-4">Protección de Datos Personales</h4>
                  <p className="text-gray-700 mb-4">
                    Cumplimos con la Ley 19.628 sobre Protección de la Vida Privada y todas las normativas aplicables en materia de protección de datos personales:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Consentimiento informado para el uso de datos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Políticas de retención y eliminación de datos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>No compartimos sus datos con terceros sin autorización</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Derechos ARCO garantizados (Acceso, Rectificación, Cancelación, Oposición)</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => navigate('/privacy-policy')}>
                  Política de Privacidad
                </Button>
                <Button variant="outline" onClick={() => navigate('/terms-of-service')}>
                  Términos de Servicio
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <footer className="mt-16 pt-10 border-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-bold text-lg mb-4">NotaryPro Chile</h4>
            <p className="text-gray-600 mb-4">
              La plataforma líder de notarización digital en Chile con validez legal bajo la Ley 19.799.
            </p>
            <div className="flex space-x-4">
              <Button size="icon" variant="ghost">
                <FacebookIcon className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <TwitterIcon className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <LinkedinIcon className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <InstagramIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Notarización de Documentos
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Verificación de Identidad
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Firma Electrónica Avanzada
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Soluciones Empresariales
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Cómo funciona
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Preguntas frecuentes
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Planes y precios
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-blue-700">
                  Blog
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contacto</h4>
            <address className="not-italic text-gray-600">
              <p>Av. Providencia 1208, Oficina 503</p>
              <p>Providencia, Santiago</p>
              <p className="mt-2">contacto@notarypro.cl</p>
              <p>+56 2 2123 4567</p>
            </address>
          </div>
        </div>
        
        <div className="border-t pt-6 pb-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} NotaryPro Chile. Todos los derechos reservados.
          </p>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button variant="link" className="text-xs text-gray-600">
              Términos y Condiciones
            </Button>
            <Button variant="link" className="text-xs text-gray-600">
              Política de Privacidad
            </Button>
            <Button variant="link" className="text-xs text-gray-600">
              Política de Cookies
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component necesario para los iconos
const Clock = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

const LockIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
};

const FacebookIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
};

const TwitterIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
};

const LinkedinIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
};

const InstagramIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
};

export default NotaryProChile;