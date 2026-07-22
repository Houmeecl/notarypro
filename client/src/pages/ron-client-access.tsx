/**
 * PÁGINA DE ACCESO DE CLIENTE RON
 * Interfaz para que clientes accedan a sesiones RON con códigos
 */

import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Video, 
  FileText, 
  User, 
  Clock, 
  Shield, 
  ExternalLink,
  QrCode,
  Key,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientCodeInfo {
  code: {
    accessCode: string;
    status: string;
    expiresAt: string;
    sessionType: string;
    createdAt: string;
    usedAt?: string;
  };
  session: {
    id: string;
    type: string;
    status: string;
  };
  document: {
    id: number;
    title: string;
    documentType: string;
    status: string;
  };
  client: {
    id: number;
    fullName: string;
    email: string;
  };
  certifier: {
    fullName: string;
    email: string;
  };
}

interface AccessData {
  sessionId: string;
  clientInfo: any;
  sessionConfig: any;
  accessUrls: {
    jitsi?: string;
    agora?: string;
    embed: string;
  };
}

export default function RonClientAccess() {
  const [match, params] = useRoute('/ron-client-access/:code?');
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [accessCode, setAccessCode] = useState(params?.code || '');
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Query para obtener información del código
  const { data: codeInfo, isLoading: codeLoading } = useQuery<ClientCodeInfo>({
    queryKey: [`/api/ron-client/code-info/${accessCode}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ron-client/code-info/${accessCode}`);
      return response;
    },
    enabled: !!accessCode && accessCode.length > 8
  });

  // Mutación para acceder con código
  const accessMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('GET', `/api/ron-client/access/${code}`);
    },
    onSuccess: (data: AccessData) => {
      setAccessData(data);
      toast({
        title: "Acceso autorizado",
        description: "Código válido. Preparando videollamada RON..."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message || "El código no es válido o ha expirado",
        variant: "destructive"
      });
    }
  });

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      accessMutation.mutate(accessCode.trim());
    }
  };

  const handleJoinSession = () => {
    if (accessData?.accessUrls.jitsi) {
      // Abrir Jitsi en nueva ventana
      window.open(accessData.accessUrls.jitsi, '_blank', 'width=1200,height=800');
    } else if (accessData?.sessionId) {
      // Redirigir a página de sesión
      setLocation(`/ron-jitsi/${accessData.sessionId}`);
    }
  };

  // Auto-validar código si viene en URL
  useEffect(() => {
    if (params?.code && params.code.length > 8) {
      setAccessCode(params.code);
      accessMutation.mutate(params.code);
    }
  }, [params?.code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Acceso Cliente RON
          </h1>
          <p className="text-xl text-gray-600">
            Notarización Remota Online - Acceso con Código
          </p>
        </div>

        {!accessData ? (
          <div className="space-y-6">
            {/* Formulario de acceso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Ingrese su Código de Acceso
                </CardTitle>
                <CardDescription>
                  Ingrese el código que recibió del certificador para acceder a su sesión RON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccessSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Acceso RON
                    </label>
                    <Input
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="RON-123456-ABCDEF"
                      className="text-center text-lg font-mono"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: RON-XXXXXX-XXXXXX
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={accessMutation.isPending || !accessCode.trim()}
                  >
                    {accessMutation.isPending ? 'Validando...' : 'Acceder a Sesión RON'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                {/* Información del código si está disponible */}
                {codeInfo && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Información del Código:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge variant={codeInfo.code.status === 'active' ? 'default' : 'secondary'}>
                          {codeInfo.code.status === 'active' ? 'Activo' : 
                           codeInfo.code.status === 'used' ? 'Usado' : 'Expirado'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Documento:</span>
                        <span className="font-medium">{codeInfo.document.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificador:</span>
                        <span className="font-medium">{codeInfo.certifier.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expira:</span>
                        <span className="font-medium">
                          {format(new Date(codeInfo.code.expiresAt), 'PPp', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instrucciones */}
            {showInstructions && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Instrucciones para la Sesión RON
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstructions(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Antes de la Sesión:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Tenga su documento de identidad físico a mano
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Asegúrese de tener buena iluminación
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Use una conexión a internet estable
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Pruebe su cámara y micrófono
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Durante la Sesión:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          La sesión será grabada para fines legales
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          Mantenga la cámara enfocada en su rostro
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          Siga las instrucciones del certificador
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          No salga de la sesión hasta completar
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soporte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  ¿Necesita Ayuda?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Soporte Telefónico</p>
                      <p className="text-sm text-gray-600">+56 2 2345 6789</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email de Soporte</p>
                      <p className="text-sm text-gray-600">soporte@notarypro.cl</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Pantalla de acceso autorizado */
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Acceso Autorizado
                </CardTitle>
                <CardDescription className="text-green-700">
                  Su código es válido. Ya puede acceder a la videollamada RON.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Información de la sesión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documento a Notarizar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{codeInfo?.document.title}</p>
                    <p className="text-sm text-gray-600">{codeInfo?.document.documentType}</p>
                    <Badge variant="outline">{codeInfo?.document.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Su Certificador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{codeInfo?.certifier.fullName}</p>
                    <p className="text-sm text-gray-600">{codeInfo?.certifier.email}</p>
                    <Badge variant="default">Certificador Autorizado</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acceso a videollamada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  Acceder a Videollamada RON
                </CardTitle>
                <CardDescription>
                  Haga clic en el botón para unirse a su sesión de notarización remota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-10 w-10 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">
                    Sesión RON Lista
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Proveedor: {accessData.sessionConfig?.provider === 'jitsi' ? 'Jitsi Meet' : 'Agora'} | 
                    Tipo: Notarización Remota
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleJoinSession}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-lg px-8"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Unirse a Videollamada RON
                    </Button>

                    {accessData.accessUrls.jitsi && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">O acceda directamente:</p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(accessData.accessUrls.jitsi, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir en Nueva Ventana
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la sesión */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Código:</span>
                      <p className="font-mono">{accessCode}</p>
                    </div>
                    <div>
                      <span className="font-medium">Cliente:</span>
                      <p>{accessData.clientInfo?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Sesión:</span>
                      <p>{accessData.sessionId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recordatorios importantes */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Recordatorios Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>• Esta sesión será grabada automáticamente para validez legal</p>
                  <p>• Mantenga su documento de identidad visible durante la verificación</p>
                  <p>• No comparta este código con terceros</p>
                  <p>• La sesión es privada y segura con encriptación end-to-end</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer legal */}
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Sesión Segura y Certificada</span>
                <span>•</span>
                <span>Conforme a Ley 19.799</span>
                <span>•</span>
                <span>NotaryPro Chile</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}