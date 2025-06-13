import React from 'react';
import { CheckCircle, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRealFuncionality } from "@/hooks/use-real-funcionality";

interface FunctionalTemplateCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  onClick: () => void;
}

/**
 * Componente de tarjeta para plantillas de documentos que muestra información adicional
 * cuando el modo funcional real está activo
 */
export function FunctionalTemplateCard({ id, name, description, price, onClick }: FunctionalTemplateCardProps) {
  const { isFunctionalMode } = useRealFuncionality();
  
  return (
    <div 
      onClick={onClick}
      className="block h-full transition-transform hover:scale-105 cursor-pointer"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            {isFunctionalMode ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="mr-1 h-3 w-3" /> Certificada
              </Badge>
            ) : (
              <Badge variant="outline">
                Activo
              </Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Separator className="my-2" />
          <div className="mt-4">
            {isFunctionalMode && (
              <div className="bg-green-50 rounded-md p-2 mb-3 flex items-center">
                <FileText className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs text-green-700">
                  Cumple con los requisitos legales de la Ley 19.799
                </span>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Esta plantilla incluye un formulario para completar los datos necesarios para generar el documento.
            </p>
            <div className="flex justify-between items-center mt-4">
              <p className="font-medium text-lg">
                ${price / 100}
              </p>
              {isFunctionalMode && (
                <div className="flex items-center text-xs text-green-700">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Emisión inmediata</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            {isFunctionalMode ? "Completar y Firmar" : "Usar esta plantilla"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FunctionalTemplateCard;