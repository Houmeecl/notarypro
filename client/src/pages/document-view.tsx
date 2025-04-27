import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, FileText, Download, Check, X, Pen } from "lucide-react";
import { Document } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Borrador</Badge>;
    case "pending":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "validated":
      return <Badge variant="success">Validado</Badge>;
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
  const [, params] = useRoute("/documents/:documentId");
  const documentId = params?.documentId;
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ['/api/documents', documentId],
    enabled: !!documentId,
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
      // En un escenario real, aquí haríamos una petición para obtener el HTML renderizado
      // Por ahora, simularemos el HTML usando la información del documento
      const mockHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">${document.title}</h1>
          <div style="margin-top: 20px;">
            <p>Este es el contenido del documento basado en la plantilla seleccionada.</p>
            <p>Los datos del formulario se insertarían aquí formateados según la plantilla.</p>
            <p>Estado actual: <strong>${document.status}</strong></p>
            ${document.certifierId ? '<p>Certificado por un notario autorizado.</p>' : ''}
            ${document.signatureData ? '<p>Este documento ha sido firmado electrónicamente.</p>' : ''}
          </div>
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="font-size: 12px; color: #666;">Documento generado el ${new Date(document.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>
      `;
      
      setPreviewHtml(mockHtml);
    }
  }, [document]);

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

  const handleSign = () => {
    // En un escenario real, aquí se abriría un canvas para que el usuario dibuje su firma
    // Por ahora, simplemente enviaremos una cadena que representa la firma
    const mockSignatureData = `data:image/svg+xml;base64,${btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M10,25 C20,10 30,40 40,25 C50,10 60,40 70,25 C80,10 90,40 100,25 C110,10 120,40 130,25 C140,10 150,40 160,25 C170,10 180,40 190,25" fill="none" stroke="black" stroke-width="2"/></svg>'
    )}`;
    
    signDocumentMutation.mutate(mockSignatureData);
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
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Documento no encontrado</h2>
          <p className="text-gray-500 mb-6">El documento solicitado no existe o no tiene acceso a él.</p>
          <Link href="/document-categories">
            <Button>Ver categorías de documentos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link href="/documents">
        <a className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis documentos
        </a>
      </Link>

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
  );
}