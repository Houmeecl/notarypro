import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DocumentNavbar from "@/components/layout/DocumentNavbar";
import { PageNavigation } from "@/components/navigation/PageNavigation";

// Definición simple para el componente
interface Document {
  id: number;
  title: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  formData?: any;
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

export default function DocumentViewSimplePage() {
  const [, params] = useRoute("/document-view-simple/:documentId");
  const documentId = params?.documentId;
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Para documentos generados dinámicamente, creamos un documento si tiene el formato doc-timestamp-random
  const isDynamicDocument = documentId?.startsWith('doc-');
  
  useEffect(() => {
    const initializeDocument = async () => {
      setIsLoading(true);
      
      try {
        if (isDynamicDocument) {
          // Para documentos generados dinámicamente, creamos un documento simulado
          const mockDocument = {
            id: Number(documentId?.split('-')[2]) || 999,
            title: "Documento generado dinámicamente",
            content: "Contenido del documento generado",
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
            formData: JSON.stringify({
              "Nombre completo": "María González Fuentes",
              "Número de documento": "16.782.453-K",
              "Dirección": "Av. Providencia 1234, Santiago, Chile",
              "Tipo de documento": "Contrato Compraventa"
            })
          };
          
          setDocument(mockDocument);
          const html = renderDocument(mockDocument);
          setPreviewHtml(html);
        } else {
          // Aquí se haría la llamada a la API para obtener el documento real
          // Por simplicidad, usamos un documento de ejemplo
          const demoDocument = {
            id: Number(documentId) || 1,
            title: "Documento de Ejemplo",
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
            formData: JSON.stringify({
              "Nombre completo": "Juan Pérez Silva",
              "Número de documento": "12.345.678-9",
              "Dirección": "Calle Los Olivos 123, Santiago, Chile",
              "Tipo de documento": "Declaración Jurada"
            })
          };
          
          setDocument(demoDocument);
          const html = renderDocument(demoDocument);
          setPreviewHtml(html);
        }
      } catch (error) {
        console.error("Error al cargar el documento:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (documentId) {
      initializeDocument();
    }
  }, [documentId, isDynamicDocument]);
  
  // Función para renderizar una versión del documento
  const renderDocument = (doc: Document) => {
    // Recuperar datos del formulario si existen
    const formData = doc.formData ? 
      (typeof doc.formData === 'string' ? JSON.parse(doc.formData) : doc.formData) : 
      {};
    
    // Generar HTML con los datos del formulario
    const formDataHtml = Object.entries(formData)
      .map(([key, value]) => `
        <div style="margin-bottom: 15px;">
          <strong style="display: block; margin-bottom: 5px; color: #555;">${key}</strong>
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
        
        <div style="margin-top: 40px; text-align: center;">
          <p style="font-size: 12px; color: #999;">Este documento es una representación digital del original.</p>
          <p style="font-size: 12px; color: #999;">Generado por NotaryPro el ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
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
    { label: 'Documentos', href: '/documents' },
    { label: document.title, href: `/document-view-simple/${documentId}` },
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

        <Card className="mx-auto max-w-3xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{document.title}</CardTitle>
              {getStatusBadge(document.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Documento creado el {new Date(document.createdAt || '').toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="border rounded-md p-4 bg-white min-h-[500px]"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            
            <div className="flex justify-between mt-6">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}