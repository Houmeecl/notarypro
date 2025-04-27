import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit, Clock, CheckCircle2, PenTool, Building } from "lucide-react";

export default function ComunicadoPrensaRedaccionDocumentos() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <a className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </a>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="text-sm font-medium text-gray-500 mb-4">
              COMUNICADO DE PRENSA - 24 de Septiembre de 2025
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              NotaryPro Chile lanza servicio de redacción de documentos legales en tiempo real
            </h1>
            
            <div className="prose prose-gray max-w-none">
              <p className="lead text-lg font-medium text-gray-700 mb-6">
                Un innovador servicio de redacción de documentos legales online que permite a los chilenos crear documentos jurídicos de forma rápida, asequible y profesional.
              </p>
              
              <p>
                <strong>Santiago, 24 de septiembre de 2025</strong> - NotaryPro Chile, pionero en soluciones de certificación digital, anunció hoy el lanzamiento oficial de su nuevo servicio "Redacción de Documentos en Vivo", una plataforma que permite a individuos y empresas redactar documentos legales profesionales a través de un proceso guiado en línea, a una fracción del costo de contratar un abogado tradicional.
              </p>
              
              <p>
                En un país donde el acceso a servicios legales sigue siendo costoso y complejo para muchos ciudadanos, este nuevo servicio busca democratizar el acceso a documentos jurídicos de calidad. La plataforma permite a los usuarios crear desde contratos de arriendo, acuerdos de confidencialidad y testamentos, hasta documentos empresariales como estatutos de sociedades, todo en tiempo real mediante una interfaz intuitiva y fácil de usar.
              </p>
              
              <p>
                "Estamos entusiasmados de presentar esta solución que combina tecnología avanzada con experiencia legal para ofrecer a los chilenos una alternativa accesible a los costosos servicios legales tradicionales", declaró Javier Rojas, CEO de NotaryPro Chile. "Nuestro objetivo es proporcionar herramientas que faciliten trámites legales sin comprometer la calidad ni la validez jurídica".
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">Características principales del servicio</h2>
              
              <ul>
                <li>
                  <strong>Asistencia en tiempo real:</strong> Los usuarios pueden ver cómo se redacta su documento en pantalla mientras responden preguntas específicas sobre sus necesidades.
                </li>
                <li>
                  <strong>Revisión legal profesional:</strong> Todos los documentos son revisados por abogados certificados antes de su entrega final.
                </li>
                <li>
                  <strong>Compatibilidad con la legislación chilena:</strong> Los documentos están diseñados en estricto cumplimiento con la normativa chilena vigente.
                </li>
                <li>
                  <strong>Firma electrónica integrada:</strong> Los documentos pueden ser firmados electrónicamente y certificados en la misma plataforma, conforme a la Ley 19.799.
                </li>
                <li>
                  <strong>Precios transparentes:</strong> Sin cargos ocultos, con tarifas hasta un 80% inferiores a los servicios legales tradicionales.
                </li>
              </ul>
              
              <p>
                El servicio ofrece más de 50 tipos de documentos diferentes, organizados en categorías como Bienes Raíces, Negocios, Familia y Documentos Personales. Los precios comienzan desde $12.990 para documentos básicos, con paquetes empresariales disponibles para compañías que requieren volúmenes más altos.
              </p>
              
              <blockquote>
                "Lo que diferencia a nuestra solución es que no se trata simplemente de plantillas genéricas", explica Carolina Martínez, Directora Legal de NotaryPro Chile. "Nuestro sistema utiliza inteligencia artificial y lógica condicional avanzada para personalizar completamente cada documento según las respuestas del usuario, creando un resultado final comparable al que produciría un abogado especializado".
              </blockquote>
              
              <h2 className="text-xl font-bold mt-8 mb-4">Impacto en el mercado chileno</h2>
              
              <p>
                La introducción de este servicio llega en un momento crucial para Chile, donde la digitalización de servicios legales se ha acelerado significativamente desde 2023. Según estudios recientes, un 65% de los chilenos considera que los servicios legales tradicionales son inaccesibles debido a sus altos costos, lo que ha creado una demanda significativa de alternativas digitales asequibles.
              </p>
              
              <p>
                "Esta plataforma no busca reemplazar a los abogados, sino complementar sus servicios y hacer más accesible el derecho para situaciones cotidianas", añade Rojas. "Los casos complejos seguirán requiriendo asesoría legal personalizada, pero para muchos trámites estándar, nuestra solución proporciona una alternativa eficiente y económica".
              </p>
              
              <p>
                El lanzamiento de "Redacción de Documentos en Vivo" sigue a una fase beta de tres meses, durante la cual más de 5.000 usuarios probaron la plataforma con resultados positivos. La compañía prevé que este servicio podría beneficiar a más de 100.000 chilenos durante su primer año de operación.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">Disponibilidad</h2>
              
              <p>
                El servicio ya está disponible en todo el territorio nacional a través del sitio web de NotaryPro Chile. Los usuarios pueden comenzar a crear documentos inmediatamente después de registrarse, y la mayoría de los documentos pueden completarse en menos de 30 minutos.
              </p>
              
              <p>
                Para más información sobre "Redacción de Documentos en Vivo" o para comenzar a utilizar el servicio, visite la página dedicada en el sitio web de NotaryPro Chile.
              </p>
              
              <div className="border-t border-gray-200 mt-8 pt-6">
                <h3 className="font-bold mb-2">Acerca de NotaryPro Chile</h3>
                <p className="text-sm">
                  NotaryPro Chile es una empresa tecnológica fundada en 2023, dedicada a modernizar los servicios de certificación documental en Chile. La compañía ofrece soluciones digitales para notarización de documentos, verificación de identidad y ahora redacción de documentos legales, todo en cumplimiento con la legislación chilena. Con sede en Santiago, NotaryPro Chile tiene como misión hacer más accesibles, eficientes y seguros los trámites legales para todos los chilenos.
                </p>
              </div>
              
              <div className="mt-6 text-sm">
                <h3 className="font-bold mb-2">Contacto para prensa:</h3>
                <p>María Fernández<br />
                Directora de Comunicaciones<br />
                prensa@notarypro.cl<br />
                +56 2 2123 4567</p>
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Descubra el servicio de redacción de documentos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Documentos profesionales</h3>
                <p className="text-sm text-gray-600">
                  Redactados con el mismo nivel de calidad que ofrecería un abogado especializado
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Rápido y eficiente</h3>
                <p className="text-sm text-gray-600">
                  Complete la mayoría de los documentos en menos de 30 minutos
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Legalmente válidos</h3>
                <p className="text-sm text-gray-600">
                  Documentos con plena validez legal bajo la legislación chilena
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold mb-1">Comience a redactar su documento ahora</h3>
                <p className="text-sm text-gray-600">
                  Precios desde $12.990 por documento con asistencia legal incluida
                </p>
              </div>
              <Button className="whitespace-nowrap">
                Probar el servicio
              </Button>
            </div>
          </div>
          
          {/* Featured documents */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Documentos populares
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 flex">
                <div className="mr-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Contrato de Arriendo</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Documento personalizado que protege legalmente a arrendadores y arrendatarios.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">$14.990</span>
                    <Button size="sm" variant="outline">Ver ejemplo</Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 flex">
                <div className="mr-4">
                  <PenTool className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Testamento Simple</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Documento legal para distribuir sus bienes según sus deseos.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">$24.990</span>
                    <Button size="sm" variant="outline">Ver ejemplo</Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 flex">
                <div className="mr-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Constitución de Sociedad</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Documento completo para establecer legalmente su empresa en Chile.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">$49.990</span>
                    <Button size="sm" variant="outline">Ver ejemplo</Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 flex">
                <div className="mr-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Acuerdo de Confidencialidad</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Proteja su información sensible con este documento legal.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">$12.990</span>
                    <Button size="sm" variant="outline">Ver ejemplo</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">
                Ver todos los documentos disponibles
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}