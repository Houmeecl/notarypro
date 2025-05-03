import React from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  TabletSmartphone, 
  TerminalSquare,
  ChevronRight,
  Settings,
  AlertCircle
} from 'lucide-react';

const POSMenu: React.FC = () => {
  const [location, navigate] = useLocation();
  
  const posOptions = [
    {
      id: 'real-pos',
      title: 'POS Real',
      description: 'Terminal de punto de venta para procesamiento real de pagos con hardware físico.',
      icon: <TerminalSquare className="w-10 h-10 text-[#2d219b]" />,
      path: '/real-pos',
      badgeText: 'REAL',
      badgeColor: 'bg-[#2d219b]'
    },
    {
      id: 'test-pos',
      title: 'POS Prueba',
      description: 'Entorno de prueba para el terminal POS. Simula transacciones sin procesar pagos reales.',
      icon: <Settings className="w-10 h-10 text-yellow-500" />,
      path: '/test-pos',
      badgeText: 'PRUEBA',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 'tablet-pos',
      title: 'Web Tablet',
      description: 'Versión web optimizada para dispositivos táctiles con procesamiento directo de pagos.',
      icon: <TabletSmartphone className="w-10 h-10 text-emerald-600" />,
      path: '/tablet-pos',
      badgeText: 'WEB',
      badgeColor: 'bg-emerald-600'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#2d219b] mb-4">
            VecinoXpress POS
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Seleccione el modo del terminal punto de venta que desea utilizar según sus necesidades.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {posOptions.map(option => (
            <Card 
              key={option.id}
              className="transition-all hover:shadow-md cursor-pointer" 
              onClick={() => navigate(option.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <div className={`text-xs text-white ${option.badgeColor} px-2 py-1 rounded mt-1 inline-block`}>
                    {option.badgeText}
                  </div>
                </div>
                {option.icon}
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm">
                  {option.description}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-end border-t pt-4">
                <Button variant="ghost" className="group">
                  Iniciar 
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-700 mb-1">Información importante</h3>
              <p className="text-sm text-yellow-600">
                El modo "POS Real" está diseñado para funcionar con un terminal físico de pagos. 
                El modo "POS Prueba" simula este comportamiento sin procesar transacciones reales.
                La versión "Web Tablet" está optimizada para su uso en tablets con pagos web directos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSMenu;