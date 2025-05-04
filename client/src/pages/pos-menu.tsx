import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Monitor, 
  HardDrive, 
  Layers, 
  BarChart, 
  Plus, 
  Power, 
  Check, 
  Clock, 
  Terminal, 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  ShieldAlert,
  Shield 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DemoModeBanner } from '@/components/ui/demo-mode-banner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDeviceFeatures } from '@/hooks/use-device-features';

// Utilidades para determinar estado del dispositivo
const getDeviceStatusColor = (device) => {
  if (!device.isActive) return 'bg-red-100 border-red-300 text-red-700';
  if (device.isDemo) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-green-50 border-green-200 text-green-700';
};

const getDeviceStatusText = (device) => {
  if (!device.isActive) return 'Inactivo';
  if (device.isDemo) return 'Modo Demo';
  return 'Activo';
};

const getDeviceTypeIcon = (type) => {
  const iconClasses = "h-6 w-6 md:h-8 md:w-8";
  
  switch (type?.toLowerCase()) {
    case 'pos':
      return <Terminal className={iconClasses} />;
    case 'tablet':
      return <Monitor className={iconClasses} />;
    case 'mobile':
      return <HardDrive className={iconClasses} />;
    case 'kiosk':
      return <Layers className={iconClasses} />;
    default:
      return <Terminal className={iconClasses} />;
  }
};

export default function POSMenuPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);
  const { deviceSupportsNFC, deviceModel } = useDeviceFeatures();

  // Obtener dispositivos
  const { data: devices, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/pos-management/devices'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/pos-management/devices');
      return await res.json();
    },
  });

  // Filtrar dispositivos
  useEffect(() => {
    if (!devices) return;

    if (!searchTerm) {
      setFilteredDevices(devices);
      return;
    }

    const filtered = devices.filter(device => 
      device.deviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.location && device.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredDevices(filtered);
  }, [devices, searchTerm]);

  // Agrupar dispositivos por tipo
  const groupedDevices = {
    active: filteredDevices?.filter(device => device.isActive && !device.isDemo) || [],
    demo: filteredDevices?.filter(device => device.isActive && device.isDemo) || [],
    inactive: filteredDevices?.filter(device => !device.isActive) || []
  };

  // Abrir sesión para un dispositivo
  const handleOpenSession = (device) => {
    if (!device) return;
    setLocation(`/pos-session/${device.deviceCode}`);
  };

  // Verificar compatibilidad del dispositivo actual
  const getCurrentDeviceInfo = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dispositivo Actual</CardTitle>
          <CardDescription>
            Información del dispositivo que estás utilizando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <span className="font-semibold">{deviceModel || 'Dispositivo Desconocido'}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={deviceSupportsNFC ? "success" : "warning"}>
                {deviceSupportsNFC ? 'Compatible con NFC' : 'Sin NFC'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Ver pantalla de carga
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cargando dispositivos POS</h2>
          <p className="text-muted-foreground">
            Obteniendo lista de terminales disponibles...
          </p>
        </div>
      </div>
    );
  }

  // Ver pantalla de error
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar dispositivos</h2>
          <p className="text-muted-foreground mb-4">
            No se ha podido obtener la lista de dispositivos POS.
          </p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-1">Gestión de POS</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Administre sus dispositivos y sesiones
      </p>

      {getCurrentDeviceInfo()}

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar dispositivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg 
              className="w-4 h-4 text-gray-500 dark:text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
          <Button onClick={() => setLocation('/register-pos-device')}>
            <Plus className="h-4 w-4 mr-1" />
            <span>Nuevo Dispositivo</span>
          </Button>
        </div>
      </div>

      {filteredDevices?.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-muted">
            <Terminal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No se encontraron dispositivos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}". Prueba con otra búsqueda.` 
              : 'No hay dispositivos registrados. Registra un nuevo dispositivo para comenzar.'}
          </p>
          <Button onClick={() => setLocation('/register-pos-device')}>
            Registrar Dispositivo
          </Button>
        </div>
      ) : (
        <>
          {/* Dispositivos activos (modo real) */}
          {groupedDevices.active.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-1 text-green-600" />
                <span>Dispositivos Activos</span>
                <Badge variant="outline" className="ml-2">
                  {groupedDevices.active.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {groupedDevices.active.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onSelect={handleOpenSession}
                  />
                ))}
              </div>
            </>
          )}

          {/* Dispositivos demo */}
          {groupedDevices.demo.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShieldAlert className="h-5 w-5 mr-1 text-amber-500" />
                <span>Dispositivos de Prueba</span>
                <Badge variant="outline" className="ml-2">
                  {groupedDevices.demo.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {groupedDevices.demo.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onSelect={handleOpenSession}
                  />
                ))}
              </div>
            </>
          )}

          {/* Dispositivos inactivos */}
          {groupedDevices.inactive.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center opacity-70">
                <Power className="h-5 w-5 mr-1" />
                <span>Dispositivos Inactivos</span>
                <Badge variant="outline" className="ml-2">
                  {groupedDevices.inactive.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 opacity-70">
                {groupedDevices.inactive.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onSelect={handleOpenSession}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="fixed bottom-0 left-0 w-full">
        <DemoModeBanner variant="minimal" position="bottom" />
      </div>
    </div>
  );
}

// Componente de tarjeta para dispositivos
function DeviceCard({ device, onSelect }) {
  // Determinar tipo de dispositivo
  const getTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'pos': return 'Terminal POS';
      case 'tablet': return 'Tablet';
      case 'mobile': return 'Móvil';
      case 'kiosk': return 'Quiosco';
      default: return 'Terminal';
    }
  };

  // Obtener color de fondo según estado
  const getStatusBgColor = () => {
    if (!device.isActive) return 'border-red-200';
    if (device.isDemo) return 'border-amber-200';
    return 'border-green-200';
  };

  // Obtener última conexión formateada
  const getLastActive = () => {
    if (!device.lastActive) return 'Nunca';
    const date = new Date(device.lastActive);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`overflow-hidden border-l-4 ${getStatusBgColor()} hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="mr-2">
            <CardTitle className="font-semibold text-lg line-clamp-1">
              {device.deviceName}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {device.deviceCode}
            </CardDescription>
          </div>
          <div className="flex-shrink-0 p-1.5 rounded-full bg-muted/30">
            {getDeviceTypeIcon(device.deviceType)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tipo</span>
            <span>{getTypeLabel(device.deviceType)}</span>
          </div>
          {device.deviceModel && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Modelo</span>
              <span>{device.deviceModel}</span>
            </div>
          )}
          {device.location && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ubicación</span>
              <span className="line-clamp-1 text-right">{device.location}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Última Actividad
            </span>
            <span>{getLastActive()}</span>
          </div>
        </div>
        
        <Badge 
          variant={device.isDemo ? "warning" : "default"} 
          className="mt-3 w-full justify-center"
        >
          {getDeviceStatusText(device)}
        </Badge>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect(device)}
          disabled={!device.isActive}
        >
          {device.isActive ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Administrar Sesión
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Dispositivo Inactivo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}