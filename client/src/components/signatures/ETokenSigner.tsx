import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

// Interfaz para las propiedades del componente
interface ETokenSignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureComplete: (tokenSignatureData: string) => void;
  documentHash?: string; // Hash del documento a firmar
  documentId?: string; // ID del documento
}

// Estados posibles durante el proceso de firma
type SigningStatus = 'idle' | 'connecting' | 'detecting' | 'signing' | 'completed' | 'error';

/**
 * Componente para firma electrónica avanzada con eToken de eCert Chile
 * 
 * Este componente simula la integración con el dispositivo eToken para firmar
 * documentos con certificado digital según la Ley 19.799
 */
export default function ETokenSigner({ 
  isOpen, 
  onClose, 
  onSignatureComplete,
  documentHash = "",
  documentId = ""
}: ETokenSignerProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<SigningStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<{
    serialNumber: string;
    issuer: string;
    validUntil: string;
  } | null>(null);

  // Simular la detección del dispositivo eToken
  useEffect(() => {
    if (isOpen && status === 'idle') {
      detectToken();
    }
  }, [isOpen, status]);

  // Función que simula la detección del dispositivo eToken
  const detectToken = () => {
    setStatus('connecting');
    // Simulamos un tiempo de espera para la detección del dispositivo
    setTimeout(() => {
      setStatus('detecting');
      // Simulamos la detección del dispositivo después de un tiempo
      setTimeout(() => {
        // Simulamos un 80% de probabilidad de éxito
        if (Math.random() > 0.2) {
          setTokenInfo({
            serialNumber: 'EC' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
            issuer: 'eCert Chile CA',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          });
          setStatus('idle');
        } else {
          setErrorMessage('No se pudo detectar el dispositivo eToken. Verifique que esté correctamente conectado.');
          setStatus('error');
        }
      }, 1500);
    }, 1000);
  };

  // Función que simula la firma con el dispositivo eToken
  const signWithToken = () => {
    if (!tokenInfo) {
      setErrorMessage('No se detectó un dispositivo eToken válido.');
      setStatus('error');
      return;
    }

    setStatus('signing');
    // Simulamos el proceso de firma electrónica
    setTimeout(() => {
      // Simulamos un 90% de probabilidad de éxito
      if (Math.random() > 0.1) {
        // Generamos un "certificado" simulado
        const signatureData = {
          tokenSerial: tokenInfo.serialNumber,
          timestamp: new Date().toISOString(),
          documentHash: documentHash || `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          documentId: documentId,
          certificateData: `MIIEpDCCA4ygAwIBAgIEByVu+T${Math.random().toString(36).substring(2)}`,
          certificateAuthority: 'eCert Chile',
        };
        
        setStatus('completed');
        // Convertimos a string y luego enviamos al componente padre
        setTimeout(() => {
          onSignatureComplete(JSON.stringify(signatureData));
          toast({
            title: "Firma electrónica avanzada completada",
            description: "El documento ha sido firmado con su certificado digital.",
          });
        }, 1000);
      } else {
        setErrorMessage('Error al firmar el documento. Intente nuevamente o verifique su certificado.');
        setStatus('error');
      }
    }, 2000);
  };

  // Función para reintentar en caso de error
  const retryOperation = () => {
    setErrorMessage('');
    setStatus('idle');
    detectToken();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-green-600" />
            Firma Electrónica Avanzada con eToken
          </DialogTitle>
          <DialogDescription>
            Utilice su dispositivo eToken de eCert Chile para firmar digitalmente este documento.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Estado: Conectando */}
          {status === 'connecting' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-sm">Conectando con el sistema de firmas...</p>
            </div>
          )}

          {/* Estado: Detectando */}
          {status === 'detecting' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-center text-sm">Detectando dispositivo eToken...</p>
              <p className="text-center text-xs text-muted-foreground">
                Asegúrese de que su eToken esté correctamente conectado al equipo.
              </p>
            </div>
          )}

          {/* Estado: Firmando */}
          {status === 'signing' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <p className="text-center text-sm">Procesando firma digital avanzada...</p>
              <p className="text-center text-xs text-muted-foreground">
                Se está aplicando el certificado digital al documento.
              </p>
            </div>
          )}

          {/* Estado: Completado */}
          {status === 'completed' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-center font-medium">¡Firma completada con éxito!</p>
              <p className="text-center text-sm text-muted-foreground">
                El documento ha sido firmado digitalmente con su certificado.
              </p>
            </div>
          )}

          {/* Estado: Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-center font-medium text-destructive">Error en el proceso</p>
              <p className="text-center text-sm">{errorMessage}</p>
              <Button variant="outline" onClick={retryOperation}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Estado: Dispositivo detectado, listo para firmar */}
          {status === 'idle' && tokenInfo && (
            <div className="space-y-4">
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                <AlertTitle>Dispositivo eToken detectado</AlertTitle>
                <AlertDescription>
                  Su dispositivo de firma electrónica avanzada está listo para usar.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-md border">
                <h4 className="text-sm font-medium mb-2">Información del certificado:</h4>
                <dl className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-sm">
                  <dt className="font-medium text-gray-500">Serie:</dt>
                  <dd>{tokenInfo.serialNumber}</dd>
                  <dt className="font-medium text-gray-500">Emisor:</dt>
                  <dd>{tokenInfo.issuer}</dd>
                  <dt className="font-medium text-gray-500">Válido hasta:</dt>
                  <dd>{tokenInfo.validUntil}</dd>
                </dl>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  Al firmar este documento, usted declara que está utilizando su certificado
                  digital personal y que acepta los términos legales asociados con la
                  firma electrónica avanzada según la Ley 19.799.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          {status !== 'connecting' && status !== 'detecting' && status !== 'signing' && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          
          {status === 'idle' && tokenInfo && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={signWithToken}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Firmar con certificado digital
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}