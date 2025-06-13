import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  PlugZap,
  MessageSquare,
  Bot,
  CreditCard,
  Mail,
  Video,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Tipo para APIs
interface ApiConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  isConfigured: boolean;
  fields: ApiField[];
}

interface ApiField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  secret: boolean;
}

const ApiIntegrationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [apiValues, setApiValues] = useState<Record<string, Record<string, string>>>({});
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});

  // Configuración de las APIs
  const apiConfigs: ApiConfig[] = [
    {
      id: 'crm',
      name: 'CRM Integration',
      description: 'Conecta con tu sistema CRM para sincronizar contactos y gestionar clientes',
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'CRM_API_KEY', label: 'API Key', type: 'text', placeholder: 'Ingrese su API Key del CRM', required: true, secret: true },
        { name: 'CRM_API_URL', label: 'API URL', type: 'text', placeholder: 'URL base de la API del CRM', required: true, secret: false }
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      description: 'Envía notificaciones y mensajes a los clientes a través de WhatsApp',
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'WHATSAPP_API_KEY', label: 'API Key', type: 'text', placeholder: 'Ingrese su API Key de WhatsApp', required: true, secret: true },
        { name: 'WHATSAPP_API_URL', label: 'API URL', type: 'text', placeholder: 'URL base de la API de WhatsApp', required: true, secret: false },
        { name: 'WHATSAPP_PHONE_ID', label: 'Phone ID', type: 'text', placeholder: 'ID del número de teléfono', required: true, secret: false }
      ]
    },
    {
      id: 'dialogflow',
      name: 'Dialogflow (AI Chat)',
      description: 'Implementa un asistente virtual inteligente para atender consultas de usuarios',
      icon: <Bot className="h-6 w-6 text-violet-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'DIALOGFLOW_API_KEY', label: 'API Key', type: 'text', placeholder: 'Ingrese su API Key de Dialogflow', required: true, secret: true },
        { name: 'DIALOGFLOW_PROJECT_ID', label: 'Project ID', type: 'text', placeholder: 'ID del proyecto de Dialogflow', required: true, secret: false }
      ]
    },
    {
      id: 'videox',
      name: 'VideoX Conference',
      description: 'Integra sistemas de videoconferencia para certificaciones remotas y reuniones',
      icon: <Video className="h-6 w-6 text-red-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'VIDEOX_API_KEY', label: 'API Key', type: 'text', placeholder: 'Ingrese su API Key de VideoX', required: true, secret: true },
        { name: 'VIDEOX_API_SECRET', label: 'API Secret', type: 'text', placeholder: 'Ingrese su API Secret de VideoX', required: true, secret: true },
        { name: 'VIDEOX_ACCOUNT_ID', label: 'Account ID', type: 'text', placeholder: 'ID de la cuenta de VideoX', required: true, secret: false }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Procesa pagos en línea de forma segura y eficiente',
      icon: <CreditCard className="h-6 w-6 text-indigo-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'STRIPE_SECRET_KEY', label: 'Secret Key', type: 'text', placeholder: 'Ingrese su Secret Key de Stripe', required: true, secret: true },
        { name: 'VITE_STRIPE_PUBLIC_KEY', label: 'Public Key', type: 'text', placeholder: 'Ingrese su Public Key de Stripe', required: true, secret: false }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid Email',
      description: 'Envía correos electrónicos transaccionales y de marketing',
      icon: <Mail className="h-6 w-6 text-amber-500" />,
      isEnabled: false,
      isConfigured: false,
      fields: [
        { name: 'SENDGRID_API_KEY', label: 'API Key', type: 'text', placeholder: 'Ingrese su API Key de SendGrid', required: true, secret: true },
        { name: 'SENDGRID_FROM_EMAIL', label: 'From Email', type: 'email', placeholder: 'Email para enviar correos', required: true, secret: false }
      ]
    }
  ];

  // Cargar estado de APIs al iniciar
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchApiStatus();
    }
  }, [user]);

  // Simulación de obtención del estado de APIs
  const fetchApiStatus = async () => {
    setLoading(true);
    try {
      // En un caso real, esta información vendría del backend
      const response = await apiRequest('GET', '/api/admin/integrations/status');
      const data = await response.json();
      
      // Inicializar valores y estado
      const initialValues: Record<string, Record<string, string>> = {};
      const initialStatus: Record<string, boolean> = {};
      
      apiConfigs.forEach(api => {
        initialValues[api.id] = {};
        initialStatus[api.id] = data?.status?.[api.id]?.isConfigured || false;
        
        // Inicializa campos vacíos para cada API
        api.fields.forEach(field => {
          initialValues[api.id][field.name] = '';
        });
      });
      
      setApiValues(initialValues);
      setApiStatus(initialStatus);
    } catch (error) {
      console.error('Error fetching API status:', error);
      // Valores por defecto en caso de error
      const initialValues: Record<string, Record<string, string>> = {};
      const initialStatus: Record<string, boolean> = {};
      
      apiConfigs.forEach(api => {
        initialValues[api.id] = {};
        initialStatus[api.id] = false;
        
        api.fields.forEach(field => {
          initialValues[api.id][field.name] = '';
        });
      });
      
      setApiValues(initialValues);
      setApiStatus(initialStatus);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los campos de configuración
  const handleApiFieldChange = (apiId: string, fieldName: string, value: string) => {
    setApiValues(prev => ({
      ...prev,
      [apiId]: {
        ...prev[apiId],
        [fieldName]: value
      }
    }));
  };

  // Mutación para guardar configuración de API
  const saveMutation = useMutation({
    mutationFn: async (data: { apiId: string; config: Record<string, string> }) => {
      const res = await apiRequest('POST', `/api/admin/integrations/${data.apiId}/config`, data.config);
      return await res.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Configuración guardada',
        description: `La configuración de ${getApiById(variables.apiId)?.name} ha sido guardada exitosamente.`,
      });
      
      // Actualizar estado de API
      setApiStatus(prev => ({
        ...prev,
        [variables.apiId]: true
      }));
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar la configuración.',
        variant: 'destructive'
      });
    }
  });

  // Mutación para probar conexión con API
  const testConnectionMutation = useMutation({
    mutationFn: async (apiId: string) => {
      const res = await apiRequest('POST', `/api/admin/integrations/${apiId}/test`);
      return await res.json();
    },
    onSuccess: (data, apiId) => {
      toast({
        title: 'Conexión exitosa',
        description: `La conexión con ${getApiById(apiId)?.name} fue establecida correctamente.`,
      });
    },
    onError: (error: Error, apiId) => {
      toast({
        title: 'Error de conexión',
        description: `No se pudo conectar con ${getApiById(apiId)?.name}: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Obtener API por ID
  const getApiById = (apiId: string): ApiConfig | undefined => {
    return apiConfigs.find(api => api.id === apiId);
  };

  // Guardar configuración de API
  const saveApiConfig = (apiId: string) => {
    const api = getApiById(apiId);
    if (!api) return;
    
    // Validar campos requeridos
    const missingFields = api.fields
      .filter(field => field.required && !apiValues[apiId][field.name])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos requeridos',
        description: `Por favor complete los siguientes campos: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Enviar configuración
    saveMutation.mutate({
      apiId,
      config: apiValues[apiId]
    });
  };

  // Probar conexión con API
  const testConnection = (apiId: string) => {
    testConnectionMutation.mutate(apiId);
  };

  // Verificar si el usuario es administrador
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Esta sección está disponible solo para administradores del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Por favor, inicie sesión con una cuenta de administrador para acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Integraciones de API</h1>
          <p className="text-muted-foreground">
            Administre y configure las integraciones con servicios externos
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={fetchApiStatus} 
            disabled={loading}
            className="flex"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualizar estado
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="dialogflow">Dialogflow</TabsTrigger>
          <TabsTrigger value="videox">VideoX</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Estado de integraciones</CardTitle>
              <CardDescription>
                Visualice y gestione todas las integraciones de API disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiConfigs.map(api => (
                  <Card key={api.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {api.icon}
                          <CardTitle className="text-lg">{api.name}</CardTitle>
                        </div>
                        <Badge variant={apiStatus[api.id] ? "default" : "outline"}>
                          {apiStatus[api.id] ? "Configurado" : "No configurado"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {api.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`enable-${api.id}`}
                            checked={apiStatus[api.id]}
                            disabled={!apiStatus[api.id]}
                          />
                          <Label htmlFor={`enable-${api.id}`}>
                            {apiStatus[api.id] ? "Activado" : "Desactivado"}
                          </Label>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab(api.id)}
                        >
                          Configurar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido para cada API */}
        {apiConfigs.map(api => (
          <TabsContent key={api.id} value={api.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {api.icon}
                  <div>
                    <CardTitle>{api.name}</CardTitle>
                    <CardDescription>{api.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <PlugZap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Configuración de API</h3>
                </div>

                <Alert className="mb-6">
                  <AlertTitle className="flex items-center gap-2">
                    {apiStatus[api.id] ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>API configurada correctamente</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-orange-500" />
                        <span>API no configurada</span>
                      </>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {apiStatus[api.id]
                      ? `La conexión a ${api.name} está configurada y lista para usar.`
                      : `Complete los campos a continuación para configurar la conexión a ${api.name}.`}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {api.fields.map(field => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        type={field.secret ? "password" : field.type}
                        placeholder={field.placeholder}
                        value={apiValues[api.id]?.[field.name] || ''}
                        onChange={(e) => handleApiFieldChange(api.id, field.name, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Opciones avanzadas</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enable-${api.id}-advanced`}
                      checked={apiStatus[api.id]}
                      disabled={!apiStatus[api.id]}
                    />
                    <Label htmlFor={`enable-${api.id}-advanced`}>
                      Activar integración
                    </Label>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Cuando está activada, la integración procesará datos en tiempo real. 
                    Desactivarla pausará temporalmente la comunicación con el servicio externo.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('overview')}
                >
                  Volver al resumen
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection(api.id)}
                    disabled={!apiStatus[api.id] || testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending && testConnectionMutation.variables === api.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Probar conexión
                  </Button>
                  <Button 
                    onClick={() => saveApiConfig(api.id)}
                    disabled={saveMutation.isPending && saveMutation.variables?.apiId === api.id}
                  >
                    {saveMutation.isPending && saveMutation.variables?.apiId === api.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Guardar configuración
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ApiIntegrationsPage;