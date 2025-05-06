import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Check, Download, FileText, LucideShield, Scale, Shield, FileCheck, Award } from "lucide-react";
import { Link } from "wouter";

export default function GarantiasLegales() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Garantías Legales según Ley 19.799</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Conoce las garantías legales que respaldan nuestros servicios de firma electrónica conforme a la Ley 19.799 
          sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border-indigo-100 h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" /> 
              Firma Electrónica Simple
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Validez legal básica para documentos no regulados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Garantías Legales</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cumple con el Artículo 5° de la Ley 19.799 para documentos que no requieren firma manuscrita</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Autenticidad verificable mediante mecanismos tecnológicos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Identificación del firmante mediante acreditación de identidad básica</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Ámbito de Aplicación</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Documentos privados sin exigencia legal de firma manuscrita</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Acuerdos entre particulares no sujetos a formalidades especiales</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comunicaciones internas y documentos administrativos</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-500 italic">
                  La firma electrónica simple permite la identificación del firmante y ha sido creada por medios 
                  que este mantiene bajo su exclusivo control, de manera que está vinculada al documento respectivo.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Link href="/document-sign">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <FileText className="mr-2 h-4 w-4" />
                Firmar documento
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Ver reglamento
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-indigo-100 h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white">
            <CardTitle className="flex items-center">
              <LucideShield className="mr-2 h-5 w-5" /> 
              Firma Electrónica Avanzada
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Máxima validez legal equivalente a firma manuscrita
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Garantías Legales</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Validez legal completa según Artículo 3° de la Ley 19.799, equivalente a firma manuscrita</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Certificada por un Prestador de Servicios de Certificación acreditado</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Creada usando medios que el firmante mantiene bajo su exclusivo control</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Permite detección de cualquier modificación posterior al documento</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Ámbito de Aplicación</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Actos y contratos otorgados o celebrados por personas naturales o jurídicas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Documentos que legalmente requieran firma manuscrita</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trámites con organismos del Estado que acepten este tipo de firma</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-500 italic">
                  La firma electrónica avanzada es certificada por un prestador acreditado, ha sido creada usando medios que el firmante mantiene
                  bajo su exclusivo control y permite la identificación del firmante y la detección de cualquier modificación posterior del documento.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Link href="/etoken-diagnostico">
              <Button className="bg-indigo-800 hover:bg-indigo-900 text-white">
                <FileCheck className="mr-2 h-4 w-4" />
                Firmar con eToken
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Ver certificación
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mb-8 border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="mr-2 h-5 w-5 text-indigo-600" /> 
            Marco Legal Completo
          </CardTitle>
          <CardDescription>
            Fundamentos legales y normativa aplicable a los servicios de firma electrónica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">
                Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4 text-gray-700">
                  <p>
                    La Ley 19.799 establece el marco jurídico aplicable a los documentos electrónicos y sus efectos legales, 
                    la utilización en ellos de firma electrónica y la prestación de servicios de certificación.
                  </p>
                  <ul className="list-disc list-inside space-y-1 pt-2">
                    <li>Reconoce el valor jurídico de los documentos electrónicos y las firmas electrónicas</li>
                    <li>Establece las condiciones para que la firma electrónica avanzada tenga la misma validez que la manuscrita</li>
                    <li>Regula los servicios de certificación de firma electrónica</li>
                    <li>Define las responsabilidades y obligaciones de los prestadores de servicios de certificación</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-medium">
                Decreto Supremo N° 181 - Reglamento de la Ley 19.799
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4 text-gray-700">
                  <p>
                    El Decreto Supremo N° 181 reglamenta la Ley 19.799 estableciendo:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pt-2">
                    <li>Requisitos técnicos y procedimientos para la acreditación de prestadores de servicios de certificación</li>
                    <li>Especificaciones para la emisión de certificados de firma electrónica</li>
                    <li>Normas técnicas sobre seguridad y confidencialidad</li>
                    <li>Registro de prestadores acreditados de servicios de certificación</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-medium">
                Exclusiones y Limitaciones Legales
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4 text-gray-700">
                  <p>
                    Según el Artículo 4° de la Ley 19.799, los siguientes actos jurídicos NO pueden celebrarse por documento electrónico:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pt-2">
                    <li>Actos o contratos que requieran la concurrencia personal de alguna de las partes</li>
                    <li>Actos relativos al derecho de familia</li>
                    <li>Actos que deban ser realizados bajo la forma de escritura pública o requieran intervención de tribunales</li>
                    <li>Actos o contratos relacionados con garantías reales o personales</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base font-medium">
                Garantías para Empresas (Personas Jurídicas)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4 text-gray-700">
                  <p>
                    Para el caso de personas jurídicas, nuestra plataforma cumple con:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pt-2">
                    <li>Verificación de poderes de representantes legales</li>
                    <li>Validación cruzada con registro de empresas</li>
                    <li>Gestión de múltiples firmantes con distintos niveles de autorización</li>
                    <li>Trazabilidad completa de documentos firmados</li>
                    <li>Integración con sistemas de gestión documental corporativos</li>
                    <li>Certificados de firma electrónica avanzada específicos para personas jurídicas</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8 border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-indigo-600" /> 
            Certificación y Estándares
          </CardTitle>
          <CardDescription>
            Cumplimiento de estándares técnicos y certificaciones que garantizan la seguridad del servicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-indigo-600" /> 
                Estándares Técnicos
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Criptografía de clave pública (PKI) según estándares internacionales (X.509)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Algoritmos de cifrado conformes a la guía técnica de la Entidad Acreditadora</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Interfaces PKCS#11 para interoperabilidad con dispositivos criptográficos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Formato PDF/A para conservación a largo plazo de documentos electrónicos</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-indigo-600" /> 
                Seguridad y Validación
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sellos de tiempo cualificados integrados en cada firma</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Validación en tiempo real del estatus de certificados</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sistemas de detección de alteraciones documentales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cifrado de extremo a extremo en todas las comunicaciones</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium mb-2">Certificaciones Oficiales</h3>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white p-3 rounded border flex items-center">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">Prestador Acreditado</p>
                  <p className="text-xs text-gray-500">Entidad Acreditadora de Chile</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded border flex items-center">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">ISO 27001</p>
                  <p className="text-xs text-gray-500">Gestión de Seguridad de la Información</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded border flex items-center">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">Conformidad ETSI</p>
                  <p className="text-xs text-gray-500">Estándares Europeos de Firma Electrónica</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">¿Necesitas más información?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <FileText className="mr-2 h-4 w-4" />
            Descargar marco legal completo
          </Button>
          <Button variant="outline">
            <Scale className="mr-2 h-4 w-4" />
            Consultar a un asesor legal
          </Button>
        </div>
      </div>
    </div>
  );
}