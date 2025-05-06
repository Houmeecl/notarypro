import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Shield, AlertCircle, KeyRound, FileDigit, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkExtensionAvailability, listTokenDevices, getCertificates, CertificateInfo } from "@/lib/pkcs11-bridge";

export default function EtokenDiagnostico() {
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);
  const [pin, setPin] = useState<string>("");
  const [requiresPin, setRequiresPin] = useState<boolean>(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [showExtensionDownload, setShowExtensionDownload] = useState<boolean>(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setStatus("checking");
    setDiagnosticResults([]);
    setCertificates([]);
    
    try {
      // Paso 1: Verificar extensión
      setMessage("Verificando extensión de firma digital...");
      const extensionAvailable = await checkExtensionAvailability();
      
      if (!extensionAvailable) {
        setStatus("error");
        setMessage("La extensión de firma digital no está disponible");
        setDiagnosticResults([
          "✖ La extensión de firma digital no está instalada o habilitada",
          "➤ Por favor, instale la extensión PKCS#11 para su navegador",
          "➤ Si ya está instalada, verifique que esté habilitada en la configuración de extensiones"
        ]);
        
        // Mostramos enlaces para descarga/actualización
        setShowExtensionDownload(true);
        return;
      }
      
      setDiagnosticResults(prev => [...prev, "✓ Extensión de firma digital detectada correctamente"]);
      
      // Paso 2: Detectar dispositivos
      setMessage("Detectando dispositivos de firma digital...");
      const devices = await listTokenDevices();
      
      if (devices.length === 0) {
        setStatus("error");
        setMessage("No se detectaron dispositivos de firma digital");
        setDiagnosticResults(prev => [
          ...prev,
          "✖ No se detectaron dispositivos de firma digital conectados",
          "➤ Verifique que su dispositivo esté correctamente conectado",
          "➤ Si está usando una tarjeta inteligente, asegúrese de que el lector esté bien conectado"
        ]);
        return;
      }
      
      setDiagnosticResults(prev => [
        ...prev, 
        `✓ Se detectaron ${devices.length} dispositivo(s) de firma digital`,
        ...devices.map(device => `  • ${device}`)
      ]);
      
      // Solicitar PIN para acceder a certificados
      setRequiresPin(true);
      setMessage("Ingrese el PIN para continuar con el diagnóstico");
      setStatus("idle");
      
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error durante el diagnóstico: ${error.message}`);
      setDiagnosticResults(prev => [...prev, `✖ Error: ${error.message}`]);
    }
  };
  
  const checkCertificates = async () => {
    if (!pin) {
      toast({
        title: "Error",
        description: "Debe ingresar un PIN para continuar",
        variant: "destructive"
      });
      return;
    }
    
    setStatus("checking");
    setMessage("Verificando certificados digitales...");
    
    try {
      const certs = await getCertificates(pin);
      setCertificates(certs);
      
      if (certs.length === 0) {
        setStatus("error");
        setMessage("No se encontraron certificados válidos");
        setDiagnosticResults(prev => [...prev, 
          "✖ No se encontraron certificados digitales válidos en el dispositivo",
          "➤ Verifique que su dispositivo contenga certificados instalados",
          "➤ El PIN proporcionado podría ser incorrecto"
        ]);
        return;
      }
      
      setDiagnosticResults(prev => [
        ...prev, 
        `✓ Se encontraron ${certs.length} certificado(s) digital(es):`,
        ...certs.map(cert => `  • ${cert.subject} (Válido hasta: ${formatDate(cert.validTo)})`)
      ]);
      
      setStatus("success");
      setMessage("Diagnóstico completado con éxito");
      
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error al verificar certificados: ${error.message}`);
      setDiagnosticResults(prev => [...prev, `✖ Error: ${error.message}`]);
      
      if (error.message.toLowerCase().includes("pin")) {
        setDiagnosticResults(prev => [...prev, "➤ Es posible que el PIN sea incorrecto"]);
      }
    }
  };
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Diagnóstico de eToken</h1>
      <p className="text-gray-600">
        Esta herramienta verifica el correcto funcionamiento de su dispositivo de firma electrónica (eToken) 
        y proporciona información detallada sobre el estado del sistema.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 text-indigo-600 mr-2" />
            Herramienta de Diagnóstico
          </CardTitle>
          <CardDescription>
            Analiza el estado de su dispositivo de firma electrónica y muestra información detallada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="font-medium text-slate-800 mb-2">Información importante</h3>
            <p className="text-sm text-slate-700">
              Esta herramienta verifica:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mt-2 ml-2">
              <li>La presencia de la extensión PKCS#11 en su navegador</li>
              <li>La detección correcta de los dispositivos criptográficos conectados</li>
              <li>El acceso a los certificados almacenados en su eToken o smartcard</li>
              <li>La validez de los certificados digitales</li>
            </ul>
          </div>
          
          {status === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Problema detectado</AlertTitle>
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}
          
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Diagnóstico exitoso</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}
          
          {requiresPin && (
            <div className="space-y-2 my-4 p-4 border border-indigo-100 bg-indigo-50 rounded-md">
              <Label htmlFor="pin" className="text-indigo-900">PIN de acceso</Label>
              <Input 
                id="pin" 
                type="password" 
                placeholder="Ingrese el PIN de su dispositivo" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="border-indigo-200"
              />
              <p className="text-xs text-indigo-700 mt-1">
                El PIN es necesario para acceder a los certificados de su dispositivo.
                Su PIN no se almacena ni se transmite a ningún servidor.
              </p>
              <Button 
                onClick={checkCertificates} 
                disabled={status === "checking" || !pin}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {status === "checking" ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Verificando certificados...
                  </>
                ) : (
                  <>
                    <FileDigit className="mr-2 h-4 w-4" />
                    Verificar certificados
                  </>
                )}
              </Button>
            </div>
          )}
          
          {diagnosticResults.length > 0 && (
            <div className="border rounded-md p-4 bg-slate-50">
              <h3 className="font-medium mb-2">Resultados del diagnóstico:</h3>
              <div className="font-mono text-sm whitespace-pre-wrap">
                {diagnosticResults.map((line, idx) => (
                  <div key={idx} className={
                    line.startsWith("✓") ? "text-green-600" : 
                    line.startsWith("✖") ? "text-red-600" : 
                    line.startsWith("➤") ? "text-blue-600" : 
                    line.startsWith("  •") ? "text-gray-600 ml-4" : ""
                  }>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Sección de descarga o actualización de la extensión */}
          {showExtensionDownload && (
            <div className="mt-6 border border-indigo-200 rounded-md overflow-hidden">
              <div className="bg-indigo-100 p-4 border-b border-indigo-200">
                <h3 className="font-medium text-indigo-900 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-indigo-700" />
                  Descargar extensión de firma digital
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700">
                  Para utilizar firma digital avanzada, necesita instalar la extensión PKCS#11 en su navegador:
                </p>
                
                <div className="space-y-3 mt-4">
                  <div className="border rounded p-3 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-600 h-10 w-10 mr-3 rounded-full flex items-center justify-center text-white text-xl font-bold">C</div>
                    <div className="flex-grow">
                      <h4 className="font-medium">Extensión para Google Chrome</h4>
                      <p className="text-xs text-gray-600">Compatible con Chrome, Edge, Brave y otros navegadores basados en Chromium</p>
                    </div>
                    <a 
                      href="https://chrome.google.com/webstore/detail/etoken-chile/bjiggnkkapmcoaemgbojjbbkejobfgnn" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors inline-flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="bg-orange-500 h-10 w-10 mr-3 rounded-full flex items-center justify-center text-white text-xl font-bold">F</div>
                    <div className="flex-grow">
                      <h4 className="font-medium">Extensión para Mozilla Firefox</h4>
                      <p className="text-xs text-gray-600">Para navegadores Firefox</p>
                    </div>
                    <a 
                      href="https://addons.mozilla.org/es/firefox/addon/firmador-electronico-chile/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors inline-flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-800 h-10 w-10 mr-3 rounded-full flex items-center justify-center text-white text-xl font-bold">D</div>
                    <div className="flex-grow">
                      <h4 className="font-medium">SafeNet Authentication Client</h4>
                      <p className="text-xs text-gray-600">Controladores y software esencial para dispositivos eToken</p>
                    </div>
                    <a 
                      href="https://download.thalesesecurity.com/download?_ga=2.24517332.337417403.1673970743-1895204286.1673970743&_gl=1*1xmfteu*_ga*MTg5NTIwNDI4Ni4xNjczOTcwNzQz*_ga_PLJ5S4M5FR*MTY3Mzk3MDc0Mi4xLjAuMTY3Mzk3MDc0Mi4wLjAuMA..*_ga_CDHY7NPMWW*MTY3Mzk3MDc0Mi4xLjAuMTY3Mzk3MDc0Mi4wLjAuMA..#/download/get-link?productId=safenet-authentication-client-download-windows" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors inline-flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </div>
                </div>
                
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Información importante</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Después de instalar la extensión, reinicie su navegador y vuelva a ejecutar el diagnóstico.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
          
          {certificates.length > 0 && (
            <div className="border rounded-md mt-4">
              <div className="bg-indigo-50 p-3 border-b border-indigo-100 font-medium">
                Certificados encontrados ({certificates.length})
              </div>
              <div className="divide-y">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="p-3">
                    <h4 className="font-medium">{cert.subject}</h4>
                    <div className="mt-1 space-y-1 text-sm">
                      <p className="text-gray-600">Emisor: {cert.issuer}</p>
                      <p className="text-gray-600">
                        Válido desde: {formatDate(cert.validFrom)} hasta: {formatDate(cert.validTo)}
                      </p>
                      <p className="text-gray-500 font-mono text-xs truncate">
                        Número de serie: {cert.serialNumber}
                      </p>
                      <p className="text-gray-600">
                        Proveedor: {cert.provider}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runDiagnostics} 
            disabled={status === "checking"}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {status === "checking" && !requiresPin ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Ejecutando diagnóstico...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Iniciar diagnóstico
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Sección de solución de problemas */}
      <Card>
        <CardHeader>
          <CardTitle>Solución de problemas comunes</CardTitle>
          <CardDescription>
            Guía para resolver los problemas más frecuentes con dispositivos de firma digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">La extensión no se detecta</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Verifique que ha instalado la extensión PKCS#11 desde la tienda de extensiones de su navegador</li>
                <li>Asegúrese de que la extensión está habilitada en su navegador</li>
                <li>Algunos navegadores requieren permisos adicionales para este tipo de extensiones</li>
                <li>Intente reiniciar el navegador después de instalar la extensión</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">No se detectan dispositivos</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Verifique que el dispositivo está correctamente conectado al equipo</li>
                <li>Intente desconectar y volver a conectar el dispositivo</li>
                <li>Compruebe que los controladores del dispositivo están instalados en su sistema</li>
                <li>Algunos sistemas requieren software adicional para detectar ciertos tipos de tokens</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Problemas con el PIN</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Asegúrese de estar utilizando el PIN correcto para su dispositivo</li>
                <li>Si ha olvidado el PIN, contacte con el proveedor de su token</li>
                <li>Tenga en cuenta que después de varios intentos fallidos, el dispositivo puede bloquearse</li>
                <li>Algunos dispositivos distinguen entre mayúsculas y minúsculas en el PIN</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Certificados no válidos o expirados</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Verifique la fecha de expiración de sus certificados</li>
                <li>Si han expirado, contacte con su proveedor de certificados para renovarlos</li>
                <li>Asegúrese de que la fecha y hora de su sistema sean correctas</li>
                <li>Algunos certificados requieren una conexión a internet para verificar su validez</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}