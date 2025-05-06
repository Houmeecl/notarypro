import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pen, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import SignatureModal from '@/components/signatures/SignatureModal';
import SignatureDisplay from '@/components/signatures/SignatureDisplay';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

interface DocumentSignatureSectionProps {
  documentId: string | number;
  documentStatus: string;
  clientSignature?: string | null;
  certifierSignature?: string | null;
  clientName?: string;
  certifierName?: string;
  createdAt?: string;
  certifiedAt?: string;
  userRole?: string;
  onSignatureComplete?: () => void;
}

const DocumentSignatureSection: React.FC<DocumentSignatureSectionProps> = ({
  documentId,
  documentStatus,
  clientSignature,
  certifierSignature,
  clientName = 'Cliente',
  certifierName,
  createdAt,
  certifiedAt,
  userRole = 'user',
  onSignatureComplete
}) => {
  const [isClientSignatureModalOpen, setIsClientSignatureModalOpen] = useState(false);
  const [isCertifierSignatureModalOpen, setIsCertifierSignatureModalOpen] = useState(false);
  const { toast } = useToast();

  // Formatear fechas
  const formattedCreatedAt = createdAt ? new Date(createdAt).toLocaleString() : undefined;
  const formattedCertifiedAt = certifiedAt ? new Date(certifiedAt).toLocaleString() : undefined;

  // Mutation para guardar la firma del cliente
  const clientSignatureMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      const response = await apiRequest('POST', `/api/documents/${documentId}/client-signature`, {
        signatureData,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Firma registrada',
        description: 'Su firma ha sido añadida al documento correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      if (onSignatureComplete) onSignatureComplete();
    },
    onError: (error) => {
      toast({
        title: 'Error al firmar',
        description: 'No se pudo guardar la firma. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para guardar la firma del certificador
  const certifierSignatureMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      const response = await apiRequest('POST', `/api/documents/${documentId}/certifier-signature`, {
        signatureData,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Documento certificado',
        description: 'El documento ha sido certificado correctamente con firma electrónica avanzada.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      if (onSignatureComplete) onSignatureComplete();
    },
    onError: (error) => {
      toast({
        title: 'Error al certificar',
        description: 'No se pudo guardar la certificación. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  // Handlers para las firmas
  const handleClientSignature = (signatureData: string) => {
    clientSignatureMutation.mutate(signatureData);
  };

  const handleCertifierSignature = (signatureData: string) => {
    certifierSignatureMutation.mutate(signatureData);
  };

  // Determinar si el usuario puede firmar basado en su rol y el estado del documento
  const canClientSign = userRole === 'user' && ['draft', 'pending'].includes(documentStatus) && !clientSignature;
  const canCertifierSign = (userRole === 'certifier' || userRole === 'admin') && 
                          ['signed', 'pending_certification'].includes(documentStatus) && 
                          clientSignature && !certifierSignature;

  return (
    <div className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Pen className="h-5 w-5 mr-2 text-[#2d219b]" />
            Firmas y certificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sección de firma del cliente */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <UserCheck className="h-4 w-4 mr-2 text-gray-600" />
              Firma del titular
            </h4>
            
            {clientSignature ? (
              <div className="max-w-md">
                <SignatureDisplay 
                  signatureData={clientSignature}
                  signatureType="client"
                  signerName={clientName}
                  timestamp={formattedCreatedAt}
                />
              </div>
            ) : (
              <div>
                {canClientSign ? (
                  <div className="flex flex-col space-y-2">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Firma requerida</AlertTitle>
                      <AlertDescription>
                        Se requiere su firma para procesar este documento.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => setIsClientSignatureModalOpen(true)}
                      className="max-w-xs bg-[#2d219b] hover:bg-[#221a7c]"
                    >
                      <Pen className="h-4 w-4 mr-2" />
                      Firmar documento
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Este documento aún no ha sido firmado por el titular.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Línea separadora */}
          <div className="border-t my-4"></div>

          {/* Sección de certificación */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              Certificación oficial
            </h4>
            
            {certifierSignature ? (
              <div className="max-w-md">
                <SignatureDisplay 
                  signatureData={certifierSignature}
                  signatureType="certifier"
                  signerName={certifierName || "Certificador oficial"}
                  timestamp={formattedCertifiedAt}
                  verificationInfo={{
                    verifiedAt: formattedCertifiedAt,
                    verifiedBy: certifierName,
                    verificationMethod: "Firma electrónica avanzada"
                  }}
                />
              </div>
            ) : (
              <div>
                {canCertifierSign ? (
                  <div className="flex flex-col space-y-2">
                    <Alert className="bg-green-50 border-green-200">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertTitle>Certificación requerida</AlertTitle>
                      <AlertDescription>
                        Como certificador, puede certificar este documento con firma electrónica avanzada.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => setIsCertifierSignatureModalOpen(true)}
                      className="max-w-xs bg-green-600 hover:bg-green-700"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Certificar documento
                    </Button>
                  </div>
                ) : clientSignature ? (
                  <div className="text-sm text-gray-500 italic">
                    Documento firmado pero pendiente de certificación oficial.
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Se requiere firma del titular antes de que pueda ser certificado.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para la firma del cliente */}
      <SignatureModal
        isOpen={isClientSignatureModalOpen}
        onClose={() => setIsClientSignatureModalOpen(false)}
        onConfirm={handleClientSignature}
        title="Firma electrónica simple"
        description="Su firma confirma que es el titular de este documento y acepta su contenido."
        signatureType="client"
      />

      {/* Modal para la firma del certificador */}
      <SignatureModal
        isOpen={isCertifierSignatureModalOpen}
        onClose={() => setIsCertifierSignatureModalOpen(false)}
        onConfirm={handleCertifierSignature}
        title="Certificación con firma electrónica avanzada"
        description="Su firma certifica este documento otorgándole validez legal conforme a la Ley 19.799."
        signatureType="certifier"
      />
    </div>
  );
};

export default DocumentSignatureSection;