import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import MainNavbar from "@/components/layout/MainNavbar";

const formSchema = z.object({
  code: z.string()
    .min(12, { message: "El código debe tener al menos 12 caracteres" })
    .regex(/^CERFI-[A-Z0-9]{8}$/, { 
      message: "El código debe tener formato CERFI-XXXXXXXX donde X es una letra o número" 
    })
});

type FormData = z.infer<typeof formSchema>;

export default function PurchaseCodePage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ""
    }
  });

  const validateCodeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/validate-purchase-code", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error validando el código");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setPurchaseDetails(data);
      toast({
        title: "Código válido",
        description: "El código de compra ha sido verificado correctamente",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de validación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const activateServiceMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/activate-service", { code });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error activando el servicio");
      }
      return response.json();
    },
    onSuccess: () => {
      setActivationSuccess(true);
      toast({
        title: "Servicio activado",
        description: "El servicio ha sido activado correctamente. Serás redirigido en breve.",
        variant: "default",
      });
      // Redireccionar después de una activación exitosa
      setTimeout(() => {
        setLocation("/user-dashboard");
      }, 3000);
    },
    onError: (error: Error) => {
      setIsActivating(false);
      toast({
        title: "Error de activación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormData) => {
    validateCodeMutation.mutate(data);
  };

  const handleActivateService = () => {
    if (!purchaseDetails?.code) return;
    
    setIsActivating(true);
    activateServiceMutation.mutate(purchaseDetails.code);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <>
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Activar Código de Compra</h1>
          <p className="text-gray-600 mb-8">
            Ingresa el código de compra que recibiste para activar tu servicio
          </p>

          {activationSuccess ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Servicio activado correctamente</AlertTitle>
              <AlertDescription className="text-green-700">
                Tu servicio ha sido activado con éxito. Estás siendo redirigido a tu panel de usuario...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Validar Código</CardTitle>
                  <CardDescription>
                    Ingresa el código de compra en formato CERFI-XXXXXXXX
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código de compra</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="CERFI-A1B2C3D4" 
                                className="uppercase"
                                disabled={validateCodeMutation.isPending || !!purchaseDetails || isActivating}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={validateCodeMutation.isPending || !!purchaseDetails || isActivating}
                      >
                        {validateCodeMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Validar Código
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {validateCodeMutation.isError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {validateCodeMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {purchaseDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles del Servicio</CardTitle>
                    <CardDescription>
                      Confirma los detalles del servicio que estás a punto de activar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Código</h3>
                        <p className="text-lg font-semibold">{purchaseDetails.code}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Servicio</h3>
                        <p className="text-lg font-semibold">{purchaseDetails.serviceName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Duración</h3>
                        <p className="text-lg font-semibold">{purchaseDetails.duration}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Valor</h3>
                        <p className="text-lg font-semibold">{formatCurrency(purchaseDetails.amount)}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha de expiración</h3>
                      <p className="text-base">
                        {new Date(purchaseDetails.expirationDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>

                    <Alert variant="default" className="bg-blue-50 border-blue-100 text-blue-800">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        Al activar este código, estarás habilitando el servicio en tu cuenta. 
                        El código solo puede ser utilizado una vez.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleActivateService} 
                      disabled={isActivating}
                      className="w-full"
                    >
                      {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Activar Servicio
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}