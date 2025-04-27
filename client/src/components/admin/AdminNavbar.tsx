import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  FileCheck, 
  Plug, 
  Store, 
  BarChart3,
  GraduationCap,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/ui/logo';

const AdminNavbar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Usuarios', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Documentos', path: '/admin/documents', icon: <FileText className="h-5 w-5" /> },
    { name: 'Certificadores', path: '/admin/certifiers', icon: <FileCheck className="h-5 w-5" /> },
    { name: 'Cursos', path: '/admin/courses', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'Vecinos Partners', path: '/admin/partners', icon: <Store className="h-5 w-5" /> },
    { name: 'Gestión POS', path: '/admin/pos-management', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Integraciones API', path: '/admin/api-integrations', icon: <Plug className="h-5 w-5" /> },
    { name: 'Configuración', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo size="sm" />
          <span className="text-lg font-semibold">Panel de Admin</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right mr-4">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 bg-white border-r overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md transition-colors
                    ${isActive(item.path) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Este componente solo contiene la navegación, el contenido va en la página */}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;