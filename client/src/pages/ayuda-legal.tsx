import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Book, BookOpen, HelpCircle, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import LawyerNavbar from "@/components/layout/LawyerNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Datos de ejemplo para recursos legales
const legalResources = [
  {
    id: 1,
    title: "Guía de Certificación Digital",
    description: "Manual completo sobre el proceso de certificación digital conforme a la Ley 19.799",
    category: "guias",
    url: "/recursos/guia-certificacion-digital.pdf"
  },
  {
    id: 2,
    title: "Plantillas de Documentos Legales",
    description: "Colección de plantillas para documentos legales comunes",
    category: "plantillas",
    url: "/recursos/plantillas-legales.zip"
  },
  {
    id: 3,
    title: "Curso: Fundamentos de Firma Electrónica",
    description: "Capacitación básica sobre los aspectos legales y técnicos de la firma electrónica",
    category: "cursos",
    url: "/cursos/fundamentos-firma-electronica"
  },
  {
    id: 4,
    title: "Lineamientos para Documentos Electrónicos",
    description: "Guía oficial sobre los requisitos legales para documentos digitales",
    category: "guias",
    url: "/recursos/lineamientos-documentos-electronicos.pdf"
  },
  {
    id: 5,
    title: "Webinar: Nuevas Regulaciones 2025",
    description: "Grabación del webinar sobre actualizaciones legales para el año 2025",
    category: "webinars",
    url: "/webinars/regulaciones-2025"
  },
];

// Datos de ejemplo para preguntas frecuentes
const faqs = [
  {
    id: 1,
    question: "¿Qué es la certificación digital de documentos?",
    answer: "La certificación digital es un proceso que garantiza la autenticidad e integridad de un documento electrónico mediante la aplicación de firmas digitales, sellos de tiempo y otros mecanismos técnicos reconocidos legalmente en Chile según la Ley 19.799."
  },
  {
    id: 2,
    question: "¿Qué tipos de documentos pueden certificarse digitalmente?",
    answer: "En Chile, prácticamente cualquier documento puede ser certificado digitalmente, incluyendo contratos, poderes, declaraciones juradas, documentos corporativos, entre otros. Sin embargo, algunos trámites específicos aún requieren documentación física según regulaciones particulares."
  },
  {
    id: 3,
    question: "¿Cuál es la validez legal de un documento certificado digitalmente?",
    answer: "Según la Ley 19.799, los documentos certificados digitalmente tienen la misma validez legal que los documentos físicos, siempre que cumplan con los requisitos establecidos en la normativa, incluyendo el uso de firmas electrónicas avanzadas emitidas por entidades acreditadas."
  },
  {
    id: 4,
    question: "¿Cómo puedo verificar la autenticidad de un documento certificado?",
    answer: "Los documentos certificados en nuestra plataforma incluyen un código único de verificación que puede ser validado en nuestro sitio web. Además, la plataforma ofrece mecanismos de verificación mediante la tecnología blockchain para garantizar la inmutabilidad de los documentos."
  },
  {
    id: 5,
    question: "¿Qué ventajas tiene el proceso de certificación remota (RON)?",
    answer: "La certificación remota o RON (Remote Online Notarization) permite realizar el proceso completo de certificación sin necesidad de presencia física, ahorrando tiempo y recursos. Incluye verificación biométrica, grabación de la sesión y cumple con todos los requisitos legales establecidos en la normativa chilena actual."
  },
];

// Componente principal
export default function AyudaLegal() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState(legalResources);
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  // Función para filtrar recursos y FAQs
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term) {
      setFilteredResources(
        legalResources.filter(
          resource => 
            resource.title.toLowerCase().includes(term) || 
            resource.description.toLowerCase().includes(term)
        )
      );
      
      setFilteredFaqs(
        faqs.filter(
          faq => 
            faq.question.toLowerCase().includes(term) || 
            faq.answer.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredResources(legalResources);
      setFilteredFaqs(faqs);
    }
  };

  // Función para obtener recursos por categoría
  const getResourcesByCategory = (category: string) => {
    return filteredResources.filter(resource => resource.category === category);
  };

  return (
    <>
      <LawyerNavbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Ayuda Legal</h1>
              <p className="text-muted-foreground">
                Recursos, guías y soporte para profesionales legales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/lawyer-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Barra de búsqueda */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recursos o preguntas frecuentes..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <Tabs defaultValue="recursos" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="recursos">
              <BookOpen className="mr-2 h-4 w-4" />
              Recursos Legales
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="mr-2 h-4 w-4" />
              Preguntas Frecuentes
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Recursos Legales */}
          <TabsContent value="recursos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center text-blue-700">
                    <Book className="mr-2 h-5 w-5" />
                    Guías y Manuales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {getResourcesByCategory("guias").map(resource => (
                      <li key={resource.id}>
                        <a href={resource.url} className="block hover:bg-gray-50 p-3 rounded-md transition">
                          <h3 className="font-medium text-blue-700">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </a>
                      </li>
                    ))}
                    {getResourcesByCategory("guias").length === 0 && (
                      <li className="text-center py-4 text-gray-500">
                        No se encontraron guías con ese término
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button variant="ghost" size="sm">Ver todo</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center text-green-700">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Cursos y Capacitaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {getResourcesByCategory("cursos").map(resource => (
                      <li key={resource.id}>
                        <a href={resource.url} className="block hover:bg-gray-50 p-3 rounded-md transition">
                          <h3 className="font-medium text-green-700">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </a>
                      </li>
                    ))}
                    {getResourcesByCategory("cursos").length === 0 && (
                      <li className="text-center py-4 text-gray-500">
                        No se encontraron cursos con ese término
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button variant="ghost" size="sm">Ver todo</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center text-purple-700">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Plantillas y Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {getResourcesByCategory("plantillas").map(resource => (
                      <li key={resource.id}>
                        <a href={resource.url} className="block hover:bg-gray-50 p-3 rounded-md transition">
                          <h3 className="font-medium text-purple-700">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </a>
                      </li>
                    ))}
                    {getResourcesByCategory("webinars").map(resource => (
                      <li key={resource.id}>
                        <a href={resource.url} className="block hover:bg-gray-50 p-3 rounded-md transition">
                          <h3 className="font-medium text-purple-700">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </a>
                      </li>
                    ))}
                    {getResourcesByCategory("plantillas").length === 0 && getResourcesByCategory("webinars").length === 0 && (
                      <li className="text-center py-4 text-gray-500">
                        No se encontraron recursos con ese término
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button variant="ghost" size="sm">Ver todo</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña de Preguntas Frecuentes */}
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
                <CardDescription>
                  Respuestas a las dudas más comunes sobre certificación digital y documentos electrónicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron preguntas con ese término
                    </div>
                  )}
                </Accordion>
              </CardContent>
              <CardFooter className="border-t flex justify-between">
                <p className="text-sm text-muted-foreground">
                  ¿No encuentras lo que buscas?
                </p>
                <Button variant="outline" size="sm">
                  Contactar soporte
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sección de contacto */}
        <Card className="mb-8 bg-gray-50">
          <CardHeader>
            <CardTitle>¿Necesitas ayuda personalizada?</CardTitle>
            <CardDescription>
              Nuestro equipo de soporte legal está disponible para resolver tus dudas específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="h-20 flex flex-col p-2 items-center justify-center">
                <HelpCircle className="h-6 w-6 mb-1" />
                <span>Soporte Técnico</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col p-2 items-center justify-center">
                <BookOpen className="h-6 w-6 mb-1" />
                <span>Asesoría Legal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}