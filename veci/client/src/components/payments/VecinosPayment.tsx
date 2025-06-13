import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Calendar,
  User,
  Lock,
  Check,
  AlertCircle,
  DollarSign,
  Percent,
  Receipt,
  FileText,
  Layers,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Interfaz para las propiedades del componente
interface VecinosPaymentProps {
  serviceId: string;
  amount: number;
  partnerCode: string;
  clientId?: string;
  description?: string;
  onPaymentComplete?: (transactionId: string) => void;
  onCancel?: () => void;
}

// Componente de pago para puntos Vecinos
export default function VecinosPayment({
  serviceId,
  amount,
  partnerCode,
  clientId,
  description = "Servicio de documentación legal",
  onPaymentComplete,
  onCancel
}: VecinosPaymentProps) {
  const { toast } = useToast();
  
  // Estados para el formulario de pago
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit">("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  // Query para obtener detalles del servicio
  const { data: serviceDetails } = useQuery({
    queryKey: ['/api/vecinos/services', serviceId],
    queryFn: () => fetch(`/api/vecinos/services/${serviceId}`).then(res => res.json())
  });
  
  // Query para obtener información del punto Vecino
  const { data: partnerInfo } = useQuery({
    queryKey: ['/api/vecinos/partners', partnerCode],
    queryFn: () => fetch(`/api/vecinos/partners/by-code/${partnerCode}`).then(res => res.json())
  });
  
  // Mutación para procesar el pago
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setIsProcessing(true);
      const response = await apiRequest("POST", "/api/vecinos/payments/process", paymentData);
      return await response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTransactionId(data.transactionId);
      toast({
        title: "Pago procesado correctamente",
        description: `La transacción ${data.transactionId} ha sido procesada con éxito.`,
      });
      // Notificar al componente padre sobre el pago exitoso
      if (onPaymentComplete) {
        onPaymentComplete(data.transactionId);
      }
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo procesar el pago. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Formatear número de tarjeta mientras se escribe
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminar cualquier caracter que no sea número
    let value = e.target.value.replace(/\D/g, "");
    
    // Limitar a 16 dígitos
    value = value.substring(0, 16);
    
    // Formatear con espacios cada 4 dígitos
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)!.join(" ");
    }
    
    setCardNumber(value);
  };
  
  // Formatear fecha de expiración
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.substring(0, 4);
    
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    
    setExpiryDate(value);
  };
  
  // Validar el formulario de pago
  const validatePaymentForm = () => {
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast({
        title: "Número de tarjeta inválido",
        description: "Ingrese un número de tarjeta válido de 16 dígitos.",
        variant: "destructive",
      });
      return false;
    }
    
    if (cardName.trim().length < 5) {
      toast({
        title: "Nombre inválido",
        description: "Ingrese el nombre como aparece en la tarjeta.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      toast({
        title: "Fecha de expiración inválida",
        description: "Ingrese la fecha en formato MM/YY.",
        variant: "destructive",
      });
      return false;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      toast({
        title: "Código de seguridad inválido",
        description: "Ingrese un código de seguridad válido (3 o 4 dígitos).",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Procesar el pago
  const handleProcessPayment = () => {
    if (!validatePaymentForm()) {
      return;
    }
    
    const paymentData = {
      serviceId,
      amount,
      partnerCode,
      clientId: clientId || "guest-client",
      paymentMethod,
      cardInfo: {
        last4: cardNumber.replace(/\s/g, "").slice(-4),
        expiry: expiryDate
      },
      description
    };
    
    processPaymentMutation.mutate(paymentData);
  };
  
  // Avanzar al siguiente paso
  const handleNextStep = () => {
    setCurrentStep(2);
  };
  
  // Retroceder al paso anterior
  const handlePreviousStep = () => {
    setCurrentStep(1);
  };
  
  // Cancelar el proceso de pago
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // Calcular las comisiones
  const comisionPuntoVecino = amount * 0.1; // 10% para el punto Vecino
  const comisionSupervisor = amount * 0.02; // 2% para el supervisor
  const comisionVendedor = amount * 0.01; // 1% para el vendedor
  const totalComisiones = comisionPuntoVecino + comisionSupervisor + comisionVendedor;
  const montoNeto = amount - totalComisiones;
  
  // Si el pago se procesó correctamente, mostrar pantalla de éxito
  if (paymentSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-700">¡Pago Exitoso!</CardTitle>
            <CardDescription className="text-green-600">
              Su transacción ha sido procesada correctamente
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-600">Monto pagado:</span>
                <span className="font-semibold">${amount.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ID de transacción:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Método de pago:</span>
                <span>Tarjeta {paymentMethod === "credit" ? "de crédito" : "de débito"} ****{cardNumber.replace(/\s/g, "").slice(-4)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Punto Vecino:</span>
                <span>{partnerInfo?.name || partnerCode}</span>
              </div>
            </div>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-100">
              <FileText className="h-4 w-4" />
              <AlertTitle>Documento en proceso</AlertTitle>
              <AlertDescription>
                Su documento ha sido enviado para certificación y será enviado por email una vez completado.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => window.location.href = "/vecinos/dashboard"}
            className="w-full"
          >
            Continuar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="w-full"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Imprimir Comprobante
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pago Seguro</CardTitle>
            <CardDescription>
              Punto Vecino: {partnerInfo?.name || partnerCode}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <div className="bg-gray-200 rounded-full h-2 w-2"></div>
            <div className={`h-2 w-2 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg">{serviceDetails?.title || description}</p>
                  <p className="text-sm text-gray-500">{serviceDetails?.description || "Servicio de documentación"}</p>
                </div>
                <div className="text-xl font-bold">${amount.toLocaleString('es-CL')}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Seleccione método de pago</h3>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as "credit" | "debit")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="credit"
                    id="credit"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="credit"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Tarjeta de Crédito
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="debit"
                    id="debit"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="debit"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Tarjeta de Débito
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="card-number">Número de tarjeta</Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="pl-10"
                    maxLength={19}
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                <div className="relative">
                  <Input
                    id="card-name"
                    placeholder="Juan Pérez"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry-date">Fecha de expiración</Label>
                  <div className="relative">
                    <Input
                      id="expiry-date"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      className="pl-10"
                      maxLength={5}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cvv">Código de seguridad</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                      className="pl-10"
                      maxLength={4}
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-sm">
              <Lock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Pago seguro encriptado con SSL</span>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">Detalles del pago</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{serviceDetails?.title || description}</span>
                  <span>${amount.toLocaleString('es-CL')}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Monto neto</span>
                  <span>${montoNeto.toLocaleString('es-CL')}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Comisión Punto Vecino (10%)</span>
                  <span>${comisionPuntoVecino.toLocaleString('es-CL')}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Comisiones de gestión (3%)</span>
                  <span>${(comisionSupervisor + comisionVendedor).toLocaleString('es-CL')}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center font-medium">
                  <span>Total a pagar</span>
                  <span>${amount.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-3">Método de pago</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                  <div>
                    <p className="font-medium">
                      {paymentMethod === "credit" ? "Tarjeta de crédito" : "Tarjeta de débito"}
                    </p>
                    <p className="text-sm text-gray-500">
                      **** **** **** {cardNumber.replace(/\s/g, "").slice(-4)}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handlePreviousStep}
                >
                  Cambiar
                </Button>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Al hacer clic en "Confirmar Pago", autoriza el cargo por ${amount.toLocaleString('es-CL')} a su tarjeta.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        {currentStep === 1 ? (
          <>
            <Button 
              className="w-full" 
              onClick={handleNextStep}
              disabled={!cardNumber || !cardName || !expiryDate || !cvv}
            >
              Continuar
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button 
              className="w-full" 
              onClick={handleProcessPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>Confirmar Pago</>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handlePreviousStep}
              disabled={isProcessing}
            >
              Volver
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}