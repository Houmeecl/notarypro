
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Componente para generar códigos QA (Quality Assurance) para pruebas del sistema
 * Los códigos generados permiten acceder a funcionalidades sin validaciones estrictas
 */
const QACodeGenerator: React.FC = () => {
  const { toast } = useToast();
  const [qaCode, setQaCode] = useState<string>("");
  const [expiryTime, setExpiryTime] = useState<number>(24); // Horas

  // Generar código QA al cargar el componente
  useEffect(() => {
    generateNewCode();
  }, []);

  // Función para generar código QA
  const generateNewCode = () => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hash = `QA-${randomPart}-${timestamp.toString().slice(-6)}`;
    setQaCode(hash);
  };

  // Copiar código al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qaCode).then(() => {
      toast({
        title: "Código copiado",
        description: "El código QA ha sido copiado al portapapeles",
      });
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl text-blue-800">Generador de Códigos QA</CardTitle>
        <CardDescription>
          Genera códigos para pruebas de QA sin validaciones estrictas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              value={qaCode} 
              readOnly 
              className="font-mono bg-gray-50"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyToClipboard}
              title="Copiar código"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">Validez:</p>
            <Input 
              type="number" 
              min="1" 
              max="168"
              value={expiryTime}
              onChange={(e) => setExpiryTime(parseInt(e.target.value) || 24)}
              className="w-20"
            />
            <p className="text-sm text-gray-500">horas</p>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Este código permite realizar pruebas de QA ignorando:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Validaciones de identidad estrictas</li>
              <li>Verificaciones de firma digital avanzada</li>
              <li>Comprobaciones NFC y biométricas</li>
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 flex justify-between">
        <p className="text-xs text-gray-500">
          Expira: {new Date(Date.now() + expiryTime * 60 * 60 * 1000).toLocaleString()}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateNewCode}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Regenerar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QACodeGenerator;
