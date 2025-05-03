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
        ? "bg-white text-[#2d219b] font-semibold" 
        : "text-white hover:bg-[#3d31a9] hover:text-white"
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
        <div className="flex flex-col w-64 border-r border-gray-200 bg-[#2d219b]">
          <div className="h-20 flex items-center px-6 border-b border-[#3d31a9]">
            <div className="flex items-center">
              <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* House/Document base */}
                <path d="M10 10 L55 10 L55 80 L10 80 Z" fill="none" stroke="#ffffff" strokeWidth="4"/>
                
                {/* Angled overlay */}
                <path d="M25 80 L70 80 L70 35 L50 10 L25 10" fill="none" stroke="#ffffff" strokeWidth="4"/>
                
                {/* Upward arrow */}
                <path d="M35 60 L55 40" stroke="#ffffff" strokeWidth="4"/>
                <path d="M55 40 L45 40 L55 40 L55 50" stroke="#ffffff" strokeWidth="4"/>
                
                {/* Star */}
                <path d="M30 45 L33 39 L27 35 L34 35 L37 28 L40 35 L47 35 L41 39 L44 45 L37 41 Z" fill="#ffffff"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-white">
                VecinoXpress
              </span>
            </div>
          </div>
          
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 px-3 space-y-1">
                <NavItem 
                  icon={<Home size={20} className="text-white" />} 
                  label="Dashboard" 
                  href="/vecinos/admin"
                  active={location === "/vecinos/admin"}
                />
                <NavItem 
                  icon={<Store size={20} className="text-white" />} 
                  label="Socios" 
                  href="/vecinos/admin/partners"
                  active={location === "/vecinos/admin/partners"}
                />
                <NavItem 
                  icon={<Users size={20} className="text-white" />} 
                  label="Supervisores" 
                  href="/vecinos/admin/supervisors"
                  active={location === "/vecinos/admin/supervisors"}
                />
                <NavItem 
                  icon={<Users size={20} className="text-white" />} 
                  label="Vendedores" 
                  href="/vecinos/admin/sellers"
                  active={location === "/vecinos/admin/sellers"}
                />
                <NavItem 
                  icon={<FileText size={20} className="text-white" />} 
                  label="Gestor Documental" 
                  href="/vecinos/admin/document-manager"
                  active={location === "/vecinos/admin/document-manager"}
                />
                <NavItem 
                  icon={<CreditCard size={20} className="text-white" />} 
                  label="Transacciones" 
                  href="/vecinos/admin/transactions"
                  active={location === "/vecinos/admin/transactions"}
                />
                
                {/* Nuevas secciones financieras */}
                <div className="pt-4 pb-2">
                  <h2 className="px-3 text-xs font-semibold text-gray-200 uppercase">
                    Gerencia Financiera
                  </h2>
                </div>
                
                <NavItem 
                  icon={<BarChart3 size={20} className="text-white" />} 
                  label="Finanzas" 
                  href="/vecinos/admin/finance"
                  active={location === "/vecinos/admin/finance"}
                />
                <NavItem 
                  icon={<CreditCard size={20} className="text-white" />} 
                  label="Contabilidad" 
                  href="/vecinos/admin/accounting"
                  active={location === "/vecinos/admin/accounting"}
                />
                <NavItem 
                  icon={<BarChart3 size={20} className="text-white" />} 
                  label="Reportes" 
                  href="/vecinos/admin/reports"
                  active={location === "/vecinos/admin/reports"}
                />
                
                {/* Administración */}
                <div className="pt-4 pb-2">
                  <h2 className="px-3 text-xs font-semibold text-gray-200 uppercase">
                    Administración
                  </h2>
                </div>
                
                <NavItem 
                  icon={<Users size={20} className="text-white" />} 
                  label="Gestión de Usuarios" 
                  href="/vecinos/admin/users"
                  active={location === "/vecinos/admin/users"}
                />
                <NavItem 
                  icon={<Settings size={20} className="text-white" />} 
                  label="Configuración" 
                  href="/vecinos/admin/settings"
                  active={location === "/vecinos/admin/settings"}
                />
              </nav>
            </div>
            
            <div className="px-3 mt-6">
              <NavItem 
                icon={<HelpCircle size={20} className="text-white" />} 
                label="Ayuda" 
                href="/vecinos/admin/help"
              />
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white hover:bg-[#3d31a9]"
              >
                <LogOut size={20} className="text-white" />
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
            <div className="flex items-center justify-between h-20">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              
              <div className="flex items-center space-x-4">
                {/* Search (optional) */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-64 py-2 pl-10 pr-3 text-sm leading-tight text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d219b]"
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
                    <div className="h-10 w-10 rounded-full bg-[#2d219b] bg-opacity-10 flex items-center justify-center">
                      <span className="text-sm font-medium text-[#2d219b]">
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
        
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};