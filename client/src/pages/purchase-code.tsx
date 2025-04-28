import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, CreditCard, Gift, Lock, Receipt, Video } from "lucide-react";
import MainNavbar from "@/components/layout/MainNavbar";

export default function PurchaseCodePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [purchaseCode, setPurchaseCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  // Mutación para validar el código de compra
  const validateCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/validate-purchase-code", { code });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Código validado",
        description: "El código de compra es válido.",
      });
      setCodeValidated(true);
      setPurchaseDetails(data);
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message || "El código proporcionado no es válido o ya ha sido utilizado.",
        variant: "destructive",
      });
    }
  });

  // Mutación para activar el servicio
  const activateServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/activate-service", { 
        code: purchaseCode,
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Servicio activado",
        description: "El servicio ha sido activado correctamente en su cuenta.",
      });
      
      // Redirigir al usuario según el tipo de servicio
      if (data.serviceType === "videoconsult") {
        setTimeout(() => {
          setLocation("/video-consultations");
        }, 1500);
      } else {
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error de activación",
        description: error.message || "No se pudo activar el servicio.",
        variant: "destructive",
      });
    }
  });

  // Manejar la validación del código
  const handleValidateCode = () => {
    if (!purchaseCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingrese un código de compra.",
        variant: "destructive",
      });
      return;
    }
    
    validateCodeMutation.mutate(purchaseCode);
  };

  // Manejar la activación del servicio
  const handleActivateService = () => {
    activateServiceMutation.mutate();
  };

  return (
    <>
      <MainNavbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Activar Código de Compra</h1>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                Código de Compra
              </CardTitle>
              <CardDescription>
                Ingrese el código de compra para activar su servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!codeValidated ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Código</label>
                    <Input
                      placeholder="Ingrese su código de compra"
                      value={purchaseCode}
                      onChange={(e) => setPurchaseCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Los códigos de compra son de un solo uso y no pueden ser transferidos
                      una vez activados.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Código válido</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>El código de compra es válido y está listo para ser activado.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Detalles del servicio:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Servicio:</div>
                      <div className="font-medium">{purchaseDetails?.serviceName}</div>
                      
                      <div className="text-muted-foreground">Tipo:</div>
                      <div className="font-medium">
                        {purchaseDetails?.serviceType === "videoconsult" ? (
                          <span className="flex items-center">
                            <Video className="h-3.5 w-3.5 mr-1" /> Videoconsulta
                          </span>
                        ) : (
                          purchaseDetails?.serviceType
                        )}
                      </div>
                      
                      <div className="text-muted-foreground">Duración:</div>
                      <div className="font-medium">{purchaseDetails?.duration}</div>
                      
                      <div className="text-muted-foreground">Valor:</div>
                      <div className="font-medium">
                        {purchaseDetails?.currency} {purchaseDetails?.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancelar
              </Button>
              
              {!codeValidated ? (
                <Button 
                  onClick={handleValidateCode}
                  disabled={validateCodeMutation.isPending || !purchaseCode.trim()}
                >
                  {validateCodeMutation.isPending ? "Validando..." : "Validar código"}
                </Button>
              ) : (
                <Button 
                  onClick={handleActivateService}
                  disabled={activateServiceMutation.isPending}
                >
                  {activateServiceMutation.isPending ? "Activando..." : "Activar servicio"}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Preguntas frecuentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">¿Dónde encuentro mi código de compra?</h3>
                <p className="text-sm text-muted-foreground">
                  Después de completar su compra, el código es enviado a su correo electrónico 
                  y también aparece en la página de confirmación.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">¿Por cuánto tiempo es válido mi código?</h3>
                <p className="text-sm text-muted-foreground">
                  Los códigos de compra son válidos por 30 días a partir de la fecha de compra.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">¿Qué hago si mi código no funciona?</h3>
                <p className="text-sm text-muted-foreground">
                  Si su código no funciona, verifique que lo haya ingresado correctamente. 
                  Si el problema persiste, contáctenos a través de nuestro 
                  <a href="/contacto" className="text-primary"> formulario de contacto</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}