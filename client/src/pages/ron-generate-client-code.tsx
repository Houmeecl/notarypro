/**
 * PÁGINA PARA GENERAR CÓDIGOS DE CLIENTE RON
 * Interfaz para que certificadores generen códigos de acceso para clientes
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  QrCode, 
  Key, 
  Send, 
  Copy, 
  Download,
  Mail,
  MessageSquare,
  Phone,
  ExternalLink,
  Clock,
  User,
  FileText,
  ArrowLeft,
  CheckCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GeneratedAccess {
  accessCode: string;
  qrCode: string;
  directUrl: string;
  embedUrl: string;
  smsMessage: string;
  emailContent: string;
  whatsappMessage: string;
  instructions: string[];
}

interface Document {
  id: number;
  title: string;
  documentType: string;
  status: string;
  userName: string;
  userEmail: string;
  userId: number;
}

export default function RonGenerateClientCode() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [sessionType, setSessionType] = useState<'jitsi' | 'agora'>('jitsi');
  const [scheduledAt, setScheduledAt] = useState('');
  const [generatedAccess, setGeneratedAccess] = useState<GeneratedAccess | null>(null);
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [recipient, setRecipient] = useState('');

  // Obtener documentos pendientes
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/real-certifier/pending-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/real-certifier/pending-documents?limit=50');
      return response.documents || [];
    }
  });

  // Mutación para generar código
  const generateCodeMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      clientId: number;
      documentId: number;
      sessionType: 'jitsi' | 'agora';
    }) => {
      return apiRequest('POST', '/api/ron-client/generate-access', data);
    },
    onSuccess: (data) => {
      setGeneratedAccess(data.access);
      setRecipient(selectedDocument?.userEmail || '');
      toast({
        title: "Código generado",
        description: "Código de acceso creado exitosamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al generar código",
        variant: "destructive"
      });
    }
  });

  // Mutación para enviar código
  const sendCodeMutation = useMutation({
    mutationFn: async (data: {
      accessCode: string;
      method: string;
      recipient: string;
    }) => {
      return apiRequest('POST', '/api/ron-client/send-access', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Código enviado",
        description: data.message
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al enviar código",
        variant: "destructive"
      });
    }
  });

  const handleGenerateCode = () => {
    if (!selectedDocument || !scheduledAt) {
      toast({
        title: "Datos incompletos",
        description: "Seleccione un documento y fecha de sesión",
        variant: "destructive"
      });
      return;
    }

    // Generar ID de sesión único
    const sessionId = `JITSI-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    generateCodeMutation.mutate({
      sessionId,
      clientId: selectedDocument.userId,
      documentId: selectedDocument.id,
      sessionType
    });
  };

  const handleSendCode = () => {
    if (!generatedAccess || !recipient) {
      toast({
        title: "Datos incompletos",
        description: "Complete el destinatario",
        variant: "destructive"
      });
      return;
    }

    sendCodeMutation.mutate({
      accessCode: generatedAccess.accessCode,
      method: sendMethod,
      recipient
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`
    });
  };

  const downloadQR = () => {
    if (!generatedAccess) return;

    const link = document.createElement('a');
    link.download = `QR-RON-${generatedAccess.accessCode}.png`;
    link.href = generatedAccess.qrCode;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/certifier-dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Generar Código de Cliente RON
                </h1>
                <p className="text-gray-600">
                  Crear códigos de acceso para clientes - Certificador: {user?.fullName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de generación */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Configurar Sesión RON
                </CardTitle>
                <CardDescription>
                  Seleccione el documento y configure la sesión
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selección de documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento a Certificar
                  </label>
                  <Select
                    value={selectedDocument?.id.toString() || ''}
                    onValueChange={(value) => {
                      const doc = documents?.find(d => d.id.toString() === value);
                      setSelectedDocument(doc || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar documento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documents?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{doc.title}</span>
                            <span className="text-xs text-gray-500">
                              Cliente: {doc.userName} | Tipo: {doc.documentType}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Información del documento seleccionado */}
                {selectedDocument && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Documento Seleccionado:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Título:</strong> {selectedDocument.title}</p>
                      <p><strong>Tipo:</strong> {selectedDocument.documentType}</p>
                      <p><strong>Cliente:</strong> {selectedDocument.userName}</p>
                      <p><strong>Email:</strong> {selectedDocument.userEmail}</p>
                      <Badge variant="outline">{selectedDocument.status}</Badge>
                    </div>
                  </div>
                )}

                {/* Tipo de sesión */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Videollamada
                  </label>
                  <Select value={sessionType} onValueChange={(value: 'jitsi' | 'agora') => setSessionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jitsi">
                        <div className="flex items-center">
                          <Video className="mr-2 h-4 w-4 text-green-600" />
                          Jitsi Meet (Recomendado - Gratis)
                        </div>
                      </SelectItem>
                      <SelectItem value="agora">
                        <div className="flex items-center">
                          <Video className="mr-2 h-4 w-4 text-blue-600" />
                          Agora (Empresarial)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha programada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora Programada
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Botón generar */}
                <Button
                  onClick={handleGenerateCode}
                  disabled={!selectedDocument || !scheduledAt || generateCodeMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {generateCodeMutation.isPending ? 'Generando...' : 'Generar Código de Acceso'}
                  <Key className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Panel de resultado */}
          <div className="space-y-6">
            {generatedAccess ? (
              <>
                {/* Código generado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Código Generado Exitosamente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      {/* Código QR */}
                      <div>
                        <img 
                          src={generatedAccess.qrCode} 
                          alt="Código QR RON"
                          className="mx-auto border rounded-lg"
                        />
                        <div className="mt-2 space-x-2">
                          <Button variant="outline" size="sm" onClick={downloadQR}>
                            <Download className="mr-1 h-3 w-3" />
                            Descargar QR
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(generatedAccess.qrCode, 'Código QR')}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      {/* Código de acceso */}
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Código de Acceso:</p>
                        <p className="text-2xl font-mono font-bold text-blue-600">
                          {generatedAccess.accessCode}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(generatedAccess.accessCode, 'Código')}
                          className="mt-2"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Copiar Código
                        </Button>
                      </div>

                      {/* URL directa */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">URL de Acceso Directo:</p>
                        <p className="text-sm font-mono break-all text-blue-800">
                          {generatedAccess.directUrl}
                        </p>
                        <div className="mt-2 space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(generatedAccess.directUrl, 'URL')}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copiar URL
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(generatedAccess.directUrl, '_blank')}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Probar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Envío de código */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Send className="mr-2 h-5 w-5" />
                      Enviar al Cliente
                    </CardTitle>
                    <CardDescription>
                      Envíe el código de acceso al cliente por su medio preferido
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={sendMethod} onValueChange={(value: any) => setSendMethod(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="email">
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </TabsTrigger>
                        <TabsTrigger value="sms">
                          <Phone className="mr-1 h-3 w-3" />
                          SMS
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          WhatsApp
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="email" className="space-y-3">
                        <Input
                          type="email"
                          placeholder="email@cliente.com"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                        />
                        <Textarea
                          value={generatedAccess.emailContent}
                          readOnly
                          rows={4}
                          className="text-xs"
                        />
                        <Button 
                          onClick={handleSendCode}
                          disabled={!recipient || sendCodeMutation.isPending}
                          className="w-full"
                        >
                          {sendCodeMutation.isPending ? 'Enviando...' : 'Enviar por Email'}
                        </Button>
                      </TabsContent>

                      <TabsContent value="sms" className="space-y-3">
                        <Input
                          placeholder="+56912345678"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                        />
                        <Textarea
                          value={generatedAccess.smsMessage}
                          readOnly
                          rows={3}
                          className="text-xs"
                        />
                        <Button 
                          onClick={handleSendCode}
                          disabled={!recipient || sendCodeMutation.isPending}
                          className="w-full"
                        >
                          {sendCodeMutation.isPending ? 'Enviando...' : 'Enviar por SMS'}
                        </Button>
                      </TabsContent>

                      <TabsContent value="whatsapp" className="space-y-3">
                        <Input
                          placeholder="+56912345678"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                        />
                        <Textarea
                          value={generatedAccess.whatsappMessage}
                          readOnly
                          rows={4}
                          className="text-xs"
                        />
                        <Button 
                          onClick={handleSendCode}
                          disabled={!recipient || sendCodeMutation.isPending}
                          className="w-full"
                        >
                          {sendCodeMutation.isPending ? 'Enviando...' : 'Enviar por WhatsApp'}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Instrucciones para el cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle>Instrucciones para el Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedAccess.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Placeholder cuando no hay código generado */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="mr-2 h-5 w-5" />
                    Código de Acceso
                  </CardTitle>
                  <CardDescription>
                    El código de acceso aparecerá aquí una vez generado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Seleccione un documento y genere el código de acceso
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Jitsi Meet</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Gratis y sin límites</li>
                    <li>• Grabación incluida</li>
                    <li>• Chat y pizarra</li>
                    <li>• Compatible con móviles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seguridad</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Encriptación E2E</li>
                    <li>• Salas privadas únicas</li>
                    <li>• Códigos con expiración</li>
                    <li>• Auditoría completa</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Conforme Ley 19.799</li>
                    <li>• Grabación obligatoria</li>
                    <li>• Certificación digital</li>
                    <li>• Validez legal completa</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}