import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, BriefcaseBusiness, GraduationCap, Handshake, Medal, ShieldCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define el esquema de validación para el formulario
const applyFormSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  profession: z.string().min(1, "La profesión es requerida"),
  message: z.string().min(10, "Por favor, incluye más detalles sobre tu experiencia"),
  resume: z.string().optional(),
});

export default function UneteAlEquipo() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof applyFormSchema>>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      profession: "",
      message: "",
      resume: "",
    },
  });

  function onSubmit(values: z.infer<typeof applyFormSchema>) {
    setIsSubmitting(true);
    
    // Simular envío de formulario
    setTimeout(() => {
      console.log(values);
      toast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <a className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </a>
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/95 to-primary rounded-lg shadow-lg p-8 md:p-12 mb-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Únete a Nuestro Equipo de Certificadores
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Forma parte de la revolución digital en certificación de documentos en Chile. Buscamos profesionales calificados para validar documentos electrónicos según la Ley 19.799.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90">
              Postula ahora
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                Conviértete en Certificador Digital
              </h2>
              
              <p className="text-gray-700 mb-6">
                En NotaryPro Chile estamos buscando profesionales de alto nivel para unirse a nuestro equipo de certificadores digitales. Como certificador, tendrás la responsabilidad de verificar identidades y autenticar documentos electrónicos, proporcionando un servicio esencial para la economía digital chilena.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Requisitos:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                <li>Ser profesional titulado en Derecho, Administración, Contabilidad o áreas afines</li>
                <li>Contar con al menos 3 años de experiencia profesional</li>
                <li>Conocimiento de la normativa chilena, especialmente la Ley 19.799</li>
                <li>Habilidades digitales avanzadas</li>
                <li>Atención meticulosa al detalle</li>
                <li>Disponibilidad para trabajar en horarios flexibles</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Beneficios:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Certificación profesional</h4>
                    <p className="text-sm text-gray-600">Formación y certificación como validador digital</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <BriefcaseBusiness className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Trabajo flexible</h4>
                    <p className="text-sm text-gray-600">Establece tu propio horario y trabaja desde donde quieras</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Medal className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ingresos atractivos</h4>
                    <p className="text-sm text-gray-600">Comisiones competitivas por cada documento certificado</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Comunidad profesional</h4>
                    <p className="text-sm text-gray-600">Forma parte de una red de profesionales en constante crecimiento</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">Comisiones y ganancias</h4>
                <p className="text-sm text-gray-700 mb-3">Como certificador recibirás una comisión por cada documento que verifiques y certifices:</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Firma electrónica simple:</span>
                    <span>$1.000 - $2.000 por documento</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Firma electrónica avanzada:</span>
                    <span>$3.000 - $5.000 por documento</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Verificación de identidad:</span>
                    <span>$2.000 por verificación</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm mt-2 pt-2 border-t">
                    <span>Potencial mensual (tiempo parcial):</span>
                    <span>$300.000 - $800.000</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4">El Proceso de Selección:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-6">
                <li>Envía tu solicitud a través del formulario</li>
                <li>Entrevista inicial (virtual)</li>
                <li>Verificación de antecedentes y referencias</li>
                <li>Curso de certificación (20 horas, online)</li>
                <li>Examen final de certificación</li>
                <li>Incorporación al equipo de certificadores</li>
              </ol>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex">
                  <ShieldCheck className="h-6 w-6 text-yellow-600 flex-shrink-0 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Importante: Acreditación Oficial</h4>
                    <p className="text-sm text-yellow-700">
                      Para ser certificador en nuestra plataforma, deberás completar nuestro curso de certificación acreditado ante el Ministerio de Economía, conforme a los requisitos de la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Testimonios de Nuestros Certificadores</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <p className="italic text-gray-700 mb-2">
                    "Unirme como certificador a NotaryPro ha sido una excelente decisión profesional. Puedo trabajar desde casa con horarios flexibles y generar ingresos adicionales significativos utilizando mi experiencia legal."
                  </p>
                  <p className="font-medium">Carlos Mendoza, Abogado - Santiago</p>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <p className="italic text-gray-700 mb-2">
                    "Como certificadora, no solo he podido diversificar mis ingresos, sino también estar a la vanguardia de la transformación digital en Chile. La plataforma es intuitiva y el soporte al equipo es excepcional."
                  </p>
                  <p className="font-medium">María Fernández, Contadora - Valparaíso</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Application Form */}
          <div>
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Postula como Certificador</CardTitle>
                <CardDescription>
                  Completa el formulario para iniciar tu proceso de selección
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez González" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="nombre@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+56 9 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profesión</FormLabel>
                          <FormControl>
                            <Input placeholder="Abogado, Contador, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia relevante</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Cuéntanos sobre tu experiencia profesional y por qué te interesa ser certificador..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adjuntar CV (opcional)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input
                                type="text"
                                placeholder="Sube tu CV o proporciona un enlace"
                                {...field}
                                className="rounded-r-none"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-l-none border-l-0"
                                onClick={() => {
                                  alert("La funcionalidad de carga de archivos se implementará próximamente");
                                }}
                              >
                                Explorar
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Al enviar tu solicitud, aceptas que revisemos tus antecedentes profesionales y te contactemos para continuar con el proceso de selección.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <Handshake className="h-5 w-5 mr-2 text-primary" />
                Curso de Certificación
              </h3>
              <p className="text-gray-700 mb-4">
                Todos nuestros certificadores deben completar nuestro curso de certificación digital, acreditado oficialmente en Chile, con un valor de:
              </p>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">$950.000</span>
                <p className="text-sm text-gray-500">Incluye certificación oficial</p>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">20 horas de formación online</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Certificación con validez legal</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Acceso a nuestra plataforma de certificación</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Oportunidad de ingresos recurrentes</span>
                </li>
              </ul>
              <Button className="w-full">
                Conocer más sobre el curso
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}