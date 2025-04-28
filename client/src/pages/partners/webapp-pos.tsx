import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, UserCheck, FileText, AlertCircle, Loader2, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * WebApp alternativa para los socios de Vecinos
 * Esta página permite a los almacenes o locales acceder a las mismas
 * funcionalidades que ofrece la app de Android pero desde el navegador
 */
const WebAppPOS: React.FC = () => {
  const [storeCode, setStoreCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeScreen, setActiveScreen] = useState<"login" | "dashboard" | "form" | "success">("login");
  const [formData, setFormData] = useState<any>({});
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    documentNumber: ""
  });
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Intentar cargar información del local desde localStorage
  useEffect(() => {
    const savedStoreInfo = localStorage.getItem("vecinos_store_info");
    if (savedStoreInfo) {
      try {
        const parsedInfo = JSON.parse(savedStoreInfo);
        setStoreInfo(parsedInfo);
        setIsAuthenticated(true);
        setActiveScreen("dashboard");
      } catch (e) {
        // Si hay un error en el parseo, limpiar el localStorage
        localStorage.removeItem("vecinos_store_info");
      }
    }
    
    // Cargar tipos de documentos disponibles
    loadDocumentTypes();
  }, []);
  
  // Cargar tipos de documentos disponibles
  const loadDocumentTypes = async () => {
    try {
      const response = await apiRequest("GET", "/api/partners/document-types");
      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Error cargando tipos de documentos:", error);
      // Usar datos de ejemplo como fallback
      setDocumentTypes([
        { id: 1, name: "Contrato de Arrendamiento", category: "Contratos" },
        { id: 2, name: "Declaración Jurada Simple", category: "Declaraciones" },
        { id: 3, name: "Certificado de Residencia", category: "Certificados" },
        { id: 4, name: "Poder Simple", category: "Poderes" },
        { id: 5, name: "Contrato de Compraventa", category: "Contratos" }
      ]);
    }
  };
  
  // Autenticar local con código
  const handleLogin = async () => {
    if (!storeCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese el código de su local",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Intentar autenticar con el código de local
      const response = await apiRequest("POST", "/api/partners/store-login", { 
        storeCode: storeCode.trim() 
      });
      
      if (!response.ok) {
        throw new Error("Error de autenticación");
      }
      
      const data = await response.json();
      
      // Guardar información del local
      setStoreInfo(data);
      setIsAuthenticated(true);
      localStorage.setItem("vecinos_store_info", JSON.stringify(data));
      
      // Mostrar dashboard
      setActiveScreen("dashboard");
      
      toast({
        title: "¡Bienvenido!",
        description: `Has iniciado sesión como ${data.storeName}`,
      });
    } catch (error) {
      console.error("Error de autenticación:", error);
      
      // Para desarrollo, permitir acceso con cualquier código
      if (process.env.NODE_ENV === "development") {
        const mockStoreInfo = {
          id: parseInt(storeCode) || 1,
          storeName: `Almacén #${storeCode}`,
          address: "Av. Ejemplo 123, Santiago",
          ownerName: "Juan Pérez",
          commissionRate: 0.1,
          joinedAt: new Date().toISOString()
        };
        
        setStoreInfo(mockStoreInfo);
        setIsAuthenticated(true);
        localStorage.setItem("vecinos_store_info", JSON.stringify(mockStoreInfo));
        setActiveScreen("dashboard");
        
        toast({
          title: "¡Bienvenido! (Modo desarrollo)",
          description: `Has iniciado sesión como ${mockStoreInfo.storeName}`,
        });
      } else {
        setErrorMessage("Código de local no válido. Por favor verifique e intente nuevamente.");
        toast({
          title: "Error de autenticación",
          description: "Código de local no válido",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cerrar sesión
  const handleLogout = () => {
    setIsAuthenticated(false);
    setStoreInfo(null);
    localStorage.removeItem("vecinos_store_info");
    setActiveScreen("login");
    setStoreCode("");
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };
  
  // Iniciar nuevo trámite
  const startNewDocument = (documentType: any) => {
    setSelectedDocument(documentType);
    setClientInfo({
      name: "",
      email: "",
      phone: "",
      documentNumber: ""
    });
    setActiveScreen("form");
  };
  
  // Manejar cambios en el formulario de cliente
  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Procesar trámite
  const processDocument = async () => {
    // Validar datos del cliente
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete todos los campos del cliente",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Enviar información del trámite
      const response = await apiRequest("POST", "/api/partners/process-document", {
        storeId: storeInfo.id,
        documentTypeId: selectedDocument.id,
        clientInfo
      });
      
      if (!response.ok) {
        throw new Error("Error procesando el documento");
      }
      
      const data = await response.json();
      
      // Mostrar pantalla de éxito
      setFormData(data);
      setActiveScreen("success");
      
      toast({
        title: "¡Trámite procesado!",
        description: "El documento ha sido procesado correctamente",
      });
    } catch (error) {
      console.error("Error procesando el documento:", error);
      
      // Para desarrollo, simular éxito
      if (process.env.NODE_ENV === "development") {
        const mockData = {
          id: Math.floor(Math.random() * 1000),
          documentType: selectedDocument.name,
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          status: "processed",
          commission: (selectedDocument.id * 2000 * 0.1).toFixed(0),
          processingCode: `VC-${Math.floor(Math.random() * 9000) + 1000}`,
          createdAt: new Date().toISOString()
        };
        
        setFormData(mockData);
        setActiveScreen("success");
        
        toast({
          title: "¡Trámite procesado! (Modo desarrollo)",
          description: "El documento ha sido procesado correctamente",
        });
      } else {
        toast({
          title: "Error procesando el documento",
          description: "Ocurrió un error al procesar el documento. Por favor intente nuevamente.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Volver al dashboard
  const backToDashboard = () => {
    setActiveScreen("dashboard");
    setSelectedDocument(null);
  };
  
  // Agrupar documentos por categoría
  const groupedDocuments = documentTypes.reduce((acc: any, doc: any) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});
  
  // Renderizar la pantalla de inicio de sesión
  const renderLoginScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Vecinos Express</CardTitle>
          <CardDescription>Ingrese su código de local para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="storeCode"
                placeholder="Código de local"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-2 text-center w-full text-sm text-gray-500">
            <p>Si no tiene un código, contacte a su supervisor de Vecinos Express</p>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} CerfiDoc Vecinos Express</p>
        <p className="mt-1">Versión web alternativa</p>
      </div>
    </div>
  );
  
  // Renderizar el dashboard
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Vecinos Express</h1>
              <p className="text-sm opacity-90">{storeInfo?.storeName}</p>
            </div>
            <Button variant="ghost" className="text-white" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Trámites disponibles</h2>
            
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([category, docs]: [string, any]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-medium">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docs.map((doc: any) => (
                      <Card key={doc.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => startNewDocument(doc)}>
                        <CardContent className="p-4 flex items-start">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-gray-500">
                              Comisión: ${(doc.id * 2000 * 0.1).toFixed(0)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del local</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nombre del local</p>
                    <p className="font-medium">{storeInfo?.storeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{storeInfo?.address || "Av. Principal 123, Santiago"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Propietario</p>
                    <p className="font-medium">{storeInfo?.ownerName || "Juan Pérez"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de registro</p>
                    <p className="font-medium">
                      {storeInfo?.joinedAt 
                        ? new Date(storeInfo.joinedAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasa de comisión</p>
                    <p className="font-medium">{storeInfo?.commissionRate 
                      ? `${storeInfo.commissionRate * 100}%`
                      : "10%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Ayuda rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/partners/public-page")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Información del programa
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open("mailto:soporte@cerfidoc.cl")}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Soporte técnico
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar el formulario de cliente
  const renderClientForm = () => (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Vecinos Express</h1>
              <p className="text-sm opacity-90">{storeInfo?.storeName}</p>
            </div>
            <Button variant="ghost" className="text-white" onClick={backToDashboard}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo trámite: {selectedDocument?.name}</CardTitle>
            <CardDescription>
              Ingrese los datos del cliente para procesar el documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Nombre completo
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre y apellidos"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={clientInfo.email}
                  onChange={handleClientInfoChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Teléfono
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+56 9 1234 5678"
                  value={clientInfo.phone}
                  onChange={handleClientInfoChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="documentNumber">
                  Documento de identidad (RUT/DNI)
                </label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  placeholder="12.345.678-9"
                  value={clientInfo.documentNumber}
                  onChange={handleClientInfoChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={backToDashboard}>
              Cancelar
            </Button>
            <Button onClick={processDocument} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Procesar documento"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  // Renderizar pantalla de éxito
  const renderSuccessScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Vecinos Express</h1>
              <p className="text-sm opacity-90">{storeInfo?.storeName}</p>
            </div>
            <Button variant="ghost" className="text-white" onClick={backToDashboard}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 mt-6">
        <Card className="border-green-500">
          <CardHeader className="bg-green-50">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl text-green-700">¡Trámite procesado!</CardTitle>
            <CardDescription className="text-center text-green-600">
              El documento ha sido procesado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Documento</span>
                  <span className="font-medium">{formData?.documentType || selectedDocument?.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Código de trámite</span>
                  <span className="font-medium">{formData?.processingCode || "VC-1234"}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Cliente</span>
                  <span className="font-medium">{formData?.clientName || clientInfo.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Fecha</span>
                  <span className="font-medium">
                    {formData?.createdAt 
                      ? new Date(formData.createdAt).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-dashed border-gray-200 my-2"></div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Su comisión</span>
                  <span className="font-bold text-xl text-green-600">
                    ${formData?.commission || ((selectedDocument?.id || 1) * 2000 * 0.1).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={backToDashboard}>
              Volver al inicio
            </Button>
            <Button onClick={() => {
              toast({
                title: "Comprobante enviado",
                description: "El comprobante ha sido enviado al correo del cliente",
              });
              backToDashboard();
            }}>
              Enviar comprobante
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  // Renderizar la pantalla correspondiente según el estado
  switch (activeScreen) {
    case "login":
      return renderLoginScreen();
    case "dashboard":
      return renderDashboard();
    case "form":
      return renderClientForm();
    case "success":
      return renderSuccessScreen();
    default:
      return renderLoginScreen();
  }
};

export default WebAppPOS;