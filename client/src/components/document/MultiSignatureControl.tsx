import React, { useState } from 'react';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { User, Plus, UserPlus, QrCode, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Signatory {
  id: number;
  name: string;
  email: string;
  hasSigned: boolean;
}

interface MultiSignatureControlProps {
  documentId: number;
  documentName: string;
}

export function MultiSignatureControl({ documentId, documentName }: MultiSignatureControlProps) {
  const { isFunctionalMode } = useRealFuncionality();
  const { toast } = useToast();
  const [signatories, setSignatories] = useState<Signatory[]>([
    { id: 1, name: '', email: '', hasSigned: false }
  ]);
  const [enableMultiple, setEnableMultiple] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedSignatory, setSelectedSignatory] = useState<Signatory | null>(null);
  const [signingUrl, setSigningUrl] = useState('');
  
  // Agregar otro firmante
  const addSignatory = () => {
    if (signatories.length < 2) {
      setSignatories([
        ...signatories,
        { id: signatories.length + 1, name: '', email: '', hasSigned: false }
      ]);
    }
  };
  
  // Actualizar datos de firmante
  const updateSignatory = (id: number, field: keyof Signatory, value: string | boolean) => {
    setSignatories(
      signatories.map(signatory => 
        signatory.id === id ? { ...signatory, [field]: value } : signatory
      )
    );
  };
  
  // Generar URL de firma móvil
  const generateSigningUrl = (signatoryId: number) => {
    const signatory = signatories.find(s => s.id === signatoryId);
    if (!signatory) return;
    
    // Crear una URL única para esta firma específica
    const baseUrl = window.location.origin;
    const uniqueToken = `${documentId}-${signatoryId}-${Date.now()}`;
    const url = `${baseUrl}/sign-mobile/${uniqueToken}`;
    
    setSigningUrl(url);
    setSelectedSignatory(signatory);
    setShowQRDialog(true);
    
    if (isFunctionalMode) {
      console.log(`✅ URL de firma generada en modo funcional real: ${url}`);
    }
  };
  
  // Simular firma completada desde móvil
  const completeSignature = (id: number) => {
    updateSignatory(id, 'hasSigned', true);
    setShowQRDialog(false);
    
    toast({
      title: "Firma completada",
      description: "La firma se ha completado exitosamente desde el dispositivo móvil.",
      duration: 3000,
    });
    
    if (isFunctionalMode) {
      console.log(`✅ Firma completada en modo funcional real para firmante ID: ${id}`);
    }
  };
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Opciones de firma</CardTitle>
            {isFunctionalMode && (
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Ley 19.799
              </div>
            )}
          </div>
          <CardDescription>
            Configure quién necesita firmar este documento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="multiple-signers"
                checked={enableMultiple}
                onCheckedChange={setEnableMultiple}
              />
              <Label htmlFor="multiple-signers">Habilitar múltiples firmantes</Label>
            </div>
            
            {signatories.map((signatory, index) => (
              <div key={signatory.id} className="space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Firmante {index + 1}</span>
                  {signatory.hasSigned && (
                    <div className="ml-auto flex items-center gap-1 text-green-600 text-sm">
                      <Check className="h-4 w-4" />
                      <span>Firmado</span>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${signatory.id}`}>Nombre</Label>
                      <Input 
                        id={`name-${signatory.id}`}
                        value={signatory.name}
                        onChange={(e) => updateSignatory(signatory.id, 'name', e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${signatory.id}`}>Email</Label>
                      <Input 
                        id={`email-${signatory.id}`}
                        value={signatory.email}
                        onChange={(e) => updateSignatory(signatory.id, 'email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => generateSigningUrl(signatory.id)}
                      disabled={signatory.hasSigned}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Firmar con móvil</span>
                    </Button>
                    
                    {/* Botón para simular firma (solo para demostración) */}
                    {!signatory.hasSigned && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => completeSignature(signatory.id)}
                      >
                        <span className="text-xs">(Simular firma)</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {enableMultiple && signatories.length < 2 && (
              <Button 
                variant="outline" 
                className="mt-3 w-full flex items-center justify-center gap-1"
                onClick={addSignatory}
              >
                <UserPlus className="h-4 w-4" />
                <span>Agregar firmante</span>
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            disabled={signatories.some(s => !s.hasSigned)}
          >
            {signatories.every(s => s.hasSigned) 
              ? "Finalizar proceso de firma" 
              : "Esperando firmas..."}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Diálogo de código QR */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Continuar firma en dispositivo móvil</DialogTitle>
            <DialogDescription>
              Escanee este código QR con su dispositivo móvil para continuar el proceso de firma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-3 rounded-lg mb-4">
              <QRCode 
                value={signingUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-500 text-center mb-2">
              Documento: <span className="font-medium">{documentName}</span>
            </p>
            {selectedSignatory && (
              <p className="text-sm text-gray-500 text-center">
                Firmante: <span className="font-medium">{selectedSignatory.name || "Sin nombre"}</span>
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-4 bg-blue-50 rounded-md p-3 w-full">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Al escanear este código, se abrirá la aplicación de firma en su dispositivo móvil para completar el proceso.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Cancelar
            </Button>
            {selectedSignatory && (
              <Button onClick={() => completeSignature(selectedSignatory.id)}>
                Confirmar firma
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MultiSignatureControl;