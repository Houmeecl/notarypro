import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, FileCheck, GraduationCap, ShieldCheck, Star, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import { CorporateLogo, CertifierBadge } from "@/components/ui/logo/CorporateLogo";

export default function CursoCertificador() {
  const [activeTab, setActiveTab] = useState("info");
  const [enrollmentStep, setEnrollmentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    education: "",
    institution: "",
    agreeTerms: false,
    ageConfirm: false,
    educationConfirm: false,
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleNext = () => {
    if (enrollmentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast({
          title: "Campos incompletos",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }
      setEnrollmentStep(2);
    } else if (enrollmentStep === 2) {
      if (!formData.education || !formData.institution) {
        toast({
          title: "Campos incompletos",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        });
        return;
      }
      setEnrollmentStep(3);
    } else if (enrollmentStep === 3) {
      if (!formData.agreeTerms || !formData.ageConfirm || !formData.educationConfirm) {
        toast({
          title: "Confirmación requerida",
          description: "Debe aceptar todos los términos y condiciones para continuar",
          variant: "destructive",
        });
        return;
      }
      // Redirect to payment page
      setEnrollmentStep(4);
    }
  };

  const handleBack = () => {
    if (enrollmentStep > 1) {
      setEnrollmentStep(enrollmentStep - 1);
    }
  };

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const handleSubmitPayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      
      // Crear preferencia de pago usando la API de MercadoPago
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: 'Curso de Certificación Profesional',
              description: 'Acceso completo al curso de certificación profesional',
              quantity: 1,
              unit_price: 390000, // 390.000 CLP
              currency_id: 'CLP'
            }
          ],
          backUrls: {
            success: `${window.location.origin}/payment-success?course=certifier&email=${encodeURIComponent(formData.email)}`,
            failure: `${window.location.origin}/payment-error?course=certifier`,
            pending: `${window.location.origin}/payment-pending?course=certifier`
          },
          externalReference: `certifier-course-${formData.email}`,
          customer: {
            email: formData.email,
            name: formData.fullName
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el pago');
      }
      
      const paymentData = await response.json();
      
      // Si tenemos la URL de inicio de pago, redirigir al usuario
      if (paymentData.init_point) {
        window.location.href = paymentData.init_point;
      } else {
        toast({
          title: "Error al procesar el pago",
          description: "No se pudo obtener el enlace de pago. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setPaymentError(error instanceof Error ? error.message : 'Error desconocido al procesar el pago');
      toast({
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : 'Error desconocido al procesar el pago',
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <CorporateLogo size="lg" />
            </div>
            
            <div className="flex justify-center mb-6">
              <CertifierBadge size="lg" className="mb-2" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Curso de Certificación Profesional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conviértase en un Certificador Profesional autorizado y forme parte de la revolución digital en certificación de documentos en Chile.
            </p>
            <div className="flex justify-center mt-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">
                Inscripciones Abiertas
              </Badge>
            </div>
          </header>

          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
              <TabsTrigger value="info">Información del Curso</TabsTrigger>
              <TabsTrigger value="requirements">Requisitos</TabsTrigger>
              <TabsTrigger value="enroll">Inscripción</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre el Curso</CardTitle>
                      <CardDescription>
                        Formación completa para certificadores profesionales
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                        <p className="text-gray-700">
                          El Curso de Certificación Profesional está diseñado para formar expertos
                          en certificación digital de documentos con plena validez legal bajo la
                          Ley 19.799 de Chile sobre documentos electrónicos y firma electrónica.
                        </p>
                        <p className="text-gray-700 mt-2">
                          Al completar este curso, estará calificado para certificar documentos
                          a través de nuestra plataforma, utilizando el innovador sistema RON
                          (Remote Online Notarization) para verificar identidades y validar
                          documentos de manera remota.
                        </p>
                      </div>

                      <div className="rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-100">
                          <ExplanatoryVideo
                            title="Curso de Certificación Profesional"
                            description="Este video explica el contenido del curso, metodología de enseñanza y las oportunidades profesionales que ofrece convertirse en certificador autorizado en Chile."
                            videoType="tutorial"
                            triggerLabel="Ver presentación del curso"
                          >
                            <div className="w-full h-full flex items-center justify-center cursor-pointer relative group">
                              <img 
                                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                                alt="Presentación del curso"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="bg-white rounded-full p-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </ExplanatoryVideo>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Lo que aprenderá</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Marco legal de certificación electrónica</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Verificación de identidad remota</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Validación de documentos digitales</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Firma electrónica avanzada</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Protocolos de seguridad y privacidad</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Uso de la plataforma de certificación</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Contenido del Curso</h3>
                        <div className="space-y-3">
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 1: Marco Normativo Chileno</h4>
                            <p className="text-sm text-gray-600">Ley 19.799 sobre documentos electrónicos y firma electrónica, Reglamento de la Ley 19.799, Decreto Supremo N° 181.</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 2: Entidades Certificadoras y Firma Electrónica</h4>
                            <p className="text-sm text-gray-600">Firma electrónica simple y avanzada, estándares de certificación, acreditación ante la Entidad Acreditadora (MINSEGPRES).</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 3: Verificación de Identidad y Autenticación</h4>
                            <p className="text-sm text-gray-600">Técnicas biométricas, validación de documentos oficiales chilenos (Cédula de Identidad, Pasaporte), protocolos de seguridad CLUF.</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 4: Sistema RON para Chile</h4>
                            <p className="text-sm text-gray-600">Implementación del sistema RON en el contexto jurídico chileno, sesiones de certificación remota, evidencia del acto jurídico.</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 5: Documentos Electrónicos y Validez Jurídica</h4>
                            <p className="text-sm text-gray-600">Tipos de documentos certificables, documentos excluidos según legislación chilena, valor probatorio.</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 6: Protección de Datos Personales</h4>
                            <p className="text-sm text-gray-600">Ley 19.628 sobre protección de datos personales, obligaciones del certificador, consentimiento informado.</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 7: Responsabilidad Civil y Penal</h4>
                            <p className="text-sm text-gray-600">Responsabilidades del certificador, sanciones por falsificación de instrumentos, delitos informáticos (Ley 21.459).</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-medium">Módulo 8: Certificación Práctica</h4>
                            <p className="text-sm text-gray-600">Casos prácticos basados en la jurisprudencia chilena, simulaciones, evaluación final.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Detalles del Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Duración</h4>
                            <p className="text-sm text-gray-600">8 semanas (80 horas)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Modalidad</h4>
                            <p className="text-sm text-gray-600">100% online con sesiones prácticas</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileCheck className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Certificación</h4>
                            <p className="text-sm text-gray-600">Certificado oficial al aprobar</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Instructor</h4>
                            <p className="text-sm text-gray-600">Expertos en derecho digital y certificación</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">Acreditación</h4>
                            <p className="text-sm text-gray-600">Certificación válida en todo Chile</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t my-6"></div>

                      <div>
                        <div className="mb-4 flex items-baseline justify-between">
                          <h3 className="font-bold text-2xl">$390.000 CLP</h3>
                          <span className="text-sm text-gray-500 line-through">$450.000 CLP</span>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => setActiveTab("enroll")}
                        >
                          Inscribirse Ahora
                        </Button>
                        <p className="text-xs text-gray-500 mt-2 text-center">Plazas limitadas por curso</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Beneficios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span className="text-sm">Acceso a la plataforma de certificación</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span className="text-sm">Comisiones por cada documento certificado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span className="text-sm">Asesoría legal permanente</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span className="text-sm">Actualización profesional continua</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span className="text-sm">Comunidad de certificadores profesionales</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos para Certificadores</CardTitle>
                  <CardDescription>
                    Para garantizar la calidad del servicio, todos los aspirantes deben cumplir con estos requisitos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <GraduationCap className="h-5 w-5 text-primary mr-2" />
                        Requisitos académicos
                      </h3>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Formación requerida</h4>
                          <p className="text-gray-700 mb-2">
                            Debe cumplir al menos uno de los siguientes requisitos:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ser estudiante de Derecho (tercer año en adelante)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ser egresado o licenciado en Derecho</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ser estudiante de Técnico Jurídico (segundo año en adelante)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ser egresado o titulado de Técnico Jurídico</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Documentación requerida</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Certificado de estudiante regular o título</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Concentración de notas (estudiantes)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Curriculum Vitae actualizado</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="h-5 w-5 text-primary mr-2" />
                        Requisitos personales
                      </h3>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Edad y disponibilidad</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ser mayor de 21 años</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Disponibilidad para sesiones de certificación online</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Contar con equipo con cámara y conexión estable a internet</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Requisitos técnicos</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Computadora con cámara HD (720p o superior)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Conexión a internet de al menos 10 Mbps</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>Ambiente adecuado para videollamadas (silencioso y bien iluminado)</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800">Importante</h4>
                              <p className="text-sm text-yellow-700">
                                Todos los aspirantes deberán aprobar una evaluación final con un mínimo de 80% para obtener la certificación.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <Button 
                      onClick={() => setActiveTab("enroll")}
                      className="px-8"
                    >
                      Postular al Curso
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enroll" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inscripción al Curso de Certificador</CardTitle>
                  <CardDescription>
                    Complete el formulario para iniciar su proceso de inscripción
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollmentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Ingrese su nombre completo" 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          type="email" 
                          placeholder="correo@ejemplo.com" 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone">Teléfono de contacto</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+56 9 XXXX XXXX" 
                        />
                      </div>
                    </div>
                  )}

                  {enrollmentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <Label htmlFor="education">Nivel de educación</Label>
                        <select 
                          id="education" 
                          name="education" 
                          value={formData.education}
                          onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="estudiante_derecho">Estudiante de Derecho</option>
                          <option value="egresado_derecho">Egresado de Derecho</option>
                          <option value="titulado_derecho">Titulado en Derecho</option>
                          <option value="estudiante_tecnico">Estudiante de Técnico Jurídico</option>
                          <option value="egresado_tecnico">Egresado de Técnico Jurídico</option>
                          <option value="titulado_tecnico">Titulado en Técnico Jurídico</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="institution">Institución educativa</Label>
                        <Input 
                          id="institution" 
                          name="institution" 
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="Universidad o instituto" 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Documentos requeridos</Label>
                        <div className="bg-gray-50 p-4 rounded-lg border mt-2">
                          <p className="text-sm text-gray-700">
                            Luego de completar el pago, se le solicitará subir los siguientes documentos para verificar sus credenciales:
                          </p>
                          <ul className="mt-3 space-y-1">
                            <li className="text-sm flex items-start gap-2">
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary text-[10px]">1</span>
                              </div>
                              <span>Certificado de alumno regular o título profesional/técnico</span>
                            </li>
                            <li className="text-sm flex items-start gap-2">
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary text-[10px]">2</span>
                              </div>
                              <span>Cédula de identidad (ambos lados)</span>
                            </li>
                            <li className="text-sm flex items-start gap-2">
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary text-[10px]">3</span>
                              </div>
                              <span>Curriculum Vitae actualizado</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {enrollmentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-medium mb-3">Confirme que cumple con los siguientes requisitos:</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="ageConfirm" 
                              checked={formData.ageConfirm}
                              onCheckedChange={(checked) => handleCheckboxChange("ageConfirm", checked as boolean)}
                            />
                            <Label 
                              htmlFor="ageConfirm" 
                              className="text-sm font-normal leading-tight cursor-pointer"
                            >
                              Declaro ser mayor de 21 años
                            </Label>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="educationConfirm" 
                              checked={formData.educationConfirm}
                              onCheckedChange={(checked) => handleCheckboxChange("educationConfirm", checked as boolean)}
                            />
                            <Label 
                              htmlFor="educationConfirm" 
                              className="text-sm font-normal leading-tight cursor-pointer"
                            >
                              Confirmo que soy estudiante o egresado de la carrera de Derecho o Técnico Jurídico y 
                              puedo proporcionar documentación que lo acredite
                            </Label>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="agreeTerms" 
                              checked={formData.agreeTerms}
                              onCheckedChange={(checked) => handleCheckboxChange("agreeTerms", checked as boolean)}
                            />
                            <Label 
                              htmlFor="agreeTerms" 
                              className="text-sm font-normal leading-tight cursor-pointer"
                            >
                              Acepto los <Link href="/terminos-y-condiciones" className="text-primary hover:underline">términos y condiciones</Link> y la 
                              <Link href="/politica-de-privacidad" className="text-primary hover:underline"> política de privacidad</Link>.
                              Entiendo que mis datos serán utilizados para el proceso de inscripción
                              al curso y posteriores comunicaciones relacionadas con el mismo.
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <div className="flex gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Información importante</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Al completar este paso, será redirigido a nuestra pasarela de pagos para realizar el 
                              pago del curso. Una vez confirmado el pago, recibirá sus credenciales de acceso al 
                              curso en el correo electrónico proporcionado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {enrollmentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Resumen de su inscripción</h3>
                        <p className="text-gray-600">Verifique los detalles antes de proceder al pago</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Curso:</span>
                            <span className="font-medium">Certificación Profesional</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duración:</span>
                            <span>8 semanas (80 horas)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Modalidad:</span>
                            <span>100% online</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span>{formData.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Correo:</span>
                            <span>{formData.email}</span>
                          </div>
                          <div className="border-t my-2"></div>
                          <div className="flex justify-between font-bold">
                            <span>Total a pagar:</span>
                            <span>$390.000 CLP</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Seleccione su método de pago:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="border rounded-md p-3 cursor-pointer bg-white hover:bg-gray-50 relative flex items-center">
                            <input type="radio" name="paymentMethod" className="h-4 w-4 mr-2" defaultChecked />
                            <span>Tarjeta de crédito/débito</span>
                          </div>
                          <div className="border rounded-md p-3 cursor-pointer bg-white hover:bg-gray-50 relative flex items-center">
                            <input type="radio" name="paymentMethod" className="h-4 w-4 mr-2" />
                            <span>Transferencia bancaria</span>
                          </div>
                          <div className="border rounded-md p-3 cursor-pointer bg-white hover:bg-gray-50 relative flex items-center">
                            <input type="radio" name="paymentMethod" className="h-4 w-4 mr-2" />
                            <span>WebPay</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-3">Datos de pago:</h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor="cardNumber">Número de tarjeta</Label>
                              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor="expiry">Fecha de expiración</Label>
                                <Input id="expiry" placeholder="MM/AA" />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                              <Input id="cardName" placeholder="Nombre como aparece en la tarjeta" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {enrollmentStep > 1 && (
                    <Button variant="outline" onClick={handleBack}>
                      Volver
                    </Button>
                  )}
                  {enrollmentStep < 4 ? (
                    <Button onClick={handleNext} className={enrollmentStep === 1 ? "ml-auto" : ""}>
                      Continuar
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmitPayment} 
                      disabled={paymentLoading}
                      className="relative"
                    >
                      {paymentLoading ? (
                        <>
                          <span className="opacity-0">Realizar Pago</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </>
                      ) : (
                        "Realizar Pago"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="bg-primary/5 rounded-lg p-6 border border-primary/10 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-3 text-center">¿Por qué convertirse en Certificador?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Desarrollo Profesional</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Amplíe sus habilidades profesionales y acceda a nuevas oportunidades laborales
                </p>
              </div>
              <div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Servicio Pionero</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Forme parte de la primera plataforma de certificación online de Chile
                </p>
              </div>
              <div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Ingresos Adicionales</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Genere ingresos adicionales certificando documentos en horarios flexibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}