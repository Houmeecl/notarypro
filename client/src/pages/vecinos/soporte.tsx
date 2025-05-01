import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ChevronRight, HelpCircle, Phone, Mail, MessageSquare, 
  ArrowLeft, CheckCircle, AlertCircle, FileText, Youtube
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Tipo de datos para categorías de ayuda
interface HelpCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

// Tipo de datos para preguntas frecuentes
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Categorías de ayuda
const helpCategories: HelpCategory[] = [
  {
    id: "app",
    title: "Uso de la aplicación",
    icon: <HelpCircle className="h-6 w-6 text-blue-600" />,
    description: "Aprende a usar la aplicación de Vecinos Xpress"
  },
  {
    id: "documents",
    title: "Documentos y certificaciones",
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    description: "Información sobre los documentos que puedes procesar"
  },
  {
    id: "payments",
    title: "Pagos y comisiones",
    icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
    description: "Todo sobre el pago de comisiones y retiros"
  },
  {
    id: "technical",
    title: "Soporte técnico",
    icon: <AlertCircle className="h-6 w-6 text-blue-600" />,
    description: "Ayuda con problemas técnicos y errores"
  },
  {
    id: "videos",
    title: "Tutoriales en video",
    icon: <Youtube className="h-6 w-6 text-red-600" />,
    description: "Aprende con nuestros tutoriales en video"
  }
];

// Preguntas frecuentes
const faqs: FAQ[] = [
  {
    id: "faq1",
    question: "¿Cómo instalo la aplicación en mi dispositivo?",
    answer: "Puedes descargar la aplicación de Vecinos Xpress desde nuestra página web, en la sección 'Descargar App'. También puedes usar la versión web, que no requiere instalación, desde cualquier navegador.",
    category: "app"
  },
  {
    id: "faq2",
    question: "¿Qué hago si olvidé mi contraseña?",
    answer: "En la pantalla de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?' y sigue las instrucciones para restablecerla. Te enviaremos un correo electrónico con los pasos a seguir.",
    category: "app"
  },
  {
    id: "faq3",
    question: "¿Qué documentos puedo procesar en mi negocio?",
    answer: "Puedes procesar una variedad de documentos como contratos de arriendo, contratos de trabajo, declaraciones juradas, autorizaciones de viaje, finiquitos y certificados de residencia.",
    category: "documents"
  },
  {
    id: "faq4",
    question: "¿Cómo se verifica la autenticidad de un documento?",
    answer: "Cada documento procesado recibe un código único de verificación. Los clientes pueden verificar la autenticidad del documento en nuestra página web oficial utilizando este código.",
    category: "documents"
  },
  {
    id: "faq5",
    question: "¿Cuándo recibo mis comisiones?",
    answer: "Las comisiones se acreditan inmediatamente después de procesar un documento. Puedes ver tu balance actual en el panel de control de tu cuenta.",
    category: "payments"
  },
  {
    id: "faq6",
    question: "¿Cómo solicito un retiro de mis comisiones?",
    answer: "En tu panel de control, dirígete a la sección 'Finanzas' y haz clic en 'Solicitar retiro'. El monto mínimo de retiro es de $5.000 CLP y las transferencias se procesan en un plazo de 1-3 días hábiles.",
    category: "payments"
  },
  {
    id: "faq7",
    question: "La aplicación no se inicia o se cierra inesperadamente",
    answer: "Asegúrate de tener la última versión instalada. Si el problema persiste, intenta reiniciar tu dispositivo. Si aún tienes problemas, comunícate con nuestro equipo de soporte.",
    category: "technical"
  },
  {
    id: "faq8",
    question: "¿Qué hago si la impresora no funciona con la aplicación?",
    answer: "Verifica que tu impresora esté conectada correctamente y que tenga los controladores actualizados. Si usas una impresora térmica, asegúrate de que sea compatible con nuestra aplicación.",
    category: "technical"
  },
  {
    id: "faq9",
    question: "¿Dónde puedo encontrar los tutoriales en video?",
    answer: "Puedes encontrar todos nuestros tutoriales en video en nuestro canal oficial de YouTube. También están disponibles en la sección 'Tutoriales' de nuestra aplicación.",
    category: "videos"
  },
  {
    id: "faq10",
    question: "¿Cómo puedo procesar un documento en la aplicación?",
    answer: "En nuestro canal de YouTube tenemos un tutorial paso a paso que te enseña cómo procesar cada tipo de documento. Visita el canal para ver este y otros tutoriales útiles.",
    category: "videos"
  }
];

export default function VecinosSoporte() {
  const [_, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submittedForm, setSubmittedForm] = useState(false);
  
  // Filtrar FAQs por categoría
  const filteredFaqs = activeCategory 
    ? faqs.filter(faq => faq.category === activeCategory)
    : faqs;
  
  // Manejar cambios en el formulario
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Mutación para enviar formulario de contacto
  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      const res = await apiRequest("POST", "/api/vecinos/contact", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al enviar mensaje");
      }
      return await res.json();
    },
    onSuccess: () => {
      setSubmittedForm(true);
      toast({
        title: "Mensaje enviado",
        description: "Hemos recibido tu mensaje. Te responderemos a la brevedad.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío de formulario
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-blue-700 mb-4"
            onClick={() => setLocation("/vecinos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Inicio
          </Button>
          <h1 className="text-3xl font-bold mb-2">Centro de Ayuda</h1>
          <p className="text-lg">Encuentra respuestas a tus preguntas y contacta con nuestro equipo de soporte</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Categorías de ayuda */}
        <section>
          <h2 className="text-2xl font-bold mb-6">¿Cómo podemos ayudarte?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {helpCategories.map(category => (
              <Card 
                key={category.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${activeCategory === category.id ? 'border-blue-600 bg-blue-50' : ''}`}
                onClick={() => setActiveCategory(category.id === activeCategory ? null : category.id)}
              >
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4">{category.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Preguntas frecuentes */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {activeCategory && (
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => setActiveCategory(null)}
            >
              Ver todas las preguntas
            </Button>
          )}
        </section>
        
        <Separator className="my-12" />
        
        {/* Contacto */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Contáctanos</h2>
            <p className="text-gray-600 mb-6">
              ¿No encontraste lo que buscabas? Envíanos un mensaje y te responderemos a la brevedad.
            </p>
            
            {submittedForm ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
                  <p className="text-gray-600 mb-4">
                    Hemos recibido tu mensaje. Te responderemos a la brevedad a través del correo electrónico proporcionado.
                  </p>
                  <Button 
                    onClick={() => {
                      setSubmittedForm(false);
                      setContactForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: ""
                      });
                    }}
                  >
                    Enviar otro mensaje
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre completo"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="subject">
                    Asunto
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Motivo de contacto"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="message">
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </form>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Información de contacto</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Teléfono de soporte</h3>
                      <p className="text-gray-600">+56 2 2123 4567</p>
                      <p className="text-sm text-gray-500">
                        Lunes a viernes: 9:00 - 18:00 hrs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Correo electrónico</h3>
                      <p className="text-gray-600">socios@vecinosxpress.cl</p>
                      <p className="text-sm text-gray-500">
                        Respondemos en un máximo de 24 horas hábiles.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Chat en línea</h3>
                      <p className="text-gray-600">Chat disponible desde la app</p>
                      <p className="text-sm text-gray-500">
                        En la parte inferior derecha de la aplicación.
                      </p>
                      <Button 
                        variant="ghost" 
                        className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto"
                        onClick={() => setLocation("/vecinos/pos-app")}
                      >
                        Ir a la aplicación <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      {/* Pie de página */}
      <footer className="bg-gray-800 text-white py-6 px-4 mt-12">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <h3 className="text-lg font-bold">Vecinos Xpress</h3>
              <span className="ml-2 text-xs bg-white text-gray-800 px-1 py-0.5 rounded-sm">by NotaryPro</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 NotaryPro. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="link" 
              className="text-white p-0 h-auto"
              onClick={() => setLocation("/vecinos")}
            >
              Inicio
            </Button>
            <Button 
              variant="link" 
              className="text-white p-0 h-auto"
              onClick={() => setLocation("/vecinos/login")}
            >
              Acceder
            </Button>
            <Button 
              variant="link" 
              className="text-white p-0 h-auto"
              onClick={() => setLocation("/aviso-legal")}
            >
              Términos legales
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}