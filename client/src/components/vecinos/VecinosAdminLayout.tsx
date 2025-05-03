import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Store, 
  FileText, 
  CreditCard, 
  BarChart3,
  Settings, 
  LogOut,
  HelpCircle,
  ChevronDown
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <Link href={href}>
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
      active 
        ? "bg-green-50 text-green-700" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}>
      <div className="flex-shrink-0">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
  </Link>
);

interface VecinosAdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export const VecinosAdminLayout = ({ 
  children, 
  title = "Dashboard Admin" 
}: VecinosAdminLayoutProps) => {
  const [location] = useLocation();
  // Datos de usuario simulados para demostración 
  const mockUser = {
    username: 'vecinosadmin'
  };
  
  const handleLogout = () => {
    // No hacemos nada en este momento, solo para demostración
    console.log('Cerrar sesión clicked');
    window.location.href = '/vecinos-express';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src="/logo-vecinos-xpress.svg" 
                alt="Vecinos Xpress" 
                className="h-8 w-auto"
              />
              <span className="ml-2 text-lg font-semibold text-gray-800">
                Vecinos<span className="text-green-600">Xpress</span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 px-3 space-y-1">
                <NavItem 
                  icon={<Home size={20} />} 
                  label="Dashboard" 
                  href="/vecinos/admin"
                  active={location === "/vecinos/admin"}
                />
                <NavItem 
                  icon={<Store size={20} />} 
                  label="Socios" 
                  href="/vecinos/admin/partners"
                  active={location === "/vecinos/admin/partners"}
                />
                <NavItem 
                  icon={<Users size={20} />} 
                  label="Supervisores" 
                  href="/vecinos/admin/supervisors"
                  active={location === "/vecinos/admin/supervisors"}
                />
                <NavItem 
                  icon={<Users size={20} />} 
                  label="Vendedores" 
                  href="/vecinos/admin/sellers"
                  active={location === "/vecinos/admin/sellers"}
                />
                <NavItem 
                  icon={<FileText size={20} />} 
                  label="Documentos" 
                  href="/vecinos/admin/documents"
                  active={location === "/vecinos/admin/documents"}
                />
                <NavItem 
                  icon={<CreditCard size={20} />} 
                  label="Transacciones" 
                  href="/vecinos/admin/transactions"
                  active={location === "/vecinos/admin/transactions"}
                />
                <NavItem 
                  icon={<BarChart3 size={20} />} 
                  label="Reportes" 
                  href="/vecinos/admin/reports"
                  active={location === "/vecinos/admin/reports"}
                />
                <NavItem 
                  icon={<Settings size={20} />} 
                  label="Configuración" 
                  href="/vecinos/admin/settings"
                  active={location === "/vecinos/admin/settings"}
                />
              </nav>
            </div>
            
            <div className="px-3 mt-6">
              <NavItem 
                icon={<HelpCircle size={20} />} 
                label="Ayuda" 
                href="/vecinos/admin/help"
              />
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
              
              <div className="flex items-center space-x-4">
                {/* Search (optional) */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full py-2 pl-10 pr-3 text-sm leading-tight text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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

                {/* User dropdown */}
                <div className="relative">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {mockUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                      {mockUser.username}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};