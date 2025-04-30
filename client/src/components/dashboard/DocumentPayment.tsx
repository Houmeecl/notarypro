import { useState } from "react";
import { Document as DocumentType } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle, Wallet, AlertCircle, Mail, FileCheck } from "lucide-react";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

// Define una interfaz con los nuevos campos para documentos
interface DocumentWithEmail {
  id: number;
  userId: number;
  templateId: number;
  title: string;
  formData: unknown;
  status: string;
  filePath: string | null;
  pdfPath: string | null;
  qrCode: string | null;
  certifierId: number | null;
  paymentId: string | null;
  paymentAmount: number | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentTimestamp: Date | null;
  signatureData: string | null;
  signatureTimestamp: Date | null;
  certifierSignatureData: string | null;
  certifierSignatureTimestamp: Date | null;
  rejectionReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  // Nuevos campos
  email: string | null;
  receiveNotifications: boolean | null;
  sendCopy: boolean | null;
}

interface DocumentPaymentProps {
  document: DocumentWithEmail;
  signatureType: "simple" | "advanced";
  onPaymentSuccess?: () => void;
}

export default function DocumentPayment({ document, signatureType, onPaymentSuccess }: DocumentPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("creditcard");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolderName, setCardHolderName] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [receiveNotifications, setReceiveNotifications] = useState<boolean>(true);
  const [sendCopy, setSendCopy] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Definir precio basado en el tipo de firma
  const paymentAmount = signatureType === "advanced" ? 5000 : 1500;
  
  // Mutation para procesar el pago
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/documents/${document.id}/payment`, {
        paymentMethod,
        cardNumber,
        cardHolderName,
        expirationDate,
        cvv,
        signatureType,
        email,
        receiveNotifications,
        sendCopy
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${document.id}`] });
      toast({
        title: "Pago exitoso",
        description: "Su pago ha sido procesado correctamente.",
        variant: "default",
      });
      
      // Navegar a la siguiente pantalla basada en el tipo de firma
      if (data.nextStep === "identity-verification") {
        setLocation(`/document-verification/${document.id}`);
      } else {
        setLocation(`/document-sign/${document.id}`);
      }
      
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error en el pago",
        description: error.message || "Hubo un problema procesando su pago. Inténtelo nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar correo electrónico
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast({
        title: "Correo electrónico inválido",
        description: "Por favor ingrese un correo electrónico válido para recibir su documento.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === "creditcard") {
      // Validar datos de tarjeta de crédito
      if (!cardNumber || !cardHolderName || !expirationDate || !cvv) {
        toast({
          title: "Datos incompletos",
          description: "Por favor complete todos los campos de la tarjeta de crédito.",
          variant: "destructive",
        });
        return;
      }
      
      // Validar formato básico
      if (cardNumber.length < 16 || cvv.length < 3) {
        toast({
          title: "Datos inválidos",
          description: "El número de tarjeta o código de seguridad son inválidos.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await paymentMutation.mutateAsync();
    } catch (error) {
      console.error("Error en el pago:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Si el documento ya está pagado, mostrar mensaje
  if (document.paymentStatus === "completed") {
    return (
      <Card className="bg-gray-50 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Pago Completado
          </CardTitle>
          <CardDescription>
            Este documento ya ha sido pagado correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">ID de Pago:</span>
              <span className="font-medium">{document.paymentId || "N/A"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Monto:</span>
              <span className="font-medium">${document.paymentAmount || 0} CLP</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="text-green-600 font-medium">Completado</span>
            </div>
            {document.email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Enviado a:</span>
                <span className="font-medium">{document.email}</span>
              </div>
            )}
          </div>
          
          {document.email && (
            <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start">
              <FileCheck className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Documento enviado por correo</p>
                <p className="text-xs text-blue-600">
                  Una copia del documento ha sido enviada a su correo electrónico. Revise su bandeja de entrada.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="h-5 w-5 text-primary mr-2" />
          Pago de Documento
        </CardTitle>
        <CardDescription>
          {signatureType === "advanced" 
            ? "Complete el pago para continuar con el proceso de firma avanzada" 
            : "Complete el pago para firmar su documento"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Detalles del documento</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Título:</span>
                <span className="font-medium">{document.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Tipo de firma:</span>
                <span className="font-medium">
                  {signatureType === "advanced" ? "Firma Avanzada" : "Firma Simple"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Costo:</span>
                <span className="font-medium text-primary">${paymentAmount} CLP</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger id="paymentMethod" className="w-full mt-1">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creditcard">Tarjeta de crédito</SelectItem>
                <SelectItem value="debitcard">Tarjeta de débito</SelectItem>
                <SelectItem value="transfer">Transferencia bancaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {paymentMethod === "creditcard" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Número de tarjeta</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cardHolderName">Nombre del titular</Label>
                <Input
                  id="cardHolderName"
                  placeholder="Juan Pérez"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expirationDate">Fecha de expiración</Label>
                  <Input
                    id="expirationDate"
                    placeholder="MM/AA"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    maxLength={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    className="mt-1"
                    type="password"
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === "transfer" && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Datos para transferencia</h4>
              <p className="text-sm text-gray-600">Banco: Banco de Chile</p>
              <p className="text-sm text-gray-600">Cuenta: 0012345678</p>
              <p className="text-sm text-gray-600">Titular: CerfiDoc SpA</p>
              <p className="text-sm text-gray-600">RUT: 76.543.210-K</p>
              <p className="text-sm text-gray-600">Email: pagos@cerfidoc.cl</p>
              <div className="mt-3">
                <AlertCircle className="h-4 w-4 text-yellow-500 inline-block mr-1" />
                <span className="text-xs text-yellow-700">Importante: Incluir el ID del documento ({document.id}) como referencia en la transferencia.</span>
              </div>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="text-sm font-medium flex items-center text-blue-700 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                Recibir documento por correo electrónico
              </h4>
              
              <div className="mb-4">
                <Label htmlFor="email" className="text-sm">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendCopy" 
                    checked={sendCopy}
                    onCheckedChange={(checked) => setSendCopy(checked === true)}
                  />
                  <Label
                    htmlFor="sendCopy"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enviar una copia del documento firmado
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="receiveNotifications" 
                    checked={receiveNotifications}
                    onCheckedChange={(checked) => setReceiveNotifications(checked === true)}
                  />
                  <Label
                    htmlFor="receiveNotifications"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Recibir actualizaciones sobre el proceso de firma
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            <p className="mb-2"><strong>Nota:</strong> Este es un pago simulado para efectos de demostración. No se realizará ningún cargo real a su tarjeta.</p>
            <p>Al hacer clic en "Pagar", acepta nuestros términos y condiciones de servicio.</p>
          </div>
        
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !email}
          >
            {isSubmitting ? "Procesando..." : `Pagar $${paymentAmount} CLP`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}