import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Info, AlertCircle } from 'lucide-react';
import { IdentityVerificationForm } from '@/components/identity/IdentityVerificationForm';

export default function VerificacionIdentidadDemo() {
  const [demoType, setDemoType] = useState<string>('basic');
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Helmet>
        <title>Demostración Validación de Identidad - NotaryPro</title>
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Demostración de Validación de Identidad</h1>
          <p className="text-gray-600">
            Esta página muestra cómo implementar la verificación de identidad utilizando GetAPI.cl
            en cumplimiento con la legislación chilena sobre firma electrónica.
          </p>
          
          <Alert className="my-4 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Esta es una demostración que utiliza la API real de GetAPI.cl. Los datos introducidos serán enviados
              al servicio de validación y almacenados conforme a su política de privacidad.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue={demoType} onValueChange={setDemoType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básica</TabsTrigger>
                <TabsTrigger value="document">Con Documento</TabsTrigger>
                <TabsTrigger value="biometric">Biométrica</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación Básica</CardTitle>
                    <CardDescription>
                      Validación de identidad usando RUT, nombre y apellido
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IdentityVerificationForm
                      onVerificationComplete={(result) => {
                        console.log('Verificación completada:', result);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="document">
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación con Documento</CardTitle>
                    <CardDescription>
                      Validación de identidad usando documento de identidad más información básica
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IdentityVerificationForm
                      documentRequired={true}
                      onVerificationComplete={(result) => {
                        console.log('Verificación con documento completada:', result);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="biometric">
                <Card>
                  <CardHeader>
                    <CardTitle>Verificación Biométrica</CardTitle>
                    <CardDescription>
                      Validación completa usando documento de identidad más reconocimiento facial (selfie)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IdentityVerificationForm
                      documentRequired={true}
                      selfieRequired={true}
                      onVerificationComplete={(result) => {
                        console.log('Verificación biométrica completada:', result);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información sobre el demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Tipo de validación:</h3>
                    <p className="text-sm text-gray-600">
                      {demoType === 'basic' && 'Verificación básica de identidad mediante datos personales solamente.'}
                      {demoType === 'document' && 'Verificación mediante datos personales y documento de identidad.'}
                      {demoType === 'biometric' && 'Verificación completa con datos, documento y reconocimiento facial.'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Nivel de seguridad:</h3>
                    <div className="flex items-center">
                      <div className="h-2 bg-gray-200 rounded-full w-full">
                        <div 
                          className={`h-2 rounded-full ${
                            demoType === 'basic' 
                              ? 'w-1/3 bg-yellow-500' 
                              : demoType === 'document' 
                                ? 'w-2/3 bg-green-500' 
                                : 'w-full bg-green-600'
                          }`} 
                        />
                      </div>
                      <span className="ml-2 text-sm">
                        {demoType === 'basic' && 'Básico'}
                        {demoType === 'document' && 'Alto'}
                        {demoType === 'biometric' && 'Máximo'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Cumplimiento legal:</h3>
                    <p className="text-sm text-gray-600">
                      {demoType === 'basic' && 'Cumple con requisitos básicos de la Ley 19.799.'}
                      {demoType === 'document' && 'Cumple con requisitos de firma electrónica simple según Ley 19.799.'}
                      {demoType === 'biometric' && 'Cumple con requisitos de firma electrónica avanzada según Ley 19.799.'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Casos de uso:</h3>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      {demoType === 'basic' && (
                        <>
                          <li>Verificaciones de identidad rápidas</li>
                          <li>Procesos de bajo riesgo</li>
                          <li>Primera fase de validación</li>
                        </>
                      )}
                      {demoType === 'document' && (
                        <>
                          <li>Contratos electrónicos</li>
                          <li>Procesos notariales simples</li>
                          <li>Verificación para trámites oficiales</li>
                        </>
                      )}
                      {demoType === 'biometric' && (
                        <>
                          <li>Documentos legales de alta importancia</li>
                          <li>Procesos notariales con valor legal completo</li>
                          <li>Firma digital avanzada</li>
                          <li>Trámites sensibles (bancarios, gubernamentales)</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.getapi.cl/identity-validation/"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentación de GetAPI.cl
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/downloads/guia-integracion-getapi.md"
                      target="_blank" 
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Guía de integración completa
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.bcn.cl/leychile/navegar?idNorma=196640"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ley 19.799 sobre firma electrónica
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Importante:</strong> En un entorno de producción, asegúrese de implementar medidas adicionales de 
                seguridad y privacidad para el manejo de datos personales según la ley chilena.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}