import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode, Camera, Download, Copy, Upload, File, X, Scan, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentQRGeneratorProps {
  onDocumentImport?: (documentData: any) => void;
}

const DocumentQRGenerator = ({ onDocumentImport }: DocumentQRGeneratorProps) => {
  const [activeTab, setActiveTab] = useState("generate");
  const [qrData, setQrData] = useState({
    title: "",
    type: "contrato",
    description: "",
    recipient: "",
    expiryDate: ""
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<null | any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  // Función para generar el código QR
  const generateQRCode = async () => {
    if (!qrData.title) {
      toast({
        title: "Título requerido",
        description: "Por favor ingrese un título para el documento",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Creamos un objeto con los datos que queremos incluir en el QR
      const documentData = {
        ...qrData,
        id: `doc-${Date.now()}`,
        generatedAt: new Date().toISOString(),
      };
      
      // Convertimos a JSON string
      const jsonData = JSON.stringify(documentData);
      
      // Generamos el QR como data URL
      const dataUrl = await QRCode.toDataURL(jsonData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#2d219b",
          light: "#FFFFFF"
        }
      });
      
      setQrCodeUrl(dataUrl);
      
      toast({
        title: "Código QR generado",
        description: "El código QR del documento ha sido creado con éxito",
      });
    } catch (error) {
      console.error("Error al generar el código QR:", error);
      toast({
        title: "Error al generar el código QR",
        description: "Ha ocurrido un error al generar el código QR",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para descargar el código QR
  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-documento-${qrData.title.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Código QR descargado",
      description: "La imagen del código QR ha sido descargada"
    });
  };

  // Función para copiar el código QR al portapapeles
  const copyQRCodeToClipboard = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast({
        title: "Código QR copiado",
        description: "La imagen del código QR ha sido copiada al portapapeles"
      });
    } catch (error) {
      console.error("Error al copiar el código QR:", error);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar la imagen al portapapeles",
        variant: "destructive"
      });
    }
  };

  // Función para iniciar el escaneo de QR
  const startQRScanner = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Configuramos un intervalo para verificar el QR
      const interval = setInterval(() => {
        if (!canvasRef.current || !videoRef.current) {
          clearInterval(interval);
          return;
        }
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        if (context && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // Aquí iría una biblioteca real para leer el QR desde el canvas
          // Como simulación, consideramos que leemos un QR después de 3 segundos
          setTimeout(() => {
            // Datos simulados de documento para la demo
            const fakeDocumentData = {
              id: `doc-${Date.now()}`,
              title: "Contrato de Arriendo Local Comercial",
              type: "contrato",
              description: "Contrato estándar para arriendo de local comercial con VecinoXpress",
              recipient: "Minimarket El Sol",
              generatedAt: new Date().toISOString(),
              expiryDate: "2025-12-31"
            };
            
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
              videoRef.current.srcObject = null;
            }
            
            clearInterval(interval);
            setScanResult(fakeDocumentData);
            
            toast({
              title: "QR escaneado con éxito",
              description: "Se ha detectado un documento en el código QR",
            });
          }, 3000);
        }
      }, 500);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara del dispositivo",
        variant: "destructive"
      });
    }
  };

  // Función para detener el escaneo de QR
  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Función para importar el documento desde el QR escaneado
  const importDocumentFromQR = () => {
    if (!scanResult) return;
    
    setIsImporting(true);
    
    // Simulamos un proceso de importación con un pequeño retraso
    setTimeout(() => {
      if (onDocumentImport) {
        onDocumentImport(scanResult);
      }
      
      toast({
        title: "Documento importado con éxito",
        description: "El documento ha sido añadido al sistema",
      });
      
      // Limpiamos el estado
      setScanResult(null);
      setIsScannerOpen(false);
      setIsImporting(false);
    }, 1500);
  };

  // Effect para manejar el cierre adecuado del stream al cerrar el scanner
  useEffect(() => {
    if (!isScannerOpen) {
      stopQRScanner();
    }
  }, [isScannerOpen]);

  return (
    <div>
      <Tabs defaultValue="generate" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Generar QR
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Escanear QR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del documento</Label>
                <Input 
                  id="title"
                  placeholder="Ingrese el título del documento"
                  value={qrData.title}
                  onChange={e => setQrData({...qrData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de documento</Label>
                <Select 
                  value={qrData.type} 
                  onValueChange={value => setQrData({...qrData, type: value})}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="certificado">Certificado</SelectItem>
                    <SelectItem value="formulario">Formulario</SelectItem>
                    <SelectItem value="declaracion">Declaración</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description"
                  placeholder="Ingrese una descripción del documento"
                  value={qrData.description}
                  onChange={e => setQrData({...qrData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatario</Label>
                <Input 
                  id="recipient"
                  placeholder="Nombre del destinatario o socio"
                  value={qrData.recipient}
                  onChange={e => setQrData({...qrData, recipient: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Fecha de expiración (opcional)</Label>
                <Input 
                  id="expiryDate"
                  type="date"
                  value={qrData.expiryDate}
                  onChange={e => setQrData({...qrData, expiryDate: e.target.value})}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={generateQRCode}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Generando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>Generar código QR</span>
                  </div>
                )}
              </Button>
            </div>
            
            <Card className="overflow-hidden flex flex-col">
              <CardContent className="p-6 flex-grow flex flex-col items-center justify-center">
                {qrCodeUrl ? (
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm inline-block">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="max-w-full h-auto"
                        width={250}
                        height={250}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Código QR para: {qrData.title}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={downloadQRCode}
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={copyQRCodeToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-48 h-48 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="h-16 w-16 text-gray-300" />
                    </div>
                    <p className="text-gray-500">
                      Complete los datos del documento y genere un código QR
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center p-4">
                <div className="mb-4">
                  <Camera className="h-12 w-12 text-[#2d219b] mx-auto" />
                  <h3 className="mt-2 text-lg font-medium">Escanear QR de documento</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Escanee un código QR para importar rápidamente los datos del documento
                  </p>
                </div>
                
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Scan className="h-4 w-4" />
                      Abrir escáner QR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Escanear código QR</DialogTitle>
                      <DialogDescription>
                        Apunte la cámara hacia un código QR de documento para importarlo
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!scanResult ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                        <video 
                          ref={videoRef} 
                          className="h-full w-full object-cover"
                          autoPlay 
                          playsInline
                          muted
                          onLoadedMetadata={() => startQRScanner()}
                        />
                        <canvas 
                          ref={canvasRef} 
                          className="hidden"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="border-2 border-white border-dashed w-3/4 h-3/4 rounded-lg opacity-70"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Documento detectado</h3>
                            <p className="text-sm text-gray-500">QR escaneado correctamente</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Título</p>
                              <p className="text-sm font-medium">{scanResult.title}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Tipo</p>
                              <p className="text-sm font-medium capitalize">{scanResult.type}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Descripción</p>
                              <p className="text-sm">{scanResult.description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Destinatario</p>
                              <p className="text-sm">{scanResult.recipient}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Fecha exp.</p>
                              <p className="text-sm">{scanResult.expiryDate || "No definida"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter className="sm:justify-between">
                      {!scanResult ? (
                        <Button
                          type="button" 
                          variant="outline"
                          onClick={() => setIsScannerOpen(false)}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setScanResult(null);
                              startQRScanner();
                            }}
                            className="gap-2"
                          >
                            <Scan className="h-4 w-4" />
                            Escanear otro
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={importDocumentFromQR}
                            disabled={isImporting}
                            className="gap-2"
                          >
                            {isImporting ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Importando...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                <span>Importar documento</span>
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <div className="mt-8 p-5 border border-dashed rounded-lg">
                  <File className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    También puede arrastrar y soltar un archivo de código QR aquí
                  </p>
                  <div className="mt-3">
                    <label 
                      htmlFor="qr-file-input"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      Seleccionar archivo
                    </label>
                    <input 
                      id="qr-file-input" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={() => {
                        // Simulamos que se ha leído un QR de imagen
                        setTimeout(() => {
                          const fakeDocumentData = {
                            id: `doc-${Date.now()}`,
                            title: "Certificado de Constitución",
                            type: "certificado",
                            description: "Certificado legal para socio VecinoXpress",
                            recipient: "Farmacia Vida",
                            generatedAt: new Date().toISOString(),
                            expiryDate: "2026-05-31"
                          };
                          
                          setScanResult(fakeDocumentData);
                          setIsScannerOpen(true);
                          
                          toast({
                            title: "QR detectado en imagen",
                            description: "Se ha detectado un documento en la imagen",
                          });
                        }, 1500);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800">¿Cómo funciona?</h3>
            <p className="text-sm text-blue-600 mt-1">
              Los códigos QR contienen información estructurada sobre los documentos, 
              permitiendo compartir e importar rápidamente datos entre dispositivos. 
              Para mayor seguridad, los documentos importados requerirán validación adicional.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentQRGenerator;