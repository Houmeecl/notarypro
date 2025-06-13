import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check, AlertCircle, FileText, FileCode, RotateCw } from "lucide-react";
// Importación temporal (utilizando datos en el cliente)
// NOTA: Estas funciones son una copia de las que están en shared/utils/text-converter.ts
// pero se implementan directamente aquí para evitar problemas de importación en el cliente

// Mapeo de términos presenciales a sus equivalentes online
const PRESENTIAL_TO_ONLINE_TERMS: Record<string, string> = {
  // Términos generales
  'presencial': 'online',
  'presencialmente': 'online',
  'en persona': 'por videoconferencia',
  'físicamente': 'virtualmente',
  'comparecer físicamente': 'comparecer virtualmente',
  'comparecencia física': 'comparecencia virtual',
  'reunión presencial': 'videoconferencia',
  'presente físicamente': 'presente virtualmente',
  'asistir personalmente': 'asistir por videollamada',
  'acudir a la oficina': 'conectarse a la sesión virtual',
  'en las oficinas': 'a través de la plataforma digital',
  'presencia física': 'presencia virtual',
  'de forma presencial': 'de forma online',
  
  // Términos notariales específicos
  'ante notario': 'ante certificador en línea',
  'notario público': 'certificador digital',
  'oficina notarial': 'plataforma de certificación digital',
  'despacho notarial': 'servicio de certificación en línea',
  'sede notarial': 'sesión de certificación online',
  'notaría': 'certificación en línea',
  'acto notarial presencial': 'acto notarial online',
  'escritura pública presencial': 'escritura pública electrónica',
  'firma manuscrita': 'firma electrónica avanzada',
  'acta notarial física': 'acta notarial digital',
  'testimonio físico': 'testimonio digital',
  'diligencia presencial': 'diligencia online',
  'documento físico': 'documento electrónico',
  'original físico': 'original digital',
  'copia física': 'copia digital',
  'papel': 'formato digital',
  'firmar en papel': 'firmar electrónicamente',
  'sello notarial físico': 'sello electrónico certificado',
  'estampar sello': 'aplicar sello electrónico',
  'rúbrica manuscrita': 'firma digital certificada',
};

const convertPresentialToOnline = (text: string): string => {
  let convertedText = text;
  
  // Reemplazar todos los términos presenciales por sus equivalentes online
  for (const [presential, online] of Object.entries(PRESENTIAL_TO_ONLINE_TERMS)) {
    // Usa una expresión regular para hacer coincidir el término completo y con distinción entre mayúsculas/minúsculas
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    convertedText = convertedText.replace(regex, (match) => {
      // Preservar el caso (mayúscula/minúscula)
      if (match === match.toLowerCase()) {
        return online;
      } else if (match === match.toUpperCase()) {
        return online.toUpperCase();
      } else if (match[0] === match[0].toUpperCase()) {
        return online.charAt(0).toUpperCase() + online.slice(1);
      }
      return online;
    });
  }
  
  return convertedText;
};

const identifyPresentialTerms = (text: string): string[] => {
  const foundTerms: string[] = [];
  
  for (const presential of Object.keys(PRESENTIAL_TO_ONLINE_TERMS)) {
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    if (regex.test(text)) {
      foundTerms.push(presential);
    }
  }
  
  return foundTerms;
};

const documentRequiresConversion = (text: string): boolean => {
  return identifyPresentialTerms(text).length > 0;
};

const generateConversionReport = (text: string): { 
  totalTermsFound: number, 
  uniqueTermsFound: number,
  termDetails: Array<{ original: string, replacement: string, count: number }>
} => {
  const termCounts: Record<string, number> = {};
  
  // Contar ocurrencias de cada término
  for (const presential of Object.keys(PRESENTIAL_TO_ONLINE_TERMS)) {
    const regex = new RegExp(`\\b${presential}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      termCounts[presential] = matches.length;
    }
  }
  
  // Generar detalles de términos
  const termDetails = Object.entries(termCounts).map(([term, count]) => ({
    original: term,
    replacement: PRESENTIAL_TO_ONLINE_TERMS[term],
    count
  }));
  
  // Calcular estadísticas
  const totalTermsFound = termDetails.reduce((sum, item) => sum + item.count, 0);
  const uniqueTermsFound = termDetails.length;
  
  return {
    totalTermsFound,
    uniqueTermsFound,
    termDetails
  };
};

export default function PresentialToOnlineConverter() {
  const [originalText, setOriginalText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("original");
  const [converted, setConverted] = useState(false);

  const handleConvert = () => {
    if (!originalText.trim()) return;
    
    const converted = convertPresentialToOnline(originalText);
    const conversionReport = generateConversionReport(originalText);
    
    setConvertedText(converted);
    setReport(conversionReport);
    setConverted(true);
    setActiveTab("converted");
  };

  const requiresConversion = originalText ? documentRequiresConversion(originalText) : false;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCw className="h-5 w-5 text-primary mr-2" />
            Conversor de Terminología: Presencial a Online
          </CardTitle>
          <CardDescription>
            Convierte automáticamente la terminología presencial en documentos a sus equivalentes online,
            para adaptarlos a procesos de certificación por videollamada.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="original">Texto Original</TabsTrigger>
              <TabsTrigger value="converted" disabled={!converted}>
                Texto Convertido
                {report && report.totalTermsFound > 0 && (
                  <Badge variant="outline" className="ml-2">{report.totalTermsFound}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="w-full">
              <div className="space-y-2">
                <Textarea
                  placeholder="Pegue aquí el texto del documento que desea convertir..."
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="min-h-[300px] w-full"
                />
                
                {originalText && !requiresConversion && (
                  <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">No se requieren cambios</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      No se encontraron términos presenciales que requieran conversión.
                    </AlertDescription>
                  </Alert>
                )}
                
                {originalText && requiresConversion && (
                  <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Se requiere conversión</AlertTitle>
                    <AlertDescription className="text-amber-600">
                      Se encontraron términos presenciales que pueden ser convertidos a formato online.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="converted" className="w-full">
              {converted ? (
                <div className="space-y-4">
                  <Textarea
                    value={convertedText}
                    readOnly
                    className="min-h-[300px] w-full"
                  />
                  
                  {report && report.totalTermsFound > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Resumen de Conversión
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Se reemplazaron {report.totalTermsFound} términos presenciales ({report.uniqueTermsFound} términos únicos).
                      </p>
                      
                      {report.termDetails.length > 0 && (
                        <div className="max-h-40 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left py-1 px-2">Término Original</th>
                                <th className="text-left py-1 px-2">Reemplazado por</th>
                                <th className="text-center py-1 px-2">Ocurrencias</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.termDetails.map((item: any, index: number) => (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="py-1 px-2">{item.original}</td>
                                  <td className="py-1 px-2">{item.replacement}</td>
                                  <td className="py-1 px-2 text-center">{item.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert variant="default" className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">No se realizaron cambios</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        No se encontraron términos presenciales que requieran conversión.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-md border-2 border-dashed border-gray-200 p-6">
                  <FileText className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-center">
                    Haga clic en "Convertir" para procesar el texto original.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setOriginalText("");
            setConvertedText("");
            setReport(null);
            setConverted(false);
            setActiveTab("original");
          }}>
            Limpiar
          </Button>
          
          <div className="flex gap-2">
            {converted && (
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(convertedText);
              }}>
                <FileCode className="h-4 w-4 mr-2" />
                Copiar Resultado
              </Button>
            )}
            
            <Button 
              onClick={handleConvert} 
              disabled={!originalText.trim() || !requiresConversion}
            >
              Convertir
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}