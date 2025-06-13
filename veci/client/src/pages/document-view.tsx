import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Loader2, Download, Check, X, Pen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import SignatureCanvas from "@/components/document/SignatureCanvas";
import TranslationWidget from "@/components/document/TranslationWidget";
import { PageNavigation } from "@/components/navigation/PageNavigation";

// Definición simple para el componente
interface Document {
  id: number;
  title: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  certifierId?: number | null;
  signatureData?: string | null;
  formData?: any;
  rejectionReason?: string | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Borrador</Badge>;
    case "pending":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "validated":
      return <Badge className="bg-green-500 hover:bg-green-600">Validado</Badge>;
    case "signed":
      return <Badge variant="default">Firmado</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rechazado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function DocumentViewPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/document-view/:documentId");
  const documentId = params?.documentId;
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Para documentos generados dinámicamente, creamos un documento mock si tiene el formato doc-timestamp-random
  const isDynamicDocument = documentId?.startsWith('doc-');
  
  // Crear un documento mock para documentos generados dinámicamente
  const mockDocument = isDynamicDocument ? {
    id: Number(documentId?.split('-')[2]) || 999,
    title: "Documento generado dinámicamente",
    content: "Contenido del documento generado",
    status: "pending",
    userId: 1,
    templateId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    filePath: null,
    pdfPath: null,
    qrCode: null,
    certifierId: null,
    formData: JSON.stringify({
      "Nombre completo": "María González Fuentes",
      "Número de documento": "16.782.453-K",
      "Dirección": "Av. Providencia 1234, Santiago, Chile",
      "Tipo de documento": "Contrato Compraventa"
    }),
    signatureData: null,
    reference: documentId,
    rejectionReason: null
  } : undefined;
  
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ['/api/documents', documentId],
    enabled: !!documentId && !isDynamicDocument,
    initialData: mockDocument
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el documento.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (document) {
      // Para documentos dinámicos, generar vista directo con renderFallbackDocument
      // Para documentos del API, intentar obtener vista HTML del servidor
      const fetchDocumentHtml = async () => {
        // Si es un documento dinámico, usar directamente el renderizador local
        if (isDynamicDocument) {
          const fallbackHtml = renderFallbackDocument(document);
          setPreviewHtml(fallbackHtml);
          return;
        }
        
        try {
          const response = await apiRequest(
            "GET", 
            `/api/documents/${document.id}/preview`, 
            null,
            { responseType: "text", headers: { "Accept": "text/html" } }
          );
          
          if (response.ok) {
            const htmlContent = await response.text();
            setPreviewHtml(htmlContent);
          } else {
            // Fallback en caso de error
            const fallbackHtml = renderFallbackDocument(document);
            setPreviewHtml(fallbackHtml);
            
            toast({
              title: "Advertencia",
              description: "No se pudo cargar la vista previa del documento. Mostrando versión simplificada."
            });
          }
        } catch (error) {
          console.error("Error al obtener la vista previa del documento:", error);
          // Fallback en caso de error
          const fallbackHtml = renderFallbackDocument(document);
          setPreviewHtml(fallbackHtml);
        }
      };
      
      fetchDocumentHtml();
    }
  }, [document, toast]);
  
  // Función para renderizar una versión fallback del documento
  const renderFallbackDocument = (doc: Document) => {
    // Recuperar datos del formulario si existen
    const formData = doc.formData ? 
      JSON.parse(typeof doc.formData === 'string' ? doc.formData : JSON.stringify(doc.formData)) : 
      {};
    
    // Generar HTML con los datos del formulario
    const formDataHtml = Object.entries(formData)
      .map(([key, value]) => `
        <div style="margin-bottom: 15px;">
          <strong style="display: block; margin-bottom: 5px; color: #555;">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
          <div style="padding: 8px; background-color: #f9f9f9; border-radius: 4px; border: 1px solid #eee;">${value}</div>
        </div>
      `)
      .join('');
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: right; margin-bottom: 20px; color: #666; font-size: 14px;">
          <div>Ref: ${doc.id}</div>
          <div>Fecha: ${new Date(doc.createdAt || '').toLocaleDateString()}</div>
        </div>
        
        <h1 style="color: #333; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 25px;">${doc.title}</h1>
        
        <div style="margin: 30px 0; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #444; font-size: 18px; margin-bottom: 20px;">Información del Documento</h2>
          ${formDataHtml || '<p style="color: #666;">No hay datos disponibles para este documento.</p>'}
        </div>
        
        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Estado: <strong style="color: #333;">${doc.status}</strong></p>
            ${doc.certifierId ? '<p style="font-size: 14px; color: #666;">Certificado por un notario autorizado.</p>' : ''}
          </div>
          
          ${doc.signatureData ? `
          <div style="border: 1px dashed #ccc; padding: 10px; text-align: center;">
            <p style="font-size: 12px; color: #666; margin-bottom: 5px;">Firmado electrónicamente el</p>
            <p style="font-size: 14px; color: #333;">${new Date(doc.updatedAt || '').toLocaleDateString()}</p>
          </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 40px; text-align: center;">
          <p style="font-size: 12px; color: #999;">Este documento es una representación digital del original.</p>
          <p style="font-size: 12px; color: #999;">Generado por Vecinos NotaryPro el ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
  };

  const signDocumentMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      if (!document || !documentId) throw new Error("Documento no disponible");
      
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, {
        signatureData,
        type: "simple"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documento firmado",
        description: "El documento ha sido firmado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents', documentId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo firmar el documento.",
        variant: "destructive",
      });
    }
  });

  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const handleSignatureComplete = (signatureDataUrl: string) => {
    setSignatureData(signatureDataUrl);
    setIsSignatureDialogOpen(false);
    
    // Enviar la firma al servidor
    signDocumentMutation.mutate(signatureDataUrl);
  };
  
  const handleSign = () => {
    setIsSignatureDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">Cargando documento...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <>
        <DocumentNavbar />
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Documento no encontrado</h2>
            <p className="text-gray-500 mb-6">El documento solicitado no existe o no tiene acceso a él.</p>
            <Link href="/document-categories">
              <Button>Ver categorías de documentos</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Definir las migas de pan para navegación
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Mis Documentos', href: '/documents' },
    { label: document.title, href: `/document-view/${documentId}` },
  ];
  
  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        {/* Componente de navegación con migas de pan y botón de volver */}
        <PageNavigation 
          items={breadcrumbItems} 
          backTo="/documents"
          backLabel="Volver a mis documentos"
          className="mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">{document.title}</CardTitle>
                  {getStatusBadge(document.status)}
                </div>
                <CardDescription>
                  Documento creado el {new Date(document.createdAt || '').toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div 
                  className="border rounded-md p-4 bg-white min-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                <div className="mt-4">
                  <TranslationWidget 
                    content={previewHtml}
                    onTranslationComplete={(translatedContent) => setPreviewHtml(translatedContent)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                
                {document.status !== "signed" && (
                  <Button onClick={handleSign} disabled={signDocumentMutation.isPending}>
                    {signDocumentMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Firmando...</>
                    ) : (
                      <><Pen className="mr-2 h-4 w-4" /> Firmar documento</>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Componente de firma digital */}
            {isSignatureDialogOpen && (
              <SignatureCanvas 
                isOpen={isSignatureDialogOpen}
                onClose={() => setIsSignatureDialogOpen(false)}
                onComplete={handleSignatureComplete}
              />
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Estado del documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generado</span>
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validado</span>
                    {document.status === "validated" || document.status === "signed" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : document.status === "rejected" ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="text-sm text-muted-foreground">Pendiente</div>
                    )}
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Firmado</span>
                    {document.status === "signed" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="text-sm text-muted-foreground">Pendiente</div>
                    )}
                  </div>
                </div>
                
                {document.status === "rejected" && document.rejectionReason && (
                  <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="font-semibold text-red-900 text-sm">Motivo de rechazo:</h4>
                    <p className="text-sm text-red-800 mt-1">{document.rejectionReason}</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Verificación de identidad</h4>
                  {document.status === "pending" || document.status === "draft" ? (
                    <Button variant="outline" className="w-full" size="sm">
                      Verificar identidad
                    </Button>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Identidad verificada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Descargar PDF
                </Button>
                
                {document.status === "signed" && (
                  <Button variant="outline" className="w-full" size="sm">
                    Compartir documento
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" size="sm">
                  Ver historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}