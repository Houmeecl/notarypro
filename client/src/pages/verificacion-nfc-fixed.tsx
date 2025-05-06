import React, { useState, useEffect } from 'react';
import NFCReader from '@/components/identity/NFCReader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Info, Shield, Smartphone } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { PageNavigation } from '@/components/navigation/PageNavigation';
import {
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertCircle,
  Camera,
  CreditCard,
  CheckCircle,
  Upload,
  User,
  ChevronRight,
  Smartphone,
  QrCode,
  Shield,
  AlertTriangle,
  ExternalLink,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const VerificacionNFC: React.FC = () => {
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [modoDemo, setModoDemo] = useState(false);
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const verificationCode = queryParams.get('code');

  useEffect(() => {
    // Comprobar si el navegador soporta NFC
    checkNFCSupport();
  }, []);

  const checkNFCSupport = () => {
    if ('NDEFReader' in window) {
      setNfcAvailable(true);
      console.log("✅ NFC API disponible en este navegador");
    } else {
      setNfcAvailable(false);
      console.log("❌ NFC API no disponible en este navegador");
    }
  };

  // Manejar verificación exitosa
  const handleNFCSuccess = (data: any) => {
    setVerificationComplete(true);
    setVerificationData(data);
    setError(null);

    console.log('Verificación NFC completada con los datos:', data);

    toast({
      title: "Verificación exitosa",
      description: "Los datos de su documento han sido verificados correctamente",
      variant: 'default',
    });
  };

  // Formatear datos de verificación para mostrar
  const renderVerificationData = () => {
    if (!verificationData) return null;

    // Extraer información relevante
    const records = verificationData.records || [];
    const extractedData: {[key: string]: string} = {};

    records.forEach((record: any) => {
      if (record.type === 'text' && record.text) {
        const parts = record.text.split(':');
        if (parts.length === 2) {
          extractedData[parts[0]] = parts[1];
        }
      }
    });

    return (
      <div className="mt-6 p-4 border rounded-lg bg-green-50">
        <div className="flex items-center mb-4">
          <CheckCircle className="text-green-600 mr-2" />
          <h3 className="text-lg font-medium">Verificación completada</h3>
        </div>

        <Separator className="my-2" />

        <div className="space-y-2 mt-3">
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-700">{key}:</span>
              <span className="col-span-2">{value}</span>
            </div>
          ))}

          {verificationData.serialNumber && (
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium text-gray-700">N° Serie:</span>
              <span className="col-span-2 font-mono text-xs">{verificationData.serialNumber}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Definir las migas de pan para navegación
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Verificación de Identidad', href: '/verificacion-nfc' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <PageNavigation 
          items={breadcrumbItems} 
          backTo="/"
          backLabel="Volver al inicio"
          className="mb-6"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Verificación de documento</CardTitle>
                <CardDescription>
                  Acerque su cédula o documento de identidad al dispositivo para leer el chip NFC.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {nfcAvailable === false && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este dispositivo o navegador no es compatible con NFC. Intente con un dispositivo Android compatible.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-4">
                  <NFCReader 
                    onSuccess={handleNFCSuccess}
                    onError={(error) => {
                      setError(`Error en la lectura NFC: ${error}`);
                      toast({
                        title: 'Error NFC',
                        description: error,
                        variant: 'destructive',
                      });
                    }}
                    demoMode={modoDemo}
                  />
                </div>

                {verificationComplete && renderVerificationData()}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setModoDemo(!modoDemo)}
                >
                  {modoDemo ? "Desactivar Modo Demo" : "Activar Modo Demo"}
                </Button>

                {verificationComplete && (
                  <Button onClick={() => {
                    setVerificationComplete(false);
                    setVerificationData(null);
                    setError(null);
                  }}>
                    Nueva verificación
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Cómo funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Preparar documento</h3>
                  <p className="text-sm text-gray-600">
                    Asegúrese de que su cédula de identidad o pasaporte tenga chip NFC.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Iniciar escaneo</h3>
                  <p className="text-sm text-gray-600">
                    Presione el botón "Iniciar Lectura NFC" para activar el lector NFC de su dispositivo.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Acercar documento</h3>
                  <p className="text-sm text-gray-600">
                    Coloque su documento cerca del lector NFC de su dispositivo móvil (generalmente en la parte trasera).
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Mantener documento</h3>
                  <p className="text-sm text-gray-600">
                    No mueva el documento hasta que se complete la lectura. El proceso toma unos segundos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Solución de problemas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">NFC no detectado:</p>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Verifica que NFC esté activado en Configuración</li>
                    <li>Reinicia la tablet o dispositivo</li>
                    <li>Asegúrate de usar Chrome actualizado</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Detección inconsistente:</p>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Prueba diferentes posiciones en la parte trasera</li>
                    <li>Quita fundas o protectores</li>
                    <li>Evita superficies metálicas</li>
                    <li>Mantén la tarjeta inmóvil durante la lectura</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Si nada funciona:</p>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Activa el modo demo para probar la interfaz</li>
                    <li>Descarga la app NFC Tools para verificar el hardware</li>
                    <li>Consulta SOLUCIONAR_PROBLEMAS_NFC_LENOVO.md para más detalles</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-[#2d219b]" />
                  Compatibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Para utilizar la verificación NFC, necesita:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Un smartphone o tablet con lector NFC</li>
                  <li>Chrome 89+ en Android</li>
                  <li>Cédula o pasaporte con chip NFC (posteriores a 2013)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificacionNFC;