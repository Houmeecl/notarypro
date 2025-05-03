import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  X, 
  RefreshCw,
  FolderUp,
  List 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchDocumentImportProps {
  onImportComplete?: (documents: any[]) => void;
}

const BatchDocumentImport = ({ onImportComplete }: BatchDocumentImportProps) => {
  const [activeTab, setActiveTab] = useState("csv");
  const [csvText, setCsvText] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [documentType, setDocumentType] = useState("contrato");
  const [documentCategory, setDocumentCategory] = useState("legal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    documents: any[];
  } | null>(null);
  const { toast } = useToast();

  // Función para procesar el CSV
  const processCSV = () => {
    if (!csvText.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese datos CSV para procesar",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);
    
    // Simulamos el procesamiento con un intervalo de tiempo
    const lines = csvText.trim().split("\n").filter(line => line.trim());
    const headerLine = lines[0];
    const dataLines = lines.slice(1);
    const totalLines = dataLines.length;
    
    if (totalLines === 0) {
      toast({
        title: "Error",
        description: "El CSV no contiene datos a procesar",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }
    
    // Parseamos el encabezado para determinar columnas
    const headers = headerLine.split(",").map(h => h.trim());
    const requiredHeaders = ["title", "type", "partner"];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      toast({
        title: "Error en formato CSV",
        description: `Faltan columnas requeridas: ${missingHeaders.join(", ")}`,
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }
    
    // Contador para el seguimiento del progreso
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const importedDocuments: any[] = [];
    
    // Intervalo para simular procesamiento progresivo
    const processInterval = setInterval(() => {
      if (processedCount >= totalLines) {
        clearInterval(processInterval);
        setIsProcessing(false);
        setProgress(100);
        
        setResults({
          total: totalLines,
          successful: successCount,
          failed: failCount,
          documents: importedDocuments
        });
        
        if (onImportComplete) {
          onImportComplete(importedDocuments);
        }
        
        toast({
          title: "Importación completada",
          description: `${successCount} de ${totalLines} documentos importados con éxito`,
          variant: successCount === totalLines ? "default" : "destructive"
        });
        
        return;
      }
      
      // Procesamos la línea actual
      const line = dataLines[processedCount];
      const values = line.split(",").map(v => v.trim());
      
      // Creamos un objeto con los datos según los encabezados
      const documentData: Record<string, string> = {};
      headers.forEach((header, index) => {
        documentData[header] = values[index] || "";
      });
      
      // Determinamos si es un documento válido
      const isValid = documentData.title && documentData.type;
      
      if (isValid) {
        successCount++;
        importedDocuments.push({
          id: Date.now() + processedCount,
          title: documentData.title,
          type: documentData.type,
          category: documentCategory,
          status: "draft",
          createdAt: new Date().toISOString(),
          partner: documentData.partner || "No especificado",
          fileSize: "0 KB", // Placeholder
          version: "1.0",
          author: "Sistema",
          pendingSignatures: 0,
          totalSignatures: 0
        });
      } else {
        failCount++;
      }
      
      processedCount++;
      setProgress(Math.floor((processedCount / totalLines) * 100));
    }, 200); // Cada 200ms procesamos un documento
  };

  // Función para procesar la carpeta
  const processFolderImport = () => {
    if (!folderPath.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese una ruta de carpeta",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);
    
    // Simulamos la detección de archivos en la carpeta
    // En una implementación real, esto sería una petición al servidor
    const mockDetectedFiles = [
      { name: "Contrato_Arriendo_001.pdf", size: "1.2 MB", type: "application/pdf" },
      { name: "Certificado_Autenticidad.docx", size: "580 KB", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { name: "Acuerdo_Nivel_Servicio.pdf", size: "920 KB", type: "application/pdf" },
      { name: "Solicitud_Ingreso_Socio.doc", size: "760 KB", type: "application/msword" },
      { name: "Declaracion_Conformidad.pdf", size: "450 KB", type: "application/pdf" },
    ];
    
    const totalFiles = mockDetectedFiles.length;
    let processedCount = 0;
    const importedDocuments: any[] = [];
    
    // Intervalo para simular procesamiento progresivo de archivos
    const processInterval = setInterval(() => {
      if (processedCount >= totalFiles) {
        clearInterval(processInterval);
        setIsProcessing(false);
        setProgress(100);
        
        setResults({
          total: totalFiles,
          successful: totalFiles, // Asumimos que todos fueron exitosos en esta demo
          failed: 0,
          documents: importedDocuments
        });
        
        if (onImportComplete) {
          onImportComplete(importedDocuments);
        }
        
        toast({
          title: "Importación de carpeta completada",
          description: `${totalFiles} documentos importados con éxito desde la carpeta`,
        });
        
        return;
      }
      
      // Procesamos el archivo actual
      const file = mockDetectedFiles[processedCount];
      
      // Convertimos el nombre de archivo a un título legible
      const fileTitle = file.name
        .replace(/\.[^/.]+$/, "") // Quitar extensión
        .replace(/_/g, " "); // Reemplazar guiones bajos con espacios
      
      importedDocuments.push({
        id: Date.now() + processedCount,
        title: fileTitle,
        type: determineDocumentTypeFromName(file.name),
        category: documentCategory,
        status: "draft",
        createdAt: new Date().toISOString(),
        partner: "Carga desde carpeta",
        fileSize: file.size,
        version: "1.0",
        author: "Sistema",
        pendingSignatures: 0,
        totalSignatures: 0
      });
      
      processedCount++;
      setProgress(Math.floor((processedCount / totalFiles) * 100));
    }, 500); // Cada 500ms procesamos un archivo
  };

  // Función para determinar el tipo de documento basado en el nombre
  const determineDocumentTypeFromName = (fileName: string): string => {
    fileName = fileName.toLowerCase();
    
    if (fileName.includes("contrato") || fileName.includes("acuerdo")) {
      return "contrato";
    } else if (fileName.includes("certificado") || fileName.includes("autenticidad")) {
      return "certificado";
    } else if (fileName.includes("solicitud") || fileName.includes("formulario")) {
      return "formulario";
    } else if (fileName.includes("declaracion")) {
      return "declaracion";
    } else {
      return documentType; // Tipo por defecto seleccionado
    }
  };

  // Función para reiniciar el proceso
  const resetImport = () => {
    setResults(null);
    setProgress(0);
    setCsvText("");
    setFolderPath("");
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="csv" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importar desde CSV
          </TabsTrigger>
          <TabsTrigger value="folder" className="flex items-center gap-2">
            <FolderUp className="h-4 w-4" />
            Importar desde carpeta
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="csv-data">Datos CSV</Label>
            <Textarea 
              id="csv-data"
              placeholder={`title,type,partner\nContrato de Arriendo,contrato,Minimarket El Sol\nCertificado Legal,certificado,Farmacia Vida`}
              className="min-h-[150px] font-mono text-sm"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              Formato: un documento por línea, con las columnas: title, type, partner (requeridas)
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-type">Tipo de documento por defecto</Label>
              <Select 
                value={documentType} 
                onValueChange={setDocumentType}
                disabled={isProcessing}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="certificado">Certificado</SelectItem>
                  <SelectItem value="formulario">Formulario</SelectItem>
                  <SelectItem value="declaracion">Declaración</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Se usará si no se especifica en el CSV
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doc-category">Categoría de documentos</Label>
              <Select 
                value={documentCategory} 
                onValueChange={setDocumentCategory}
                disabled={isProcessing}
              >
                <SelectTrigger id="doc-category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Se aplicará a todos los documentos
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="folder" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="folder-path">Ruta de la carpeta</Label>
            <div className="flex gap-2">
              <Input 
                id="folder-path"
                placeholder="/ruta/a/documentos"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                disabled={isProcessing}
              />
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setFolderPath("/documentos/importacion_lote")}
                disabled={isProcessing}
              >
                Examinar
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Se importarán todos los documentos PDF, DOC y DOCX de la carpeta
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-type-folder">Tipo de documento por defecto</Label>
              <Select 
                value={documentType} 
                onValueChange={setDocumentType}
                disabled={isProcessing}
              >
                <SelectTrigger id="doc-type-folder">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="certificado">Certificado</SelectItem>
                  <SelectItem value="formulario">Formulario</SelectItem>
                  <SelectItem value="declaracion">Declaración</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Se intentará determinar el tipo según el nombre o se usará este valor
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doc-category-folder">Categoría de documentos</Label>
              <Select 
                value={documentCategory} 
                onValueChange={setDocumentCategory}
                disabled={isProcessing}
              >
                <SelectTrigger id="doc-category-folder">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Se aplicará a todos los documentos de la carpeta
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Procesando documentos...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {results && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Resultados de la importación</h3>
                <Button variant="ghost" size="icon" onClick={resetImport}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <List className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{results.total}</p>
                  <p className="text-sm text-gray-500">Total procesados</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <Check className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600">{results.successful}</p>
                  <p className="text-sm text-gray-500">Importados con éxito</p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <X className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                  <p className="text-sm text-gray-500">Fallidos</p>
                </div>
              </div>
              
              {results.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Documentos importados:</h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    <ul className="space-y-2">
                      {results.documents.map((doc, index) => (
                        <li key={index} className="text-sm flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#2d219b]" />
                            <span>{doc.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{doc.type}</Badge>
                            <Badge variant="secondary">Borrador</Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          type="button"
          disabled={isProcessing}
          onClick={resetImport}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isProcessing || (activeTab === "csv" && !csvText.trim()) || (activeTab === "folder" && !folderPath.trim())}
          onClick={activeTab === "csv" ? processCSV : processFolderImport}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Importar documentos</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BatchDocumentImport;