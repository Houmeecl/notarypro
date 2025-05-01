import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, Receipt, Camera, ChevronLeft, 
  LogOut, ChevronRight, Printer, QrCode, 
  AlertCircle, CheckCircle, Clock, Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Tipos de datos
interface DocumentType {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

interface ProcessResult {
  success: boolean;
  documentId: string;
  verificationCode: string;
  clientName: string;
  timestamp: string;
  commission: number;
}

// Datos temporales para categorías y tipos de documentos
const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "contrato-arriendo",
    name: "Contrato de Arriendo",
    description: "Certificación de contrato de arriendo para propiedades",
    price: 4900,
    icon: "🏠"
  },
  {
    id: "contrato-trabajo",
    name: "Contrato de Trabajo",
    description: "Certificación de contrato laboral",
    price: 3900,
    icon: "💼"
  },
  {
    id: "autorizacion-viaje",
    name: "Autorización de Viaje",
    description: "Permiso de viaje para menores",
    price: 5900,
    icon: "✈️"
  },
  {
    id: "finiquito",
    name: "Finiquito",
    description: "Certificación de término de contrato laboral",
    price: 4500,
    icon: "📄"
  },
  {
    id: "certificado-residencia",
    name: "Certificado de Residencia",
    description: "Constancia de domicilio",
    price: 3500,
    icon: "🏡"
  },
  {
    id: "declaracion-jurada",
    name: "Declaración Jurada",
    description: "Certificación de declaración jurada simple",
    price: 3900,
    icon: "⚖️"
  },
  {
    id: "poder-simple",
    name: "Poder Simple",
    description: "Autorización para trámites",
    price: 3800,
    icon: "📝"
  },
  {
    id: "certificado-nacimiento",
    name: "Certificado de Nacimiento",
    description: "Validación de certificado de nacimiento",
    price: 3200,
    icon: "👶"
  }
];

export default function VecinosPosApp() {
  const [_, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState<"select" | "client" | "review" | "complete">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [clientInfo, setClientInfo] = useState({
    name: "",
    rut: "",
    phone: "",
    email: ""
  });
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  
  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("vecinos_token");
    if (!token) {
      setLocation("/vecinos/login");
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder",
        variant: "destructive",
      });
    }
  }, [setLocation]);
  
  // Mutación para procesar documento
  const processMutation = useMutation({
    mutationFn: async (data: {documentType: string, clientInfo: typeof clientInfo}) => {
      const res = await apiRequest("POST", "/api/vecinos/process-document", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al procesar el documento");
      }
      return await res.json();
    },
    onSuccess: (data: ProcessResult) => {
      setProcessResult(data);
      setActiveStep("complete");
      toast({
        title: "Documento procesado correctamente",
        description: "El documento ha sido certificado con éxito",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al procesar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrar documentos por búsqueda
  const filteredDocuments = DOCUMENT_TYPES.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Verificar si el formulario de cliente es válido
  const isClientFormValid = () => {
    return (
      clientInfo.name.trim().length > 3 &&
      clientInfo.rut.trim().length >= 8 &&
      clientInfo.phone.trim().length >= 8
    );
  };

  // Manejar selección de documento
  const handleSelectDocument = (document: DocumentType) => {
    setSelectedDocument(document);
    setActiveStep("client");
  };
  
  // Manejar cambios en la información del cliente
  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar revisión de documento
  const handleReview = () => {
    if (isClientFormValid()) {
      setActiveStep("review");
    } else {
      setShowClientDialog(true);
    }
  };
  
  // Manejar procesamiento del documento
  const handleProcessDocument = () => {
    if (selectedDocument) {
      processMutation.mutate({
        documentType: selectedDocument.id,
        clientInfo
      });
    }
  };
  
  // Reiniciar el proceso
  const handleReset = () => {
    setSelectedDocument(null);
    setClientInfo({
      name: "",
      rut: "",
      phone: "",
      email: ""
    });
    setProcessResult(null);
    setActiveStep("select");
    setSearchQuery("");
  };
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("vecinos_token");
    setLocation("/vecinos/login");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  // Renderizar paso 1: Selección de documento
  const renderSelectStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Buscar documento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocuments.map((doc) => (
          <Card 
            key={doc.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSelectDocument(doc)}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="text-3xl">{doc.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold">{doc.name}</h3>
                <p className="text-sm text-gray-500">${doc.price.toLocaleString('es-CL')}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        ))}
        
        {filteredDocuments.length === 0 && (
          <div className="col-span-2 text-center py-8 px-4 border rounded-lg bg-gray-50">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No se encontraron documentos con tu búsqueda.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar paso 2: Información del cliente
  const renderClientStep = () => (
    <div className="space-y-6">
      {selectedDocument && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="text-3xl">{selectedDocument.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold">{selectedDocument.name}</h3>
              <p className="text-sm text-gray-600">{selectedDocument.description}</p>
              <p className="text-sm font-semibold mt-1">${selectedDocument.price.toLocaleString('es-CL')}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información del cliente</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Ej. Juan Pérez González"
              value={clientInfo.name}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="rut">
              RUT <span className="text-red-500">*</span>
            </label>
            <Input
              id="rut"
              name="rut"
              placeholder="Ej. 12345678-9"
              value={clientInfo.rut}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              placeholder="Ej. 912345678"
              value={clientInfo.phone}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Correo electrónico <span className="text-gray-400">(opcional)</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ej. cliente@correo.com"
              value={clientInfo.email}
              onChange={handleClientInfoChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Si se proporciona, el cliente recibirá una copia del documento por correo
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setActiveStep("select")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleReview}
        >
          Continuar
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información incompleta</DialogTitle>
            <DialogDescription>
              Por favor completa todos los campos obligatorios marcados con asterisco (*).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowClientDialog(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Renderizar paso 3: Revisión
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          Revisa antes de procesar
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Verifica que los datos sean correctos. Una vez procesado, no podrás modificarlo.
        </p>
      </div>
      
      {selectedDocument && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{selectedDocument.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Documento</h4>
              <p className="font-medium">{selectedDocument.description}</p>
              <p className="font-bold text-blue-600">${selectedDocument.price.toLocaleString('es-CL')}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div>
                  <p className="font-medium">{clientInfo.name}</p>
                  <p className="text-sm">RUT: {clientInfo.rut}</p>
                </div>
                <div>
                  <p className="text-sm">Tel: {clientInfo.phone}</p>
                  {clientInfo.email && <p className="text-sm">Email: {clientInfo.email}</p>}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Comisión</h4>
              <p className="font-bold text-green-600">
                ${Math.round(selectedDocument.price * 0.2).toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-gray-500">
                20% de comisión por este documento
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setActiveStep("client")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleProcessDocument}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending ? (
            <>Procesando...</>
          ) : (
            <>
              Procesar documento
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Renderizar paso 4: Documento procesado
  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
        <h3 className="font-bold text-lg">¡Documento procesado con éxito!</h3>
        <p className="text-sm text-gray-600 mt-1">
          El documento ha sido certificado correctamente.
        </p>
      </div>
      
      {processResult && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-gray-500">Código de verificación</h4>
              <div className="bg-gray-100 py-2 px-4 rounded-lg mt-1 font-mono text-lg font-bold tracking-wider">
                {processResult.verificationCode}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Información del documento</h4>
              <ul className="space-y-2 mt-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{processResult.clientName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{processResult.timestamp}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-bold text-green-600">${processResult.commission.toLocaleString('es-CL')}</span>
                </li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="flex items-center justify-center">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir comprobante
              </Button>
              <Button variant="outline" className="flex items-center justify-center">
                <QrCode className="h-4 w-4 mr-2" />
                Mostrar código QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="pt-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleReset}
        >
          Procesar otro documento
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-1">Vecinos Xpress</h1>
            <span className="text-xs bg-white text-blue-600 px-1 py-0.5 rounded-sm">POS</span>
          </div>
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setShowLogoutConfirm(true)}>
            <AvatarFallback className="bg-blue-700 text-white text-sm">
              VX
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Información de paso */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          {activeStep === "select" ? (
            <h2 className="text-lg font-semibold">Seleccionar documento</h2>
          ) : activeStep === "client" ? (
            <Button 
              variant="ghost" 
              className="pl-0 flex items-center -ml-3" 
              onClick={() => setActiveStep("select")}
            >
              <ChevronLeft className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Datos del cliente</h2>
            </Button>
          ) : activeStep === "review" ? (
            <Button 
              variant="ghost" 
              className="pl-0 flex items-center -ml-3" 
              onClick={() => setActiveStep("client")}
            >
              <ChevronLeft className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Revisar y procesar</h2>
            </Button>
          ) : (
            <h2 className="text-lg font-semibold">Documento procesado</h2>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {activeStep === "select" && renderSelectStep()}
        {activeStep === "client" && renderClientStep()}
        {activeStep === "review" && renderReviewStep()}
        {activeStep === "complete" && renderCompleteStep()}
      </main>

      {/* Diálogo para confirmar cierre de sesión */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cerrar sesión?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}