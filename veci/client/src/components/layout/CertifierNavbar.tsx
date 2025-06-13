import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  FileText, 
  LogOut, 
  Menu, 
  MoreVertical, 
  Settings, 
  User,
  Video,
  Home,
  HelpCircle,
  BookOpen
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

export default function CertifierNavbar() {
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
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md">
            Panel Certificador
          </span>
        </div>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/certifier-dashboard">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </a>
          </Link>
          <Link href="/certification-calendar">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </a>
          </Link>
          <Link href="/certification-documents">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </a>
          </Link>
          <Link href="/video-sessions">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Videollamadas
            </a>
          </Link>
          <Link href="/ayuda-legal">
            <a className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Ayuda Legal
            </a>
          </Link>
        </nav>

        {/* Perfil de usuario para escritorio */}
        <div className="hidden md:flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
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
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user?.username?.substring(0, 2).toUpperCase() || "CD"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">Certificador</p>
                  </div>
                </div>
                <Separator />
                <Link href="/certifier-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Home className="h-4 w-4" />
                    <span>Inicio</span>
                  </a>
                </Link>
                <Link href="/certification-calendar" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendario</span>
                  </a>
                </Link>
                <Link href="/certification-documents" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </a>
                </Link>
                <Link href="/video-sessions" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <Video className="h-4 w-4" />
                    <span>Videollamadas</span>
                  </a>
                </Link>
                <Link href="/ayuda-legal" onClick={() => setIsMobileMenuOpen(false)}>
                  <a className="flex items-center gap-2 py-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Ayuda Legal</span>
                  </a>
                </Link>
                <Separator />
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}