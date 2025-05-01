import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Search, ChevronDown, FileText, 
  Smartphone, CreditCard, Users, HelpCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Tipo de datos para categorías
interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Tipo de datos para preguntas frecuentes
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Categorías
const categories: Category[] = [
  {
    id: "general",
    name: "General",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "app",
    name: "Uso de la app",
    icon: <Smartphone className="h-5 w-5" />
  },
  {
    id: "documents",
    name: "Documentos",
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: "payments",
    name: "Pagos y comisiones",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: "partners",
    name: "Programa de socios",
    icon: <Users className="h-5 w-5" />
  }
];

// Preguntas frecuentes
const faqItems: FAQItem[] = [
  // General
  {
    id: "faq1",
    question: "¿Qué es Vecinos Xpress?",
    answer: "Vecinos Xpress es una plataforma que permite a negocios locales (como almacenes, botillerías, farmacias, etc.) ofrecer servicios de certificación de documentos, ganando comisiones por cada documento procesado. La plataforma conecta a los vecinos que necesitan certificar documentos con negocios cercanos, ahorrándoles viajes al centro de la ciudad.",
    category: "general"
  },
  {
    id: "faq2",
    question: "¿Quién puede ser socio de Vecinos Xpress?",
    answer: "Cualquier negocio local puede convertirse en socio de Vecinos Xpress, especialmente aquellos con atención al público como almacenes, botillerías, farmacias, cibercafés, centros de fotocopiado, entre otros. Solo necesitas un dispositivo con conexión a internet (computador, tablet o smartphone) para comenzar.",
    category: "general"
  },
  {
    id: "faq3",
    question: "¿Cómo me registro como socio?",
    answer: "Puedes registrarte como socio completando el formulario en nuestra página web, en la sección 'Únete como socio'. Necesitarás proporcionar información sobre tu negocio y datos de contacto. Luego de revisar tu solicitud, nos pondremos en contacto contigo para finalizar el proceso.",
    category: "general"
  },
  
  // Uso de la app
  {
    id: "faq4",
    question: "¿Cómo instalo la aplicación?",
    answer: "Puedes descargar la aplicación móvil desde nuestra página web o usar la versión web desde cualquier navegador. La aplicación móvil está disponible tanto para dispositivos Android como para tablets. También ofrecemos una versión web que funciona en cualquier computador.",
    category: "app"
  },
  {
    id: "faq5",
    question: "¿Qué hago si olvidé mi contraseña?",
    answer: "Si olvidaste tu contraseña, puedes restablecerla haciendo clic en 'Olvidé mi contraseña' en la pantalla de inicio de sesión. Te enviaremos un enlace a tu correo electrónico registrado para crear una nueva contraseña. Si continúas con problemas, contacta a nuestro equipo de soporte.",
    category: "app"
  },
  {
    id: "faq6",
    question: "¿La aplicación funciona sin internet?",
    answer: "No, la aplicación requiere conexión a internet para funcionar correctamente, ya que necesita comunicarse con nuestros servidores para verificar la información de los documentos y procesar las transacciones. Asegúrate de tener una conexión estable antes de iniciar el proceso de certificación.",
    category: "app"
  },
  
  // Documentos
  {
    id: "faq7",
    question: "¿Qué tipos de documentos puedo procesar?",
    answer: "Puedes procesar varios tipos de documentos como: contratos de arriendo, contratos de trabajo, autorizaciones de viaje, finiquitos, certificados de residencia, declaraciones juradas, poderes simples, entre otros. La lista completa de documentos está disponible en la aplicación.",
    category: "documents"
  },
  {
    id: "faq8",
    question: "¿Cómo se certifican los documentos?",
    answer: "El proceso es simple: (1) El cliente llega a tu negocio y solicita certificar un documento; (2) Seleccionas el tipo de documento en la aplicación; (3) Ingresas los datos del cliente; (4) El sistema genera un código único de verificación; (5) El cliente paga el servicio; (6) Se emite un comprobante con el código de verificación que el cliente puede usar para verificar la autenticidad del documento.",
    category: "documents"
  },
  {
    id: "faq9",
    question: "¿Los documentos tienen validez legal?",
    answer: "Sí, todos los documentos procesados a través de Vecinos Xpress tienen validez legal de acuerdo con la Ley 19.799 sobre documentos electrónicos y firma electrónica. Cada documento cuenta con un código de verificación único que permite comprobar su autenticidad en nuestro sitio web.",
    category: "documents"
  },
  
  // Pagos y comisiones
  {
    id: "faq10",
    question: "¿Cómo funcionan las comisiones?",
    answer: "Como socio, recibes una comisión del 20% por cada documento procesado. Por ejemplo, si un documento cuesta $5.000, tu comisión será de $1.000. Las comisiones se acreditan automáticamente en tu cuenta después de cada transacción exitosa.",
    category: "payments"
  },
  {
    id: "faq11",
    question: "¿Cuándo y cómo puedo retirar mis comisiones?",
    answer: "Puedes solicitar el retiro de tus comisiones cuando tu saldo alcance un mínimo de $5.000. Las solicitudes de retiro se procesan dentro de 1-3 días hábiles y el dinero se transfiere directamente a la cuenta bancaria que hayas registrado en tu perfil.",
    category: "payments"
  },
  {
    id: "faq12",
    question: "¿Hay un límite de retiros mensuales?",
    answer: "No hay límite en la cantidad de retiros que puedes solicitar por mes, siempre que cada solicitud cumpla con el monto mínimo de $5.000. Sin embargo, te recomendamos acumular un monto mayor para optimizar las transferencias.",
    category: "payments"
  },
  
  // Programa de socios
  {
    id: "faq13",
    question: "¿Qué beneficios obtengo como socio?",
    answer: "Como socio de Vecinos Xpress obtienes varios beneficios: (1) Comisiones por cada documento procesado; (2) Un nuevo servicio para ofrecer a tus clientes; (3) Mayor tráfico en tu negocio; (4) Material promocional gratuito para tu local; (5) Soporte prioritario y capacitación continua.",
    category: "partners"
  },
  {
    id: "faq14",
    question: "¿Puedo tener más de un local registrado?",
    answer: "Sí, puedes registrar múltiples locales bajo tu cuenta principal. Cada local tendrá sus propias credenciales de acceso y podrás gestionar todas las sucursales desde tu panel de administración centralizado.",
    category: "partners"
  },
  {
    id: "faq15",
    question: "¿Qué hago si tengo problemas técnicos?",
    answer: "Si experimentas problemas técnicos, puedes contactar a nuestro equipo de soporte a través del chat en la aplicación, por correo electrónico a socios@vecinosxpress.cl o llamando al +56 2 2123 4567 en horario de atención (lunes a viernes de 9:00 a 18:00 hrs).",
    category: "partners"
  }
];

export default function VecinosFAQ() {
  const [_, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtrar FAQs por categoría y búsqueda
  const filteredFaqs = faqItems.filter(faq => {
    const matchesCategory = activeCategory === faq.category;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Filtrar FAQs solo por búsqueda para mostrar en "Todos los resultados"
  const searchResults = searchQuery === "" ? [] : faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
          <h1 className="text-3xl font-bold mb-2">Preguntas Frecuentes</h1>
          <p className="text-lg">Encuentra respuestas a las preguntas más comunes sobre Vecinos Xpress</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Buscador */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Buscar en las preguntas frecuentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Categorías y preguntas */}
        <Tabs 
          defaultValue="general" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="flex justify-start overflow-x-auto bg-transparent pb-2 mb-6">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              >
                {category.icon}
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Resultados de búsqueda */}
          {searchQuery !== "" && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Resultados de búsqueda ({searchResults.length})
              </h3>
              
              {searchResults.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500">No se encontraron resultados para "{searchQuery}"</p>
                    <Button 
                      variant="ghost" 
                      className="mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Limpiar búsqueda
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {searchResults.map(faq => {
                    // Resaltar palabras de búsqueda en la pregunta
                    const highlightedQuestion = faq.question.replace(
                      new RegExp(`(${searchQuery})`, "gi"),
                      match => `<mark class="bg-yellow-200">${match}</mark>`
                    );
                    
                    return (
                      <AccordionItem key={faq.id} value={faq.id} className="border p-2 rounded-md mb-2">
                        <div className="flex items-center">
                          <div className="mr-2 text-xs rounded-full px-2 py-1 bg-blue-100 text-blue-800">
                            {categories.find(c => c.id === faq.category)?.name}
                          </div>
                          <AccordionTrigger 
                            className="hover:no-underline text-left"
                            dangerouslySetInnerHTML={{ __html: highlightedQuestion }}
                          >
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          )}
          
          {/* Contenido por categoría */}
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  {category.name}
                </h3>
                
                {filteredFaqs.length === 0 ? (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-500">No se encontraron resultados para esta categoría con tu búsqueda actual</p>
                      <Button 
                        variant="ghost" 
                        className="mt-2"
                        onClick={() => setSearchQuery("")}
                      >
                        Limpiar búsqueda
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map(faq => (
                      <AccordionItem key={faq.id} value={faq.id} className="border p-2 rounded-md mb-2">
                        <AccordionTrigger className="hover:no-underline text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </motion.div>
            </TabsContent>
          ))}
          
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">¿No encontraste lo que buscabas?</h3>
            <p className="text-gray-600 mb-6">
              Contáctanos directamente y te responderemos a la brevedad.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/vecinos/soporte")}
            >
              Ir a Soporte <HelpCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Tabs>
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