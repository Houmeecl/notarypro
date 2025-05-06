import { 
  Check, 
  Shield, 
  FileCheck, 
  BookOpen, 
  UserCheck, 
  Scale, 
  Lock, 
  AlertTriangle, 
  ExternalLink, 
  Download 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function GarantiasLegales() {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Garantías Legales</h1>
        <p className="text-gray-600 max-w-3xl">
          Nuestra plataforma cumple con todas las exigencias establecidas en la Ley 19.799 de Chile sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación. 
          A continuación se detallan las garantías legales que ofrecemos en cumplimiento con la normativa.
        </p>
      </div>

      <Tabs defaultValue="resumen" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mb-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="ley">Ley 19.799</TabsTrigger>
          <TabsTrigger value="validez">Validez Legal</TabsTrigger>
          <TabsTrigger value="certificacion">Certificación</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                  Firma Electrónica Simple
                </CardTitle>
                <CardDescription>
                  Cumple con Art. 5° Ley 19.799
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Validez legal para documentos privados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Verificación de identidad biométrica</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Sellado de tiempo incluido</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Validación oficial con cédula chilena</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Lock className="h-5 w-5 text-indigo-600 mr-2" />
                  Firma Electrónica Avanzada
                </CardTitle>
                <CardDescription>
                  Cumple con Art. 3° Ley 19.799
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Validez legal completa equivalente a firma manuscrita</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Certificado digital validado por entidad acreditada</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Compatible con dispositivos eToken de eCert Chile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Verificable mediante QR y código único</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <UserCheck className="h-5 w-5 text-indigo-600 mr-2" />
                  Verificación de Identidad
                </CardTitle>
                <CardDescription>
                  Cumple con Art. 12 y 12 bis Ley 19.799
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Validación biométrica mediante verificación de rostro</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Lectura NFC de cédula nacional chilena (REAL Mode)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Verificación sin intervención humana (automatizada)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Trazabilidad completa de la verificación</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-8 bg-indigo-50 border-indigo-200">
            <Shield className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="text-indigo-800">Modo REAL activado permanentemente</AlertTitle>
            <AlertDescription className="text-indigo-700">
              Nuestra plataforma opera exclusivamente en modo REAL para todas las verificaciones de identidad y firmas electrónicas, garantizando la máxima seguridad y validez legal para todos los documentos procesados.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="ley">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación</h2>
              
              <p className="text-gray-700 mb-4">
                La plataforma NotaryPro cumple con todas las disposiciones establecidas en la Ley 19.799, 
                que regula los documentos electrónicos y su valor probatorio, las firmas electrónicas 
                y los certificados de firma electrónica en Chile.
              </p>

              <Alert className="mb-4">
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Enlaces oficiales</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col space-y-2 mt-2">
                    <a 
                      href="https://www.bcn.cl/leychile/navegar?idNorma=196640" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" /> 
                      Texto completo Ley 19.799 - Biblioteca Congreso Nacional
                    </a>
                    <a 
                      href="https://www.bcn.cl/leychile/navegar?idNorma=1066723" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" /> 
                      Reglamento Ley 19.799 - Decreto 181
                    </a>
                  </div>
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="articulo3">
                  <AccordionTrigger className="text-left">Artículo 3°: Firma Electrónica Avanzada</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 mb-2">
                      "La firma electrónica avanzada tendrá el mismo valor que la firma manuscrita, siempre que esté certificada por un prestador acreditado."
                    </p>
                    <p className="text-sm text-gray-600">
                      NotaryPro soporta completamente firmas electrónicas avanzadas mediante dispositivos eToken conectados físicamente, con certificados emitidos por entidades acreditadas en Chile.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="articulo5">
                  <AccordionTrigger className="text-left">Artículo 5°: Firma Electrónica Simple</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 mb-2">
                      "Los documentos electrónicos que tengan la calidad de instrumento privado, en que conste la firma electrónica simple, tendrán el valor probatorio que corresponda."
                    </p>
                    <p className="text-sm text-gray-600">
                      NotaryPro incorpora firma electrónica simple con validación biométrica previa, otorgando valor legal a los documentos firmados.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="articulo12">
                  <AccordionTrigger className="text-left">Artículo 12: Servicios de Certificación</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-700 mb-2">
                      "Los certificadores que otorguen certificados de firma electrónica deben cumplir con las obligaciones establecidas en esta ley y su reglamento."
                    </p>
                    <p className="text-sm text-gray-600">
                      NotaryPro trabaja con prestadores acreditados para la emisión y validación de certificados digitales, cumpliendo con todos los requisitos legales.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div>
              <Card className="bg-gray-50 border-0 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle>Modificaciones recientes a la Ley</CardTitle>
                  <CardDescription>
                    Actualizaciones y nuevas disposiciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>23-11-2022</TableCell>
                        <TableCell>Ley 21.394</TableCell>
                        <TableCell>Establece mejoras para la tramitación y adaptación a la contingencia sanitaria</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>18-05-2022</TableCell>
                        <TableCell>Ley 21.442</TableCell>
                        <TableCell>Homologación legal firma electrónica para notarios y actuaciones notariales</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>12-02-2022</TableCell>
                        <TableCell>Ley 21.419</TableCell>
                        <TableCell>Modificación regulación servicios notariales y registrales</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50 border-indigo-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-900">Conformidad legal integral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FileCheck className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-indigo-900">Documentos con valor probatorio</p>
                        <p className="text-sm text-indigo-700">Todos los documentos firmados cumplen con los requerimientos para ser presentados en juicio.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-indigo-900">Verificación de identidad completa</p>
                        <p className="text-sm text-indigo-700">Validación biométrica y con identificación oficial de chile NFC.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Scale className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-indigo-900">Admisibilidad procesal</p>
                        <p className="text-sm text-indigo-700">Los documentos firmados son admisibles como prueba en procedimientos judiciales.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="validez">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Validez legal de los documentos firmados</h2>
              <p className="text-gray-700 mb-6">
                Los documentos firmados en nuestra plataforma cumplen con todas las exigencias legales para tener validez jurídica completa de acuerdo con la normativa chilena.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileCheck className="h-5 w-5 mr-2 text-indigo-600" />
                    Firma Electrónica Simple
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Según el Artículo 5° de la Ley 19.799, los documentos con firma electrónica simple tienen validez legal como instrumentos privados y valor probatorio.
                  </p>
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    Validez legal para documentos privados
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-indigo-600" />
                    Firma Electrónica Avanzada
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Según el Artículo 3° de la Ley 19.799, la firma electrónica avanzada tiene el mismo valor que la firma manuscrita cuando está certificada por un prestador acreditado.
                  </p>
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    Validez legal equivalente a firma manuscrita
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mecanismos de Verificación</CardTitle>
                  <CardDescription>
                    Métodos para comprobar la autenticidad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Código QR integrado</h4>
                      <p className="text-sm text-gray-600">
                        Cada documento incluye un código QR único que permite verificar su autenticidad escaneándolo con cualquier dispositivo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Código de verificación</h4>
                      <p className="text-sm text-gray-600">
                        Código alfanumérico único que puede introducirse en el portal de verificación para comprobar la validez del documento.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Sellado de tiempo</h4>
                      <p className="text-sm text-gray-600">
                        Certificación temporal que garantiza el momento exacto en que se realizó la firma, evitando manipulaciones posteriores.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aseguramiento adicional</CardTitle>
                  <CardDescription>
                    Garantías complementarias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-indigo-600" />
                      Verificación biométrica
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Validación facial comparada con documento de identidad para asegurar la identidad del firmante.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-indigo-600" />
                      Protección contra alteraciones
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Hash criptográfico que impide la modificación del contenido una vez firmado.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-indigo-600" />
                      Registro de acciones
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Log completo de todas las acciones realizadas sobre el documento para trazabilidad.
                    </p>
                  </div>

                  <Button variant="outline" className="w-full mt-2 flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar informe de verificación
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certificacion">
          <div className="space-y-6">
            <Alert className="bg-indigo-50 border-indigo-200">
              <Shield className="h-4 w-4 text-indigo-600" />
              <AlertTitle className="text-indigo-800">Certificación oficial</AlertTitle>
              <AlertDescription className="text-indigo-700">
                Todos nuestros procesos de certificación están validados por entidades acreditadas conforme a la legislación chilena.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificación de Firmas</CardTitle>
                  <CardDescription>
                    Validación de autenticidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Certificados digitales validados</h4>
                        <p className="text-sm text-gray-600">
                          Trabajamos con prestadores acreditados para garantizar la validez legal de los certificados digitales.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Compatible con eToken</h4>
                        <p className="text-sm text-gray-600">
                          Soporte para dispositivos físicos eToken de eCert Chile para firma electrónica avanzada.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Verificación centralizada</h4>
                        <p className="text-sm text-gray-600">
                          Sistema unificado para verificar la validez de cualquier documento firmado en la plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Remote Online Notarization (RON)</CardTitle>
                  <CardDescription>
                    Certificación notarial remota
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Videollamada con certificador</h4>
                        <p className="text-sm text-gray-600">
                          Sesiones de video grabadas y certificadas para validación de identidad y consentimiento.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Cumplimiento legal</h4>
                        <p className="text-sm text-gray-600">
                          El proceso cumple con las disposiciones de la Ley 21.394 que habilita las actuaciones notariales remotas.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Trazabilidad completa</h4>
                        <p className="text-sm text-gray-600">
                          Registro de la sesión, comprobación de identidad y proceso de firma certificado.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Entidades certificadoras acreditadas</h2>
              <p className="text-gray-700 mb-6">
                Trabajamos con las siguientes entidades certificadoras acreditadas conforme a la ley chilena:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-center">eCert Chile</h3>
                  <p className="text-sm text-gray-600 text-center mt-1">Proveedor oficial de certificados digitales</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-center">E-Sign</h3>
                  <p className="text-sm text-gray-600 text-center mt-1">Certificación de firmas electrónicas avanzadas</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-center">TOC Chile</h3>
                  <p className="text-sm text-gray-600 text-center mt-1">Verificación y validación de identidad oficial</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mt-8">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Compromiso con la validez legal</h2>
        <p className="text-indigo-800 mb-4">
          En NotaryPro nos comprometemos a mantener los más altos estándares de seguridad y cumplimiento legal para todas nuestras soluciones de firma electrónica.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Actualizaciones regulares
            </h3>
            <p className="text-sm text-gray-600">
              Nuestro sistema se actualiza constantemente para adaptarse a los cambios en la legislación y normativa.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-indigo-600" />
              Copias de seguridad certificadas
            </h3>
            <p className="text-sm text-gray-600">
              Mantenemos respaldos seguros de todos los documentos firmados para garantizar su disponibilidad a largo plazo.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Esta información se proporciona con fines informativos y no constituye asesoramiento legal. Para consultas específicas, recomendamos consultar con un abogado especializado.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          © {new Date().getFullYear()} NotaryPro - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}