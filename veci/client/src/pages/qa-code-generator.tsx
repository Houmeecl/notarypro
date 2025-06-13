
import React from 'react';
import { Helmet } from 'react-helmet';
import QACodeGenerator from '@/components/utils/QACodeGenerator';
import { Shield, ShieldCheck, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

/**
 * Página de generación de códigos QA para pruebas del sistema
 * Estos códigos permiten realizar pruebas sin validaciones estrictas
 */
const QACodeGeneratorPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Generador de Códigos QA - VecinoXpress</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-3">
            <Shield className="h-8 w-8 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Generador de Códigos QA</h1>
          <p className="text-gray-600 mt-2">
            Herramienta para generar códigos que facilitan pruebas de calidad
          </p>
        </header>
        
        <div className="mb-8">
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Solo para personal autorizado
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Los códigos generados aquí permiten saltarse validaciones críticas del sistema y solo deben 
              usarse en entornos controlados de pruebas.
            </AlertDescription>
          </Alert>
          
          <QACodeGenerator />
        </div>
        
        <Separator className="my-8" />
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Instrucciones de Uso
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Los códigos QA deben introducirse en cualquiera de las siguientes interfaces:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Pantalla de verificación de identidad (campo "Código de Administrador")</li>
              <li>Pantalla de firma digital (opción "Ingresar código QA")</li>
              <li>Panel de certificación (menú "Herramientas {'>'} Activar modo QA")</li>
              <li>Cualquier interfaz donde veas un botón "Ingresar código QA"</li>
            </ol>
            
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                Modo Funcional Automático
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Al ingresar el código QA, el sistema activará automáticamente el modo "Funcional" que permite
                realizar pruebas end-to-end sin interrupciones por validaciones.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QACodeGeneratorPage;
