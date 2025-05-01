import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/lib/route-utils";
import Sidebar from "@/components/dashboard/Sidebar";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import IdentityVerification from "@/components/dashboard/IdentityVerification";
import DocumentSignatureCanvas from "@/components/dashboard/DocumentSignatureCanvas";
import { DocumentETokenSignature } from "@/components/dashboard/DocumentETokenSignature";
import { VecinosETokenSignature } from "@/components/vecinos/VecinosETokenSignature";
import DocumentPayment from "@/components/dashboard/DocumentPayment";
import DocumentHistory from "@/components/dashboard/DocumentHistory";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Upload, 
  UserCheck, 
  FileSignature, 
  CheckCircle, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Download,
  ShieldCheck
} from "lucide-react";
import { Document, IdentityVerification as IdentityVerificationType } from "@shared/schema";

export default function DocumentSign() {
  const { user } = useAuth();
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Determine if this is a new document or editing an existing one
  const isNewDocument = id === "new";
  const documentId = isNewDocument ? null : parseInt(id);

  // Fetch document if editing
  const { data: document, isLoading: isDocumentLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId,
  });

  // Fetch identity verification if available
  const { data: verification, isLoading: isVerificationLoading } = useQuery<IdentityVerificationType>({
    queryKey: [`/api/identity-verification/${documentId}`],
    enabled: !!documentId,
  });

  // Set the active tab based on the document status
  useEffect(() => {
    if (document) {
      if (document.status === "signed") {
        setActiveTab("view");
      } else if (document.status === "validated" || (verification && verification.status === "approved")) {
        setActiveTab("sign");
      } else if (verification && verification.status === "pending") {
        setActiveTab("identity-pending");
      } else if (document.status === "pending" && !verification) {
        setActiveTab("identity");
      }
    } else if (isNewDocument) {
      setActiveTab("upload");
    }
  }, [document, verification, isNewDocument]);

  // Handle completion of steps
  const handleUploadComplete = (newDocumentId: number) => {
    setLocation(`/document-sign/${newDocumentId}`);
  };

  const handleVerificationComplete = () => {
    setActiveTab("identity-pending");
  };

  const handleSignatureComplete = () => {
    setLocation(`/user-dashboard`);
  };

  const isLoading = isDocumentLoading || isVerificationLoading;

  // Get document status label
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "pending":
        return "Pendiente de verificación";
      case "validated":
        return "Validado - Listo para firmar";
      case "signed":
        return "Firmado";
      case "rejected":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  // Format date helper
  const formatDate = (dateString?: Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/user-dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al dashboard
                </Button>
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {isNewDocument ? "Nuevo Documento" : 
               document?.status === "signed" ? "Documento Firmado" : 
               "Firmar Documento"}
            </h1>
            
            {!isNewDocument && document && (
              <div className="flex items-center mt-2">
                <span className="text-gray-500 mr-2">Estado:</span>
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                  document.status === "signed" ? "bg-green-100 text-green-800" :
                  document.status === "validated" ? "bg-blue-100 text-blue-800" :
                  document.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {getStatusLabel(document.status)}
                </span>
              </div>
            )}
          </header>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Document process tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Only show tabs for new document or appropriate status */}
                {(isNewDocument || document?.status !== "signed") && (
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="upload" disabled={!isNewDocument} className="gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Subir</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="identity" 
                      disabled={isNewDocument || (verification && verification.status !== "pending")} 
                      className="gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Identidad</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sign" 
                      disabled={isNewDocument || document?.status !== "validated"} 
                      className="gap-2"
                    >
                      <FileSignature className="h-4 w-4" />
                      <span>Firmar</span>
                    </TabsTrigger>
                  </TabsList>
                )}
  
                {/* Upload Document */}
                <TabsContent value="upload">
                  <DocumentUpload />
                </TabsContent>
  
                {/* Identity Verification */}
                <TabsContent value="identity">
                  {document && (
                    <IdentityVerification 
                      documentId={document.id} 
                      onVerificationComplete={handleVerificationComplete} 
                    />
                  )}
                </TabsContent>
  
                {/* Identity Verification Pending */}
                <TabsContent value="identity-pending">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        Verificación Enviada
                      </CardTitle>
                      <CardDescription>
                        Tu verificación de identidad ha sido enviada y está pendiente de revisión
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserCheck className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-blue-900 mb-2">Verificación en Proceso</h3>
                        <p className="text-blue-700 mb-4">
                          Un certificador revisará tu identidad para validarla. Este proceso puede tomar hasta 24 horas hábiles.
                        </p>
                        <div className="space-y-2 text-left text-sm mb-4">
                          <div className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-blue-700">
                              Verificación enviada: {formatDate(verification?.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-blue-700">
                              Documento: {document?.title}
                            </span>
                          </div>
                        </div>
                        <Link href="/user-dashboard">
                          <Button variant="outline">
                            Volver al Dashboard
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
  
                {/* Sign Document */}
                <TabsContent value="sign" id="document-sign-section">
                  {document && (
                    <div className="space-y-6">
                      {/* Opciones de firma */}
                      <Tabs defaultValue="simple" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="simple" className="text-sm">Firma Simple</TabsTrigger>
                          <TabsTrigger value="advanced" className="text-sm">Firma Avanzada</TabsTrigger>
                          <TabsTrigger value="etoken" className="text-sm">Firma con eToken</TabsTrigger>
                        </TabsList>
                        
                        {/* Firma Simple (usando el canvas existente) */}
                        <TabsContent value="simple">
                          <DocumentSignatureCanvas 
                            document={document} 
                            onSignatureComplete={handleSignatureComplete} 
                          />
                        </TabsContent>

                        {/* Firma Avanzada - Pendiente de implementación */}
                        <TabsContent value="advanced">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                                Firma Electrónica Avanzada
                              </CardTitle>
                              <CardDescription>
                                Firma con estampado de tiempo certificado y validez legal plena
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center">
                                <p className="text-yellow-700 mb-4">
                                  La firma avanzada está disponible para usuarios con plan premium.
                                </p>
                                <Button variant="outline">
                                  Actualizar a Plan Premium
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Firma con eToken */}
                        <TabsContent value="etoken">
                          {/* Determinar si estamos en contexto Vecinos o NotaryPro */}
                          {location.includes('/vecinos') ? (
                            // Contexto de Vecinos Xpress
                            <VecinosETokenSignature 
                              documentId={document.id.toString()}
                              documentHash={document.id.toString()} // Usamos el ID como hash temporal
                              onSigningComplete={(signatureData) => {
                                // Procesar y guardar la firma
                                // En un caso real, aquí se enviaría al backend
                                console.log("Documento firmado en Vecinos:", signatureData);
                                handleSignatureComplete();
                              }}
                              onCancel={() => setActiveTab("upload")}
                            />
                          ) : (
                            // Contexto regular de NotaryPro
                            <DocumentETokenSignature 
                              documentId={document.id}
                              documentTitle={document.title}
                              onComplete={handleSignatureComplete}
                            />
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </TabsContent>
  
                {/* View Signed Document */}
                <TabsContent value="view">
                  {document?.status === "signed" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-2" />
                          Documento Firmado
                        </CardTitle>
                        <CardDescription>
                          Este documento ha sido firmado electrónicamente y tiene validez legal
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-green-900 mb-2">¡Documento Firmado con Éxito!</h3>
                          <p className="text-green-700 mb-4">
                            Tu documento ha sido firmado electrónicamente y está disponible para su descarga.
                          </p>
                          <div className="space-y-2 text-left text-sm mb-4">
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-green-700">
                                Título: {document.title}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-green-700">
                                Fecha de firma: {formatDate(document.updatedAt)}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-green-700">
                                Tipo de firma: {document.certifierId ? "Avanzada" : "Simple"}
                              </span>
                            </div>
                          </div>
                          <Button className="bg-primary hover:bg-primary/90">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Documento Firmado
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
  
                {/* Rejected Document */}
                <TabsContent value="rejected">
                  {document?.status === "rejected" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-red-600">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Verificación Rechazada
                        </CardTitle>
                        <CardDescription>
                          La verificación de identidad fue rechazada por el certificador
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-red-900 mb-4">Motivo del rechazo</h3>
                          <p className="text-red-700 mb-6">
                            {verification?.notes || "No se proporcionó motivo específico. Por favor, intenta nuevamente con una verificación de identidad más clara."}
                          </p>
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => setActiveTab("identity")}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Intentar nuevamente
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
