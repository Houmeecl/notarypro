import { useState } from "react";
import { Link } from "wouter";
import { 
  LogOut, 
  Menu, 
  Settings, 
  User,
  Home,
  FileText,
  CreditCard,
  HelpCircle,
  Info,
  Video,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function MainNavbar() {
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo y título para escritorio */}
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary mr-2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h8" />
              </svg>
              <span className="font-bold text-xl">CerfiDoc</span>
            </a>
          </Link>
        </div>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </a>
          </Link>
          <Link href="/quienes-somos">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Quiénes Somos
            </a>
          </Link>
          <Link href="/document-categories">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </a>
          </Link>
          <Link href="/service-selection">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Servicios
            </a>
          </Link>
          <Link href="/ron-login">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Plataforma RON
            </a>
          </Link>
          <Link href="/contacto">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Contacto
            </a>
          </Link>
          <a 
            href="/documentacion-tecnica.html" 
            className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="h-4 w-4 mr-2" />
            Documentación
          </a>
        </nav>

        {/* Perfil de usuario para escritorio */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
                    <AvatarFallback>
                      {user?.username?.substring(0, 2).toUpperCase() || "CD"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="flex w-full cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="flex w-full cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link href="/auth">
                <a>Iniciar sesión</a>
              </Link>
            </Button>
          )}
        </div>

        {/* Menú móvil */}
        <div className="md:hidden flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="text-left">
                <SheetTitle>CerfiDoc</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 flex flex-col gap-4">
                {user && (
                  <>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
                        <AvatarFallback>
                          {user?.username?.substring(0, 2).toUpperCase() || "CD"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.role}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Home className="h-4 w-4" />
                    <span>Inicio</span>
                  </a>
                </Link>
                <Link href="/quienes-somos" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Info className="h-4 w-4" />
                    <span>Quiénes Somos</span>
                  </a>
                </Link>
                <Link href="/document-categories" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </a>
                </Link>
                <Link href="/service-selection" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Servicios</span>
                  </a>
                </Link>
                <Link href="/ron-login" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Video className="h-4 w-4" />
                    <span>Plataforma RON</span>
                  </a>
                </Link>
                <Link href="/contacto" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Contacto</span>
                  </a>
                </Link>
                
                <a 
                  href="/documentacion-tecnica.html"
                  className="flex items-center gap-2 py-2"
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4" />
                  <span>Documentación</span>
                </a>
                
                <Separator />
                
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <a className="flex items-center gap-2 py-2">
                        <User className="h-4 w-4" />
                        <span>Mi perfil</span>
                      </a>
                    </Link>
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <a className="flex items-center gap-2 py-2">
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </a>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="mt-4"
                    asChild
                  >
                    <Link href="/auth">
                      <a>Iniciar sesión</a>
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}