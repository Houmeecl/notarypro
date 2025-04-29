import { Link, useLocation } from "wouter";
import { FileText, PlusCircle, Home, User, BookOpen } from "lucide-react";

export default function DocumentNavbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <div className="sticky top-0 z-10 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-8 cursor-pointer" onClick={() => window.location.href = '/'}>
              <FileText className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-semibold">NotaryPro Chile</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <div 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  isActive("/document-categories") || isActive("/document-templates") || isActive("/document-form") 
                    ? "text-primary" 
                    : "text-gray-600"
                }`}
                onClick={() => window.location.href = '/document-categories'}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo documento
              </div>
              
              <div 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  isActive("/documents") ? "text-primary" : "text-gray-600"
                }`}
                onClick={() => window.location.href = '/documents'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Mis documentos
              </div>
              
              <div 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  isActive("/courses") ? "text-primary" : "text-gray-600"
                }`}
                onClick={() => window.location.href = '/courses'}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Cursos
              </div>
            </nav>
          </div>
          
          <div className="flex items-center">
            <div 
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
              onClick={() => window.location.href = '/user-dashboard'}
            >
              <User className="h-4 w-4 mr-2" />
              Mi cuenta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}