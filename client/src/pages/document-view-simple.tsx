import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DocumentNavbar from "@/components/layout/DocumentNavbar";

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

export default function DocumentViewSimplePage() {
  const [, params] = useRoute("/document-view/:documentId");
  const documentId = params?.documentId;
  const [document, setDocument] = useState<Document | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Para documentos generados dinámicamente, creamos un documento mock
  useEffect(() => {
    if (documentId) {
      const isDynamicDocument = documentId.startsWith('doc-');
      
      if (isDynamicDocument) {
        // Crear un documento mock para visualización inmediata
        const mockDoc: Document = {
          id: Number(documentId.split('-')[2]) || 999,
          title: "Documento generado dinámicamente",
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
        
        setDocument(mockDoc);
        const html = renderDocument(mockDoc);
        setPreviewHtml(html);
        setLoading(false);
      } else {
        // Aquí iría la carga real del documento desde el servidor
        // De momento, usamos un mock también
        const mockApiDoc: Document = {
          id: parseInt(documentId) || 1,
          title: "Documento desde API",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          formData: JSON.stringify({
            "Nombre completo": "Juan Pérez Rodríguez",
            "Número de documento": "12.345.678-9",
            "Dirección": "Los Olivos 567, Concepción, Chile",
            "Tipo de documento": "Poder Simple"
          })
        };
        
        setDocument(mockApiDoc);
        const html = renderDocument(mockApiDoc);
        setPreviewHtml(html);
        setLoading(false);
      }
    }
  }, [documentId]);
  
  // Función para renderizar el documento en HTML
  const renderDocument = (doc: Document) => {
    // Recuperar datos del formulario si existen
    const formData = doc.formData ? 
      JSON.parse(typeof doc.formData === 'string' ? doc.formData : JSON.stringify(doc.formData)) : 
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
          <div>Fecha: ${new Date(doc.createdAt).toLocaleDateString()}</div>
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
            <p style="font-size: 14px; color: #333;">${new Date(doc.updatedAt).toLocaleDateString()}</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="ml-3">Cargando documento...</p>
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
            <Link href="/documents">
              <Button>Volver a mis documentos</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DocumentNavbar />
      <div className="container mx-auto py-8">
        <Link href="/documents" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis documentos
        </Link>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{document.title}</CardTitle>
                {getStatusBadge(document.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Documento creado el {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div 
                className="border rounded-md p-4 bg-white min-h-[500px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}