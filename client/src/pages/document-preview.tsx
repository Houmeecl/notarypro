/**
 * PÁGINA DE VISTA PRELIMINAR DE DOCUMENTOS
 * Permite a clientes ver y firmar documentos enviados por certificadores
 */

import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit3,
  CheckCircle, 
  AlertTriangle,
  Clock,
  User,
  Shield,
  Send,
  ArrowLeft,
  ExternalLink,
  Printer,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentPreview {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentSignature {
  id: string;
  signerType: 'client' | 'certifier';
  signedAt: string;
  signerInfo: any;
}

interface PreviewData {
  document: DocumentPreview;
  signatures: DocumentSignature[];
  canSign: boolean;
  previewData: {
    accessToken: string;
    signatureUrl: string;
    downloadUrl?: string;
  };
}

export default function DocumentPreview() {
  const [match, params] = useRoute('/document-preview/:documentId');
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const documentId = params?.documentId || '';
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  
  const [activeTab, setActiveTab] = useState('preview');
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [signerInfo, setSignerInfo] = useState({
    name: '',
    email: '',
    rut: ''
  });

  // Obtener vista preliminar del documento
  const { data: previewData, isLoading, refetch } = useQuery<PreviewData>({
    queryKey: [`/api/identity/document/${documentId}/preview`, token],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/identity/document/${documentId}/preview?token=${token}`);
      return response;
    },
    enabled: !!documentId && !!token
  });

  // Firmar documento
  const signDocumentMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      return apiRequest('POST', `/api/identity/sign-document/${documentId}`, {
        signatureToken: token,
        signatureImage: signatureData,
        signerType: 'client',
        signerInfo: {
          name: signerInfo.name,
          email: signerInfo.email,
          rut: signerInfo.rut,
          timestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Documento firmado",
        description: "Su firma ha sido registrada exitosamente"
      });
      setShowSignatureCanvas(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al firmar documento",
        variant: "destructive"
      });
    }
  });

  // Descargar documento
  const downloadDocument = () => {
    if (previewData?.previewData.downloadUrl) {
      window.open(previewData.previewData.downloadUrl, '_blank');
    } else {
      toast({
        title: "Documento no disponible",
        description: "El documento aún no está listo para descarga",
        variant: "destructive"
      });
    }
  };

  // Manejar firma
  const handleSignature = (signatureData: string) => {
    if (!signerInfo.name || !signerInfo.email) {
      toast({
        title: "Información incompleta",
        description: "Por favor, complete sus datos antes de firmar",
        variant: "destructive"
      });
      return;
    }
    
    signDocumentMutation.mutate(signatureData);
  };

  // Verificar si el token es válido
  useEffect(() => {
    if (!token && documentId) {
      toast({
        title: "Acceso denegado",
        description: "Se requiere un token de acceso válido",
        variant: "destructive"
      });
      setLocation('/');
    }
  }, [token, documentId, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Cargando documento...</p>
            <p className="text-sm text-gray-600">Verificando acceso y obteniendo vista preliminar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold text-red-900">Acceso Denegado</p>
            <p className="text-sm text-red-700">
              No se pudo acceder al documento. El enlace puede haber expirado.
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="mt-4"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const document = previewData.document;
  const signatures = previewData.signatures;
  const canSign = previewData.canSign;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Vista Preliminar de Documento
                </h1>
                <p className="text-gray-600">
                  {document.title} | ID: {document.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={document.status === 'completed' ? 'default' : 'secondary'}
                className={
                  document.status === 'completed' ? 'bg-green-100 text-green-800' :
                  document.status === 'pending_signature' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {document.status === 'completed' ? 'Completado' :
                 document.status === 'pending_signature' ? 'Pendiente de Firma' :
                 document.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Vista Preliminar</TabsTrigger>
                <TabsTrigger value="signature">Firmar</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              {/* Tab: Vista Preliminar */}
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      {document.title}
                    </CardTitle>
                    <CardDescription>
                      Documento generado el {format(new Date(document.createdAt), 'PPp', { locale: es })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Vista preliminar del documento */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Vista Preliminar del Documento</h3>
                      <p className="text-gray-600 mb-4">
                        El documento se mostraría aquí en una implementación completa
                      </p>
                      <div className="space-x-2">
                        <Button variant="outline" onClick={downloadDocument}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Completo
                        </Button>
                        <Button variant="outline" onClick={downloadDocument}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir en Nueva Ventana
                        </Button>
                      </div>
                    </div>

                    {/* Información del documento */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Información del Documento</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          <p><strong>Título:</strong> {document.title}</p>
                          <p><strong>Estado:</strong> {document.status}</p>
                          <p><strong>Creado:</strong> {format(new Date(document.createdAt), 'PPp', { locale: es })}</p>
                          <p><strong>Actualizado:</strong> {format(new Date(document.updatedAt), 'PPp', { locale: es })}</p>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Estado de Firmas</h4>
                        <div className="space-y-2">
                          {signatures.map((sig, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-green-800">
                                {sig.signerType === 'client' ? 'Cliente' : 'Certificador'} firmó el {format(new Date(sig.signedAt), 'PPp', { locale: es })}
                              </span>
                            </div>
                          ))}
                          {canSign && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                              <span className="text-yellow-800">Pendiente su firma</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Firmar */}
              <TabsContent value="signature" className="space-y-4">
                {canSign ? (
                  <div className="space-y-4">
                    {/* Información del firmante */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Información del Firmante</CardTitle>
                        <CardDescription>
                          Complete sus datos para proceder con la firma digital
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre Completo *
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Juan Pérez González"
                              value={signerInfo.name}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="juan@email.com"
                              value={signerInfo.email}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              RUT
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="12.345.678-9"
                              value={signerInfo.rut}
                              onChange={(e) => setSignerInfo(prev => ({ ...prev, rut: e.target.value }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Canvas de firma */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Firma Digital</CardTitle>
                        <CardDescription>
                          Firme el documento usando el canvas digital
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {showSignatureCanvas ? (
                          <SignatureCanvas
                            onSignatureComplete={handleSignature}
                            signerName={signerInfo.name}
                            documentTitle={document.title}
                            width={600}
                            height={200}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Edit3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold mb-2">
                              Listo para Firmar
                            </p>
                            <p className="text-gray-600 mb-4">
                              Complete sus datos arriba y haga clic para abrir el canvas de firma
                            </p>
                            <Button
                              onClick={() => setShowSignatureCanvas(true)}
                              disabled={!signerInfo.name || !signerInfo.email}
                              size="lg"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Abrir Canvas de Firma
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-semibold text-green-900 mb-2">
                        Documento Ya Firmado
                      </p>
                      <p className="text-green-700">
                        Este documento ya ha sido firmado o no requiere su firma en este momento.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Historial */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial del Documento</CardTitle>
                    <CardDescription>
                      Cronología de eventos y firmas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold">Documento creado</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(document.createdAt), 'PPp', { locale: es })}
                          </p>
                        </div>
                      </div>

                      {signatures.map((sig, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-semibold">
                              Firmado por {sig.signerType === 'client' ? 'Cliente' : 'Certificador'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(sig.signedAt), 'PPp', { locale: es })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {document.status === 'completed' && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-semibold">Documento completado</p>
                            <p className="text-sm text-gray-600">
                              Todas las firmas requeridas han sido completadas
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={downloadDocument}
                  disabled={!previewData.previewData.downloadUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.share?.({
                      title: document.title,
                      text: 'Documento NotaryPro',
                      url: window.location.href
                    });
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </CardContent>
            </Card>

            {/* Información de seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Documento protegido con encriptación</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Firmas digitales con validez legal</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cumple con Ley 19.799</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Auditoría completa registrada</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soporte */}
            <Card>
              <CardHeader>
                <CardTitle>¿Necesita Ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Soporte: +56 2 2345 6789</span>
                  </div>
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2 text-blue-600" />
                    <span>soporte@notarypro.cl</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}