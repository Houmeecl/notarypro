import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  FileText,
  FileSignature,
  User,
  GraduationCap,
  IdCard,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, href, isActive, isMobile, onClick }: NavItemProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          isMobile && "justify-between"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {isMobile && <ChevronRight className="h-4 w-4" />}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const routes = [
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Mis Documentos",
      href: "/user-dashboard",
      roles: ["user", "certifier", "admin"]
    },
    {
      icon: <FileSignature className="h-5 w-5" />,
      label: "Firmar Documento",
      href: "/document-sign/new",
      roles: ["user", "certifier", "admin"]
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Validar Documentos",
      href: "/certifier-dashboard",
      roles: ["certifier", "admin"]
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Cursos",
      href: "/courses",
      roles: ["user", "certifier", "admin"]
    },
    {
      icon: <IdCard className="h-5 w-5" />,
      label: "Mis Certificados",
      href: "/certificates",
      roles: ["user", "certifier", "admin"]
    },
    {
      icon: <Store className="h-5 w-5" />,
      label: "Integración POS",
      href: "/partners/pos-integration",
      roles: ["partner"]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Administración",
      href: "/admin-dashboard",
      roles: ["admin"]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Admin POS",
      href: "/admin/pos-management",
      roles: ["admin"]
    }
  ];

  const filteredRoutes = routes.filter(route => 
    route.roles.includes(user?.role || "")
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Desktop sidebar
  const desktopSidebar = (
    <div className="w-64 bg-sidebar h-screen flex flex-col border-r border-sidebar-border fixed left-0 top-0">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="md" variant="full" />
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6 text-sm text-sidebar-foreground/70">
          {user?.role === "certifier" ? "Certificador" : (user?.role === "admin" ? "Administrador" : "Usuario")}
        </div>
        
        <nav id="dashboard-menu" className="space-y-1">
          {filteredRoutes.map((route, index) => (
            <NavItem
              key={index}
              icon={route.icon}
              label={route.label}
              href={route.href}
              isActive={location === route.href}
            />
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sidebar-foreground">{user?.fullName}</div>
            <div className="text-xs text-sidebar-foreground/70">{user?.email}</div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  // Mobile header with hamburger menu
  const mobileHeader = (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden sticky top-0 z-30">
      <Logo size="sm" variant="icon" />
      
      <Button variant="ghost" onClick={toggleMobileMenu} size="icon">
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );

  // Mobile sidebar (slide-in menu)
  const mobileSidebar = mobileMenuOpen && (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={toggleMobileMenu}>
      <div 
        className="fixed right-0 top-0 h-full w-3/4 max-w-xs bg-white overflow-y-auto shadow-xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="font-medium">Menú</div>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user?.fullName}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {filteredRoutes.map((route, index) => (
              <NavItem
                key={index}
                icon={route.icon}
                label={route.label}
                href={route.href}
                isActive={location === route.href}
                isMobile={true}
                onClick={toggleMobileMenu}
              />
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileHeader}
      {mobileSidebar}
      <div className="hidden md:block">{desktopSidebar}</div>
      <div className="md:pl-64">
        {/* Main content will be rendered here */}
      </div>
    </>
  );
}
