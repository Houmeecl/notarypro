import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PenTool, 
  Shield, 
  RefreshCw, 
  Check, 
  Copy, 
  Download, 
  AlertCircle, 
  Info,
  UserCheck
} from 'lucide-react';
import SignatureCanvas from '@/components/signatures/SignatureCanvas';
import SignatureDisplay from '@/components/signatures/SignatureDisplay';
import SignatureModal from '@/components/signatures/SignatureModal';
import ETokenSigner from '@/components/signatures/ETokenSigner';
import VerificacionSimple from '@/components/identity/VerificacionSimple';
import PageHeader from '@/components/layout/PageHeader';
import DocumentSignatureSection from '@/components/document/DocumentSignatureSection';
import { useToast } from '@/hooks/use-toast';

const mockDocumentData = {
  id: '10001',
  title: 'Contrato de compraventa de vehículo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pending_signature'
};

export default function SignatureDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('simple');
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [certifierSignature, setCertifierSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'client' | 'certifier'>('client');
  
  // Estados para los nuevos componentes
  const [isVerificacionSimpleOpen, setIsVerificacionSimpleOpen] = useState(false);
  const [isIdentidadVerificada, setIsIdentidadVerificada] = useState(false);
  const [isETokenSignerOpen, setIsETokenSignerOpen] = useState(false);
  
  // Comprobar verificación de identidad antes de permitir firma
  const verificarAntesDeModalFirma = (type: 'client' | 'certifier') => {
    setModalType(type);
    
    if (type === 'client') {
      // Para firma simple, verificar identidad primero
      if (!isIdentidadVerificada) {
        setIsVerificacionSimpleOpen(true);
      } else {
        setIsModalOpen(true);
      }
    } else {
      // Para firma avanzada, abrir directamente el componente de eToken
      setIsETokenSignerOpen(true);
    }
  };

  // Simulación de firma completada
  const handleSignatureComplete = (type: 'client' | 'certifier', data: string) => {
    toast({
      title: `Firma ${type === 'certifier' ? 'avanzada' : 'simple'} completada`,
      description: `La firma ${type === 'certifier' ? 'avanzada' : 'simple'} ha sido registrada exitosamente.`,
    });

    if (type === 'client') {
      setClientSignature(data);
    } else {
      setCertifierSignature(data);
    }
  };

  // Manejar la verificación de identidad completada
  const handleVerificacionCompletada = () => {
    setIsIdentidadVerificada(true);
    // Abrir automáticamente el modal de firma después de la verificación
    setIsModalOpen(true);
  };
  
  // Manejar la firma con eToken completada
  const handleETokenSignatureComplete = (data: string) => {
    handleSignatureComplete('certifier', data);
    setIsETokenSignerOpen(false);
  };

  // Apertura de modal según tipo (versión sin verificación - no se usa directamente ahora)
  const openModal = (type: 'client' | 'certifier') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Resetear firmas para nuevo ejemplo
  const resetSignatures = () => {
    setClientSignature(null);
    setCertifierSignature(null);
    setIsIdentidadVerificada(false);
    toast({
      title: 'Firmas restablecidas',
      description: 'Se han eliminado todas las firmas de demostración.',
    });
  };

  return (
    <div className="container max-w-6xl py-6">
      <PageHeader
        title="Demostración de firma electrónica"
        description="Sistema integrado de firma electrónica simple y avanzada"
        icon={<PenTool className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Componentes de firma</CardTitle>
              <CardDescription>
                Explore las diferentes formas de implementar firmas electrónicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="simple" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="simple">Firma Simple</TabsTrigger>
                  <TabsTrigger value="advanced">Firma Avanzada</TabsTrigger>
                </TabsList>
                <TabsContent value="simple" className="pt-4">
                  <div className="space-y-4">
                    <Alert variant="default">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Firma electrónica simple</AlertTitle>
                      <AlertDescription>
                        Permite al usuario registrar su firma manuscrita de forma digital previa verificación de identidad.
                      </AlertDescription>
                    </Alert>
                    
                    {clientSignature ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Firma registrada:</div>
                        <SignatureDisplay
                          signatureData={clientSignature}
                          signatureType="client"
                          signerName="Usuario de prueba"
                          timestamp={new Date().toLocaleString()}
                        />
                      </div>
                    ) : (
                      <SignatureCanvas
                        onSignatureComplete={() => {}}
                        signatureType="client"
                      />
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      {clientSignature ? (
                        <Button 
                          onClick={() => setClientSignature(null)}
                          variant="outline"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Nueva firma
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => verificarAntesDeModalFirma('client')}
                          className="bg-[#2d219b] hover:bg-[#221a7c]"
                        >
                          <PenTool className="h-4 w-4 mr-2" />
                          {isIdentidadVerificada ? 'Firmar ahora' : 'Verificar y firmar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="pt-4">
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertTitle>Firma electrónica avanzada</AlertTitle>
                      <AlertDescription>
                        Realizada por certificadores utilizando un dispositivo físico eToken de eCert Chile para validar documentos oficialmente.
                      </AlertDescription>
                    </Alert>
                    
                    {certifierSignature ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Firma registrada:</div>
                        <SignatureDisplay
                          signatureData={certifierSignature}
                          signatureType="certifier"
                          signerName="Certificador oficial"
                          timestamp={new Date().toLocaleString()}
                          verificationInfo={{
                            verifiedAt: new Date().toLocaleString(),
                            verifiedBy: "Sistema NotaryPro",
                            verificationMethod: "Firma electrónica avanzada"
                          }}
                        />
                      </div>
                    ) : (
                      <SignatureCanvas
                        onSignatureComplete={() => {}}
                        signatureType="certifier"
                      />
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      {certifierSignature ? (
                        <Button 
                          onClick={() => setCertifierSignature(null)} 
                          variant="outline"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Nueva firma
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => verificarAntesDeModalFirma('certifier')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Firmar con eToken
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={resetSignatures}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar demo
              </Button>
              <Button variant="outline" onClick={() => {
                toast({
                  title: "¡Código copiado!",
                  description: "Código del componente copiado al portapapeles."
                });
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar código
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información técnica</CardTitle>
              <CardDescription>
                Detalles sobre la implementación de firmas electrónicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Firma electrónica simple</h3>
                <p className="text-muted-foreground">
                  Implementada utilizando un canvas para capturar la firma del usuario con previa verificación de identidad.
                  Se almacena como una imagen base64 en la base de datos y requiere autenticación del firmante.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Firma electrónica avanzada</h3>
                <p className="text-muted-foreground">
                  Implementada utilizando dispositivos físicos eToken de eCert Chile
                  por certificadores autorizados. Incluye firma digital certificada y
                  cumple con la Ley 19.799 sobre documentos electrónicos, otorgando validez legal.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Verificación y validez legal</h3>
                <p className="text-muted-foreground">
                  Las firmas incluyen metadatos de verificación, como fecha y hora,
                  información del firmante y método de verificación utilizado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Flujo completo de firmas</CardTitle>
              <CardDescription>
                Visualización del proceso de firma y certificación en documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Documento pendiente</AlertTitle>
                <AlertDescription>
                  Este es un ejemplo de documento que requiere firma y certificación.
                </AlertDescription>
              </Alert>
              
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold">{mockDocumentData.title}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  Documento creado: {new Date(mockDocumentData.createdAt).toLocaleString()}
                </div>
                <div className="mt-4 text-sm">
                  <p>Este documento contiene un contrato de compraventa entre las partes...</p>
                  <p className="mt-2">El documento completo puede ser visualizado por los firmantes.</p>
                </div>
              </div>

              <DocumentSignatureSection
                documentId={mockDocumentData.id}
                documentStatus={mockDocumentData.status}
                clientSignature={clientSignature}
                certifierSignature={certifierSignature}
                clientName="Juan Pérez"
                certifierName="Pedro Notario"
                createdAt={mockDocumentData.createdAt}
                certifiedAt={certifierSignature ? new Date().toISOString() : undefined}
                userRole="user"
                onSignatureComplete={() => {
                  toast({
                    title: "Firma registrada",
                    description: "El documento ha sido firmado correctamente.",
                  });
                }}
              />

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar documento
                </Button>
                {clientSignature && certifierSignature && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    Finalizar trámite
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales de firma */}
      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(data) => {
          handleSignatureComplete(modalType, data);
          setIsModalOpen(false);
        }}
        title={modalType === 'client' ? 'Firma electrónica simple' : 'Firma electrónica avanzada'}
        description={
          modalType === 'client'
            ? 'Dibuje su firma en el recuadro a continuación. Recuerde que para la implementación real se requiere verificación previa de identidad.'
            : 'Como certificador, utilice su eToken de eCert Chile para firmar digitalmente y otorgar validez legal según la Ley 19.799.'
        }
        signatureType={modalType}
      />
      
      {/* Componente de verificación de identidad simple */}
      <VerificacionSimple
        isOpen={isVerificacionSimpleOpen}
        onClose={() => setIsVerificacionSimpleOpen(false)}
        onVerificacionCompletada={handleVerificacionCompletada}
      />
      
      {/* Componente de firma con eToken */}
      <ETokenSigner
        isOpen={isETokenSignerOpen}
        onClose={() => setIsETokenSignerOpen(false)}
        onSignatureComplete={handleETokenSignatureComplete}
        documentId={mockDocumentData.id}
      />
    </div>
  );
}