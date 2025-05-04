import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, Search, RefreshCw, Smartphone, Settings, 
  Terminal, Tablet, AlertTriangle, CheckCircle, 
  Activity, CornerDownRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceFeatures } from '@/hooks/use-device-features';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function POSMenuPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isDemoMode, deviceModel } = useDeviceFeatures();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>('');

  // Consultar lista de dispositivos
  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ['/api/pos-management/devices'],
    staleTime: 30000, // 30 segundos
  });

  // Filtrar dispositivos basado en búsqueda y tab activo
  const filteredDevices = React.useMemo(() => {
    if (!devices) return [];
    
    let filtered = [...devices];
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(device => 
        device.deviceName.toLowerCase().includes(query) || 
        device.deviceCode.toLowerCase().includes(query) ||
        (device.location && device.location.toLowerCase().includes(query))
      );
    }
    
    // Filtrar por tipo
    if (activeTab !== 'all') {
      filtered = filtered.filter(device => 
        activeTab === 'active' ? device.isActive : 
        activeTab === 'inactive' ? !device.isActive :
        activeTab === 'demo' ? device.isDemo :
        device.deviceType === activeTab
      );
    }
    
    return filtered;
  }, [devices, searchQuery, activeTab]);

  // Obtener conteos para las etiquetas de tabs
  const counts = React.useMemo(() => {
    if (!devices) return { all: 0, active: 0, inactive: 0, pos: 0, tablet: 0, mobile: 0, kiosk: 0, demo: 0 };
    
    return {
      all: devices.length,
      active: devices.filter(d => d.isActive).length,
      inactive: devices.filter(d => !d.isActive).length,
      pos: devices.filter(d => d.deviceType === 'pos').length,
      tablet: devices.filter(d => d.deviceType === 'tablet').length,
      mobile: devices.filter(d => d.deviceType === 'mobile').length,
      kiosk: devices.filter(d => d.deviceType === 'kiosk').length,
      demo: devices.filter(d => d.isDemo).length
    };
  }, [devices]);

  // Determinar el estado del dispositivo
  const getDeviceStatus = (device: any) => {
    if (!device.isActive) return 'inactive';
    if (device.isDemo) return 'demo';
    return 'active';
  };

  // Mostrar icono según el tipo de dispositivo
  const getDeviceIcon = (type: any) => {
    switch (type) {
      case 'pos':
        return <Terminal className="h-5 w-5 text-indigo-600" />;
      case 'tablet':
        return <Tablet className="h-5 w-5 text-blue-500" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5 text-green-500" />;
      case 'kiosk':
        return <Settings className="h-5 w-5 text-orange-500" />;
      default:
        return <Terminal className="h-5 w-5 text-gray-500" />;
    }
  };

  // Manejar clic en dispositivo
  const handleDeviceClick = (device: any) => {
    setSelectedDevice(device);
    setLocation(`/pos-session/${device.id}`);
  };

  // Acciones de dispositivo
  const handleDeviceAction = (action: string, device: any) => {
    setSelectedDevice(device);
    
    switch (action) {
      case 'open-session':
        setLocation(`/pos-session/${device.id}`);
        break;
      case 'view-details':
        // Mostrar detalles en un diálogo modal (no implementado en este ejemplo)
        toast({
          title: 'Detalles del Dispositivo',
          description: `${device.deviceName} (${device.deviceCode})`,
          variant: "success",
        });
        break;
      case 'edit':
        toast({
          description: 'Función de edición no implementada',
        });
        break;
      case 'deactivate':
        setConfirmAction('deactivate');
        setShowConfirmDialog(true);
        break;
      case 'activate':
        setConfirmAction('activate');
        setShowConfirmDialog(true);
        break;
      default:
        break;
    }
  };

  // Confirmar acción
  const confirmDeviceAction = () => {
    if (!selectedDevice) return;
    
    // Aquí implementarías la llamada a la API para activar/desactivar
    toast({
      title: confirmAction === 'activate' ? 'Dispositivo Activado' : 'Dispositivo Desactivado',
      description: `${selectedDevice.deviceName} ha sido ${confirmAction === 'activate' ? 'activado' : 'desactivado'}.`,
    });
    
    setShowConfirmDialog(false);
    refetch(); // Recargar lista
  };

  // Renderizar tarjeta de dispositivo
  const renderDeviceCard = (device: any) => {
    const status = getDeviceStatus(device);
    
    return (
      <Card 
        key={device.id} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          status === 'inactive' ? 'opacity-60' : ''
        } ${
          status === 'demo' ? 'border-orange-300 bg-orange-50/30' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getDeviceIcon(device.deviceType)}
              <CardTitle className="text-base">{device.deviceName}</CardTitle>
            </div>
            <Badge variant={
              status === 'active' ? "success" :
              status === 'demo' ? "warning" :
              "outline"
            }>
              {status === 'active' ? 'Activo' : 
               status === 'demo' ? 'Demo' : 'Inactivo'}
            </Badge>
          </div>
          <CardDescription className="text-xs flex items-center gap-1">
            <CornerDownRight className="h-3 w-3 text-muted-foreground" /> 
            {device.deviceCode}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          {device.location && (
            <p className="text-sm text-muted-foreground mt-1">
              Ubicación: {device.location}
            </p>
          )}
          {device.deviceModel && (
            <p className="text-xs text-muted-foreground mt-1">
              Modelo: {device.deviceModel}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeviceClick(device)}
          >
            Sesión
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDeviceAction('open-session', device)}>
                <Activity className="h-4 w-4 mr-2" />
                Abrir Sesión
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeviceAction('view-details', device)}>
                <Search className="h-4 w-4 mr-2" />
                Ver Detalles
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {device.isActive ? (
                <DropdownMenuItem 
                  onClick={() => handleDeviceAction('deactivate', device)}
                  className="text-red-600"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleDeviceAction('activate', device)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    );
  };

  // Renderizar tarjeta esqueleto para estado de carga
  const renderSkeletonCard = (index: number) => (
    <Card key={`skeleton-${index}`} className="cursor-default">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-24 mt-1" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </CardFooter>
    </Card>
  );

  // Componente para seleccionar dispositivo
  const DeviceSelectionCard = ({ device, onSelect }: { device: any, onSelect: any }) => {
    const getTypeLabel = (type: any) => {
      switch (type) {
        case 'pos': return 'Terminal POS';
        case 'tablet': return 'Tablet';
        case 'mobile': return 'Móvil';
        case 'kiosk': return 'Quiosco';
        default: return 'Dispositivo';
      }
    };
    
    return (
      <div 
        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
        onClick={() => onSelect(device)}
      >
        <div className="bg-indigo-100 p-3 rounded-full">
          {getDeviceIcon(device.deviceType)}
        </div>
        <div>
          <h3 className="font-medium">{device.deviceName}</h3>
          <p className="text-sm text-muted-foreground">{getTypeLabel(device.deviceType)}</p>
          <p className="text-xs text-muted-foreground">{device.deviceCode}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gestión de Dispositivos POS</h1>
          <p className="text-muted-foreground">
            Administre y monitoree los dispositivos de punto de venta
            {isDemoMode && " (Modo Demo)"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={() => setLocation('/register-pos-device')}
          >
            <Plus className="h-4 w-4 mr-2" /> Registrar Dispositivo
          </Button>
        </div>
      </div>
      
      {isDemoMode && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <strong>Modo Demo Activo:</strong> Algunas funcionalidades están limitadas o simuladas.
          {deviceModel && ` Dispositivo detectado: ${deviceModel}`}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <Input
            placeholder="Buscar dispositivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full h-auto p-1 flex flex-wrap">
              <TabsTrigger value="all" className="flex-1">
                Todos <Badge variant="default" className="ml-1">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Activos <Badge variant="default" className="ml-1">{counts.active}</Badge>
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex-1">
                Demo <Badge variant="warning" className="ml-1">{counts.demo}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex-1">
                POS <Badge variant="default" className="ml-1">{counts.pos}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => renderSkeletonCard(i))}
        </div>
      ) : filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => renderDeviceCard(device))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No se encontraron dispositivos</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No hay resultados para "${searchQuery}"`
              : 'No hay dispositivos registrados en esta categoría'}
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
          >
            Ver todos los dispositivos
          </Button>
        </div>
      )}
      
      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'activate' ? 'Activar Dispositivo' : 'Desactivar Dispositivo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'activate'
                ? '¿Está seguro de que desea activar este dispositivo? Estará disponible para realizar transacciones.'
                : '¿Está seguro de que desea desactivar este dispositivo? No podrá realizar transacciones mientras esté inactivo.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeviceAction}>
              {confirmAction === 'activate' ? 'Activar' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}