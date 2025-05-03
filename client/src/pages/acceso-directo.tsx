/**
 * Página de Acceso Directo a Funciones Principales
 * 
 * Esta página proporciona acceso directo a las principales funciones del sistema,
 * evitando redirecciones y problemas de navegación.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CreditCard, 
  User,
  QrCode,
  ArrowLeft,
  Smartphone,
  Home,
  Copy
} from "lucide-react";
import { Helmet } from "react-helmet";
import { QRCodeSVG } from 'qrcode.react';

export default function AccesoDirecto() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Obtener la URL actual completa incluyendo el host
    setCurrentUrl(window.location.origin);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Acceso Directo - NotaryPro</title>
      </Helmet>
      
      <header className="bg-indigo-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">NotaryPro - Acceso Directo</h1>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-indigo-800">
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Button>
          </Link>
        </div>
      </header>
      
      {/* QR Code para acceso móvil */}
      <div className="bg-white py-6 shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-indigo-900 mb-2">Acceso desde dispositivo móvil</h2>
              <p className="text-gray-600">Escanea este código QR para acceder desde tu teléfono</p>
              <div className="mt-3 flex items-center">
                <div className="text-sm font-mono bg-gray-100 p-2 rounded-md overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-full">
                  {currentUrl}/acceso-directo
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2" 
                  onClick={() => copyToClipboard(`${currentUrl}/acceso-directo`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && <span className="text-green-600 ml-2 text-sm">¡Copiado!</span>}
              </div>
            </div>
            <div className="border-4 border-indigo-900 rounded-lg p-2 bg-white">
              <QRCodeSVG 
                value={`${currentUrl}/acceso-directo`} 
                size={150} 
                bgColor={"#ffffff"} 
                fgColor={"#2d219b"} 
                level={"H"} 
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Verificación NFC */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-indigo-100">
              <CardTitle className="text-indigo-700 flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Verificación NFC
              </CardTitle>
              <CardDescription>
                Verificación de identidad con NFC (versión estable)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Accede directamente al sistema de verificación NFC para cédulas chilenas.
                Esta es la versión corregida y más completa.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/verificacion-nfc-fixed" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Abrir Verificación NFC
                </Button>
              </a>
            </CardFooter>
          </Card>
          
          {/* Selección de Documentos */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-blue-700 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Selección de Documentos
              </CardTitle>
              <CardDescription>
                Selecciona documentos para procesar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Accede directamente a la selección de documentos para iniciar un trámite
                de certificación o verificación.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/document-selection" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Abrir Selección de Documentos
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Pagos POS */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-green-700 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Terminal POS
              </CardTitle>
              <CardDescription>
                Acceso al terminal de pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Accede directamente al menú de terminales POS para realizar pagos
                con MercadoPago integrado.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/pos" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Abrir Terminal POS
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* WebApp POS Oficial */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-purple-100">
              <CardTitle className="text-purple-700 flex items-center">
                <QrCode className="mr-2 h-5 w-5" />
                WebApp POS Oficial
              </CardTitle>
              <CardDescription>
                Aplicación web POS completa
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Accede a la versión completa de la aplicación web POS para Vecinos,
                con todas las funcionalidades integradas.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/partners/webapp-pos-official" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Abrir WebApp POS
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Iniciar Trámite */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-amber-100">
              <CardTitle className="text-amber-700 flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Iniciar Trámite
              </CardTitle>
              <CardDescription>
                Flujo completo de inicio de trámite
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Inicia el flujo completo de trámites desde el principio,
                incluyendo el asistente para elección de documentos.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/iniciar-tramite" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Iniciar Trámite
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Login al sistema */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-red-100">
              <CardTitle className="text-red-700 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </CardTitle>
              <CardDescription>
                Acceso al sistema con credenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Accede al sistema con tus credenciales para usar todas las funcionalidades
                disponibles según tu rol de usuario.
              </p>
            </CardContent>
            <CardFooter>
              <a href="/auth" className="w-full" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Iniciar Sesión
                </Button>
              </a>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="mt-8 bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} NotaryPro - Todos los derechos reservados</p>
          <p className="text-sm mt-2 text-gray-400">
            Esta página proporciona acceso directo a las funciones principales del sistema
            para facilitar pruebas y desarrollo.
          </p>
        </div>
      </footer>
    </div>
  );
}