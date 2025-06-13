import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ETokenSupportProps {
  onTokenSelected: (tokenInfo: TokenInfo) => void;
  onCancel: () => void;
}

export interface TokenInfo {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  issuer: string;
  validUntil: string;
}

// Lista de certificados digitales disponibles en el sistema (simulados)
const AVAILABLE_CERTIFICATES: TokenInfo[] = [
  {
    id: "token-1",
    name: "Certificado FirmaDigital E-TOKEN",
    type: "Avanzada",
    serialNumber: "ETO-25F8-2023-9A21",
    issuer: "Autoridad Certificadora Nacional",
    validUntil: "2025-12-31"
  },
  {
    id: "token-2",
    name: "Certificado FEA Nivel Alto",
    type: "Firma Electrónica Avanzada",
    serialNumber: "FEA-2022-0019289",
    issuer: "Entidad Certificadora Autorizada",
    validUntil: "2024-08-15"
  },
  {
    id: "token-3",
    name: "Clave Única Certificado",
    type: "Simple",
    serialNumber: "CL-RUN-2023-01522",
    issuer: "Servicio de Registro Civil",
    validUntil: "2026-03-10"
  }
];

const ETokenSupport: React.FC<ETokenSupportProps> = ({ onTokenSelected, onCancel }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [tokenDetectionStatus, setTokenDetectionStatus] = useState<"idle" | "detecting" | "detected" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  // Simula la detección de tokens de firma electrónica conectados
  const detectConnectedTokens = async () => {
    setIsDetecting(true);
    setTokenDetectionStatus("detecting");
    
    // Simulación de la detección de dispositivos
    setTimeout(() => {
      try {
        // En un entorno real, esto sería reemplazado por la detección real de dispositivos
        setAvailableTokens(AVAILABLE_CERTIFICATES);
        setTokenDetectionStatus("detected");
        toast({
          title: "Dispositivos detectados",
          description: `Se han encontrado ${AVAILABLE_CERTIFICATES.length} certificados disponibles.`,
        });
      } catch (error) {
        setTokenDetectionStatus("error");
        setErrorMessage("No se pudieron detectar dispositivos de firma electrónica. Por favor, asegúrese de que su dispositivo esté conectado correctamente.");
        toast({
          title: "Error de detección",
          description: "No se pudieron detectar dispositivos de firma electrónica.",
          variant: "destructive",
        });
      } finally {
        setIsDetecting(false);
      }
    }, 2000);
  };

  useEffect(() => {
    // Detectar tokens al montar el componente
    detectConnectedTokens();
  }, []);

  const handleSelectToken = () => {
    const selectedToken = availableTokens.find(token => token.id === selectedTokenId);
    if (selectedToken) {
      onTokenSelected(selectedToken);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
          Firma con Certificado Digital
        </CardTitle>
        <CardDescription>
          Utilice su eToken o certificado digital para firmar documentos con validez legal de acuerdo a la Ley 19.799
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokenDetectionStatus === "detecting" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Detectando dispositivos de firma electrónica...
            </p>
          </div>
        )}

        {tokenDetectionStatus === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de detección</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {tokenDetectionStatus === "detected" && (
          <>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Seleccione su certificado digital:</p>
              <Select
                value={selectedTokenId}
                onValueChange={setSelectedTokenId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar certificado" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.name} ({token.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTokenId && (
              <div className="bg-muted rounded-md p-3 text-sm">
                <p className="font-medium mb-2">Información del certificado:</p>
                {(() => {
                  const token = availableTokens.find(t => t.id === selectedTokenId);
                  if (!token) return null;
                  return (
                    <div className="space-y-1 text-muted-foreground">
                      <p><span className="font-medium">Nombre:</span> {token.name}</p>
                      <p><span className="font-medium">Tipo:</span> {token.type}</p>
                      <p><span className="font-medium">Nº Serie:</span> {token.serialNumber}</p>
                      <p><span className="font-medium">Emisor:</span> {token.issuer}</p>
                      <p><span className="font-medium">Válido hasta:</span> {token.validUntil}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={detectConnectedTokens} 
            disabled={isDetecting}
          >
            {isDetecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Redetectar
          </Button>
          
          <Button 
            onClick={handleSelectToken} 
            disabled={!selectedTokenId || isDetecting}
          >
            Continuar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ETokenSupport;