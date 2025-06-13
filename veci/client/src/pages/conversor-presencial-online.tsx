import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit, Replace, MessageSquareDiff } from "lucide-react";
import PresentialToOnlineConverter from "@/components/document/PresentialToOnlineConverter";

export default function ConversorPresencialOnline() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Conversor de Documentos Presenciales a Online
              </h1>
              <p className="text-gray-600 mb-4">
                Esta herramienta convierte automáticamente la terminología de documentos diseñados para procesos presenciales
                a formatos adaptados para certificación online por videollamada, conforme a la Ley 19.799.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="bg-gray-100">Compatible con Ley 19.799</Badge>
                <Badge variant="outline" className="bg-gray-100">Certificación por video</Badge>
                <Badge variant="outline" className="bg-gray-100">Firma electrónica avanzada</Badge>
              </div>
            </div>

            <PresentialToOnlineConverter />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Replace className="h-5 w-5 text-primary mr-2" />
                  Conversión inteligente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                La herramienta identifica y reemplaza automáticamente términos como "presencial", "físicamente", 
                "en persona" y "notario público" por sus equivalentes online, adaptando el documento a un formato
                compatible con certificación digital.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Compatible con todos los documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Funciona con todo tipo de documentos legales: contratos, declaraciones juradas, poderes simples,
                acuerdos comerciales y más. Mantiene intacta la estructura legal del documento mientras actualiza
                solo la terminología.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <MessageSquareDiff className="h-5 w-5 text-primary mr-2" />
                  Informe detallado de cambios
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Reciba un resumen detallado de todos los cambios realizados, incluyendo una lista de términos
                originales, sus reemplazos y el número de ocurrencias, permitiéndole verificar cada modificación.
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
            <h2 className="text-2xl font-bold mb-4">¿Cómo funciona?</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ingrese el texto original</h3>
                  <p className="text-gray-600">
                    Pegue el texto del documento que desea convertir en el área de texto. Puede ser un contrato, 
                    acuerdo, poder o cualquier documento legal que contenga terminología presencial.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Inicie la conversión</h3>
                  <p className="text-gray-600">
                    Haga clic en el botón "Convertir" para iniciar el proceso de conversión. 
                    La herramienta detectará automáticamente todos los términos presenciales y los reemplazará 
                    por sus equivalentes para entornos online.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Revise los cambios</h3>
                  <p className="text-gray-600">
                    Examine el informe detallado que muestra todos los cambios realizados. Verifique el texto convertido 
                    y si está satisfecho, copie el resultado para usarlo en su trámite de certificación online.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">¿Listo para certificar sus documentos online?</h2>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              Una vez que haya convertido su documento, puede colaborar con uno de nuestros abogados para finalizarlo 
              y luego programar una sesión de certificación por videollamada.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 max-w-lg mx-auto bg-white p-4 rounded-md border border-gray-100">
                <h3 className="font-semibold text-lg">Proceso de certificación online:</h3>
                <ol className="text-left text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">1</span>
                    </span>
                    <span>Redacte su documento con ayuda de nuestros abogados especializados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">2</span>
                    </span>
                    <span>Realice el pago correspondiente según el tipo de documento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">3</span>
                    </span>
                    <span>Agende una videollamada con un certificador autorizado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">4</span>
                    </span>
                    <span>Reciba un enlace único para su sesión de certificación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">5</span>
                    </span>
                    <span>Conéctese a la sesión donde se activarán ambas cámaras para la verificación de identidad</span>
                  </li>
                </ol>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Button asChild>
                  <Link href="/certificacion-por-video">
                    Programar videollamada
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/notarize-online">
                    Ver planes y precios
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes UI adicionales para esta página
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";