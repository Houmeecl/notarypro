import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Gavel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 border-indigo-100 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Gavel className="h-10 w-10 text-indigo-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Documento No Encontrado</h1>
            <div className="h-1 w-20 bg-indigo-700 my-3"></div>
            <p className="text-gray-600">La página que intenta visitar no existe o ha sido trasladada.</p>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Link href="/">
              <Button 
                variant="default" 
                className="w-full bg-indigo-700 hover:bg-indigo-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Inicio
              </Button>
            </Link>
            
            <p className="mt-4 text-sm text-gray-500 text-center">
              Notaría VecinoXpress - Servicios Notariales Certificados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
