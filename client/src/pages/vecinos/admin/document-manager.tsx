import React, { useState, useEffect } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import DocumentQRGenerator from "@/components/vecinos/DocumentQRGenerator";
import BatchDocumentImport from "@/components/vecinos/BatchDocumentImport";
import CameraCapture from "@/components/vecinos/CameraCapture";
import { useRealFuncionality } from "@/hooks/use-real-funcionality";
import { useToast } from "@/hooks/use-toast";
import FunctionalModeIndicator from "@/components/document/FunctionalModeIndicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Filter,
  Check,
  Clock,
  X,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  Calendar,
  Users,
  Building,
  ArrowUpDown,
  History,
  QrCode,
  ScanLine,
  Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const DocumentManagerPage = () => {
  // Usar el hook de funcionalidad real con activación automática
  const { isFunctionalMode, activarModoReal } = useRealFuncionality(true);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isBatchImportDialogOpen, setIsBatchImportDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  
  // Comprobar modo funcional al cargar
  useEffect(() => {
    if (isFunctionalMode) {
      console.log("✅ Gestor documental cargado en modo funcional real");
      toast({
        title: "Gestor Documental Activo",
        description: "El sistema de gestión documental se ha cargado en modo funcional real",
        duration: 3000,
      });
    }
  }, [isFunctionalMode, toast]);
  
  // Datos simulados para el gestor documental
  const documents = [
    {
      id: 1,
      title: "Contrato de Arriendo Local Comercial",
      type: "contrato",
      category: "legal",
      status: "signed",
      createdAt: "2025-04-28T14:30:00",
      partner: "Minimarket El Sol",
      fileSize: "1.2 MB",
      version: "1.0",
      author: "Carlos Mendoza",
      pendingSignatures: 0,
      totalSignatures: 2
    },
    {
      id: 2,
      title: "Solicitud de Ingreso Socio VecinoXpress",
      type: "formulario",
      category: "administrativo",
      status: "pending",
      createdAt: "2025-05-01T09:45:00",
      partner: "Farmacia Vida",
      fileSize: "850 KB",
      version: "1.0",
      author: "Ana Silva",
      pendingSignatures: 1,
      totalSignatures: 2
    },
    {
      id: 3,
      title: "Certificado de Constitución",
      type: "certificado",
      category: "legal",
      status: "validated",
      createdAt: "2025-04-20T11:15:00",
      partner: "Minimarket El Sol",
      fileSize: "1.5 MB",
      version: "1.0",
      author: "Juan Carrasco",
      pendingSignatures: 0,
      totalSignatures: 1
    },
    {
      id: 4,
      title: "Contrato de Servicios VecinoXpress",
      type: "contrato",
      category: "comercial",
      status: "draft",
      createdAt: "2025-05-02T16:20:00",
      partner: "Librería Central",
      fileSize: "920 KB",
      version: "0.9",
      author: "Carlos Mendoza",
      pendingSignatures: 0,
      totalSignatures: 0
    },
    {
      id: 5,
      title: "Declaración de Cumplimiento Normativo",
      type: "declaracion",
      category: "legal",
      status: "signed",
      createdAt: "2025-04-15T10:30:00",
      partner: "Farmacia Vida",
      fileSize: "750 KB",
      version: "1.0",
      author: "Ana Silva",
      pendingSignatures: 0,
      totalSignatures: 1
    },
    {
      id: 6,
      title: "Acuerdo de Nivel de Servicio",
      type: "contrato",
      category: "comercial",
      status: "rejected",
      createdAt: "2025-04-25T13:40:00",
      partner: "Café Internet Speed",
      fileSize: "980 KB",
      version: "1.1",
      author: "Juan Carrasco",
      pendingSignatures: 0,
      totalSignatures: 2
    },
    {
      id: 7,
      title: "Certificado de Autenticidad Firma",
      type: "certificado",
      category: "legal",
      status: "validated",
      createdAt: "2025-05-03T09:15:00",
      partner: "Ferretería Construmax",
      fileSize: "450 KB",
      version: "1.0",
      author: "Carlos Mendoza",
      pendingSignatures: 0,
      totalSignatures: 1
    },
  ];
  
  // Datos de categorías
  const categories = [
    { id: "legal", name: "Legal", count: 4 },
    { id: "comercial", name: "Comercial", count: 2 },
    { id: "administrativo", name: "Administrativo", count: 1 },
  ];
  
  // Datos de tipos de documento
  const documentTypes = [
    { id: "contrato", name: "Contrato", count: 3 },
    { id: "certificado", name: "Certificado", count: 2 },
    { id: "formulario", name: "Formulario", count: 1 },
    { id: "declaracion", name: "Declaración", count: 1 },
  ];
  
  // Datos de socios
  const partners = [
    { id: "minimarket-el-sol", name: "Minimarket El Sol", count: 2 },
    { id: "farmacia-vida", name: "Farmacia Vida", count: 2 },
    { id: "libreria-central", name: "Librería Central", count: 1 },
    { id: "cafe-internet-speed", name: "Café Internet Speed", count: 1 },
    { id: "ferreteria-construmax", name: "Ferretería Construmax", count: 1 },
  ];
  
  // Datos de actividad reciente
  const recentActivity = [
    { id: 1, type: "upload", document: "Contrato de Arriendo Local Comercial", user: "Carlos Mendoza", date: "2025-05-03T14:30:00" },
    { id: 2, type: "sign", document: "Certificado de Autenticidad Firma", user: "Juan Carrasco", date: "2025-05-03T11:45:00" },
    { id: 3, type: "validate", document: "Certificado de Constitución", user: "Ana Silva", date: "2025-05-02T16:20:00" },
    { id: 4, type: "reject", document: "Acuerdo de Nivel de Servicio", user: "Carlos Mendoza", date: "2025-05-01T09:10:00" },
    { id: 5, type: "comment", document: "Solicitud de Ingreso Socio VecinoXpress", user: "Ana Silva", date: "2025-04-30T13:55:00" },
  ];
  
  // Estadísticas de documentos
  const documentStats = {
    total: 7,
    signed: 2,
    pending: 1,
    validated: 2,
    draft: 1,
    rejected: 1,
    thisMonth: 5,
    lastMonth: 2,
    signatureRate: 85
  };
  
  // Filtrar documentos según el tab y filtros seleccionados
  const filteredDocuments = documents.filter(doc => {
    // Filtro por estado (tab)
    const statusMatch = selectedTab === "all" || doc.status === selectedTab;
    
    // Filtro por categoría
    const categoryMatch = selectedCategory === "all" || doc.category === selectedCategory;
    
    // Filtro por tipo de documento
    const typeMatch = selectedDocumentType === "all" || doc.type === selectedDocumentType;
    
    // Filtro por socio
    const partnerMatch = selectedPartner === "all" || doc.partner === selectedPartner;
    
    // Filtro por término de búsqueda
    const searchMatch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        doc.partner.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && categoryMatch && typeMatch && partnerMatch && searchMatch;
  });
  
  // Función para renderizar el badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Borrador</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendiente</Badge>;
      case "validated":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Validado</Badge>;
      case "signed":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Firmado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Formatear la fecha
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };
  
  // Manejar selección de documentos
  const toggleDocumentSelection = (id: number) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter(docId => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };
  
  // Seleccionar todos los documentos
  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };
  
  return (
    <VecinosAdminLayout title="Gestor Documental">
      <FunctionalModeIndicator className="mb-4" />
      <div className="space-y-6">
        {/* Panel superior con estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total documentos</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">{documentStats.total}</h3>
                  <p className="text-xs text-gray-500 mt-1">En plataforma</p>
                </div>
                <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                  <FileText className="h-5 w-5 text-[#2d219b]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentos firmados</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">{documentStats.signed}</h3>
                  <p className="text-xs text-gray-500 mt-1">De {documentStats.total} documentos</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes de firma</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">{documentStats.pending}</h3>
                  <p className="text-xs text-gray-500 mt-1">Requieren acción</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este mes</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#2d219b]">{documentStats.thisMonth}</h3>
                  <p className="text-xs text-gray-500 mt-1">+{documentStats.thisMonth - documentStats.lastMonth} que mes pasado</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-600">Tasa de firmas</p>
                  <div className="p-2 bg-[#2d219b] bg-opacity-10 rounded-full">
                    <FileText className="h-5 w-5 text-[#2d219b]" />
                  </div>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-2xl font-bold text-[#2d219b]">{documentStats.signatureRate}%</span>
                    <span className="text-xs text-green-600 font-medium">+5% vs mes anterior</span>
                  </div>
                  <Progress value={documentStats.signatureRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Acciones y filtros */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#2d219b] hover:bg-[#241a7d] text-white">
                  <Camera className="h-4 w-4" />
                  Capturar con cámara
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Capturar documento con cámara</DialogTitle>
                  <DialogDescription>
                    Utilice la cámara para capturar documentos o identificaciones.
                  </DialogDescription>
                </DialogHeader>
                
                {isCameraDialogOpen && (
                  <CameraCapture
                    onCapture={(imgSrc) => {
                      setCapturedImage(imgSrc);
                      toast({
                        title: "Imagen capturada",
                        description: "Documento capturado correctamente con la cámara",
                      });
                      setIsCameraDialogOpen(false);
                      
                      // Aquí se procesaría la imagen capturada
                      console.log("Imagen capturada:", imgSrc.substring(0, 50) + "...");
                    }}
                    onCancel={() => setIsCameraDialogOpen(false)}
                    captureLabel="Capturar documento"
                  />
                )}
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subir nuevo documento</DialogTitle>
                  <DialogDescription>
                    Cargue un documento para añadirlo al sistema. Se admiten archivos PDF, DOC, DOCX.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium mb-1">Arrastre archivos aquí o haga clic para buscar</p>
                    <p className="text-xs text-gray-500">Máximo 10MB por archivo</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="docType">Tipo de documento</label>
                      <Select defaultValue="contrato">
                        <SelectTrigger id="docType">
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
                      <label className="text-sm font-medium" htmlFor="docCategory">Categoría</label>
                      <Select defaultValue="legal">
                        <SelectTrigger id="docCategory">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="docPartner">Socio relacionado</label>
                    <Select>
                      <SelectTrigger id="docPartner">
                        <SelectValue placeholder="Seleccionar socio (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">Subir documento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Códigos QR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Generador de códigos QR para documentos</DialogTitle>
                  <DialogDescription>
                    Genere códigos QR para compartir documentos o escanee documentos desde códigos QR
                  </DialogDescription>
                </DialogHeader>
                <DocumentQRGenerator 
                  onDocumentImport={(docData) => {
                    console.log("Documento importado:", docData);
                    setIsQRDialogOpen(false);
                    // Aquí se implementaría la lógica para añadir el documento al sistema
                  }}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isBatchImportDialogOpen} onOpenChange={setIsBatchImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Importar Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Importación Masiva de Documentos</DialogTitle>
                  <DialogDescription>
                    Importe múltiples documentos desde un archivo CSV o carpeta
                  </DialogDescription>
                </DialogHeader>
                <BatchDocumentImport 
                  onImportComplete={(importedDocs) => {
                    console.log("Documentos importados:", importedDocs);
                    setIsBatchImportDialogOpen(false);
                    // Aquí se implementaría la lógica para añadir los documentos al sistema
                  }}
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Nueva categoría
            </Button>
            
            {selectedDocuments.length > 0 && (
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar ({selectedDocuments.length})
              </Button>
            )}
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Buscar por título o socio..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Panel principal con tabs y contenido */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-0">
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Gestión centralizada de todos los documentos en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Tabs para filtrar por estado */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="all" className="text-sm">
                  Todos ({documents.length})
                </TabsTrigger>
                <TabsTrigger value="signed" className="text-sm">
                  Firmados ({documents.filter(d => d.status === "signed").length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-sm">
                  Pendientes ({documents.filter(d => d.status === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="validated" className="text-sm">
                  Validados ({documents.filter(d => d.status === "validated").length})
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-sm">
                  Borradores ({documents.filter(d => d.status === "draft").length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-sm">
                  Rechazados ({documents.filter(d => d.status === "rejected").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Filtros adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {documentTypes.map(dt => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {dt.name} ({dt.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por socio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los socios</SelectItem>
                  {partners.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tabla de documentos */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <span>Documento</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Socio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium mb-1">No se encontraron documentos</p>
                        <p className="text-gray-400 text-sm">Intente con otros criterios de búsqueda</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedDocuments.includes(doc.id)}
                            onCheckedChange={() => toggleDocumentSelection(doc.id)}
                            aria-label={`Seleccionar ${doc.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#2d219b]/10 rounded">
                              <FileText className="h-4 w-4 text-[#2d219b]" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-gray-500">Versión {doc.version} • {doc.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span>{doc.partner}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(doc.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(doc.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">{doc.fileSize}</div>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                              <div className="grid gap-1">
                                <Button variant="ghost" className="justify-start gap-2 text-sm">
                                  <Eye className="h-4 w-4" />
                                  Ver documento
                                </Button>
                                <Button variant="ghost" className="justify-start gap-2 text-sm">
                                  <Download className="h-4 w-4" />
                                  Descargar
                                </Button>
                                <Button variant="ghost" className="justify-start gap-2 text-sm">
                                  <Edit className="h-4 w-4" />
                                  Editar detalles
                                </Button>
                                <Button variant="ghost" className="justify-start gap-2 text-sm text-red-600 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-gray-500">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Sección inferior con actividad reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>
                Últimas acciones realizadas en documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'upload' ? 'bg-blue-100' :
                      activity.type === 'sign' ? 'bg-green-100' :
                      activity.type === 'validate' ? 'bg-purple-100' :
                      activity.type === 'reject' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'upload' && <Upload className={`h-4 w-4 text-blue-600`} />}
                      {activity.type === 'sign' && <Check className={`h-4 w-4 text-green-600`} />}
                      {activity.type === 'validate' && <CheckCircle className={`h-4 w-4 text-purple-600`} />}
                      {activity.type === 'reject' && <X className={`h-4 w-4 text-red-600`} />}
                      {activity.type === 'comment' && <FileText className={`h-4 w-4 text-gray-600`} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <p className="font-medium text-sm">{activity.document}</p>
                        <span className="text-xs text-gray-500">
                          {format(new Date(activity.date), "d MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.type === 'upload' && `${activity.user} subió un nuevo documento`}
                        {activity.type === 'sign' && `${activity.user} firmó el documento`}
                        {activity.type === 'validate' && `${activity.user} validó el documento`}
                        {activity.type === 'reject' && `${activity.user} rechazó el documento`}
                        {activity.type === 'comment' && `${activity.user} comentó en el documento`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" className="text-sm gap-2">
                  <History className="h-4 w-4" />
                  Ver todo el historial
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Categorías de documentos</CardTitle>
              <CardDescription>
                Documentos por tipo y categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        category.id === 'legal' ? 'bg-blue-100' :
                        category.id === 'comercial' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        <FileText className={`h-4 w-4 ${
                          category.id === 'legal' ? 'text-blue-600' :
                          category.id === 'comercial' ? 'text-green-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-4">Tipos de documento</h4>
                <div className="space-y-3">
                  {documentTypes.map(type => (
                    <div key={type.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {type.id === 'contrato' && <FileText className="h-4 w-4 text-blue-500" />}
                        {type.id === 'certificado' && <FileSpreadsheet className="h-4 w-4 text-green-500" />}
                        {type.id === 'formulario' && <FileText className="h-4 w-4 text-amber-500" />}
                        {type.id === 'declaracion' && <FileText className="h-4 w-4 text-purple-500" />}
                        <span className="text-sm capitalize">{type.name}</span>
                      </div>
                      <Badge variant="outline">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button className="w-full gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Crear nueva categoría
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VecinosAdminLayout>
  );
};

export default DocumentManagerPage;