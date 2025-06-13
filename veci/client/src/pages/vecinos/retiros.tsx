import * as React from 'react';
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, ChevronDown, ChevronRight, 
  CreditCard, AlertCircle, CheckCircle, 
  Calendar, DollarSign, Clock, MoreHorizontal, Download,
  Building as Bank
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Tipo para el formulario de retiro
const withdrawalFormSchema = z.object({
  amount: z
    .number({ required_error: "Monto requerido", invalid_type_error: "Debe ser un número" })
    .min(5000, "El monto mínimo de retiro es $5.000"),
  bankName: z.string().min(1, "Selecciona un banco"),
  accountType: z.string().min(1, "Selecciona un tipo de cuenta"),
  accountNumber: z.string().min(5, "El número de cuenta es requerido"),
});

// Interfaces para los datos
interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  processedAt?: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
}

interface PartnerInfo {
  id: number;
  balance: number;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  ownerRut?: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatAccountType(type: string) {
  switch (type) {
    case "cuenta_corriente": return "Cuenta Corriente";
    case "cuenta_vista": return "Cuenta Vista / RUT";
    case "cuenta_ahorro": return "Cuenta de Ahorro";
    default: return type;
  }
}

function formatBankName(bank: string) {
  switch (bank) {
    case "banco_estado": return "Banco Estado";
    case "banco_santander": return "Banco Santander";
    case "banco_chile": return "Banco de Chile";
    case "banco_bci": return "Banco BCI";
    case "banco_scotiabank": return "Scotiabank";
    default: return bank;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function VecinosRetiros() {
  const [_, setLocation] = useLocation();
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Comprobar autenticación
  useEffect(() => {
    const token = localStorage.getItem("vecinos_token");
    if (!token) {
      setLocation("/vecinos/login");
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder",
        variant: "destructive",
      });
    }
  }, [setLocation]);
  
  // Obtener información del socio
  const { data: partnerInfo } = useQuery<PartnerInfo>({
    queryKey: ["/api/vecinos/partner-info"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/vecinos/partner-info");
      if (!res.ok) {
        throw new Error("Error al obtener información");
      }
      return await res.json();
    },
  });
  
  // Obtener historial de retiros
  const { data: withdrawalRequests, isLoading: withdrawalsLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ["/api/vecinos/withdrawal-requests"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/vecinos/withdrawal-requests");
        if (!res.ok) {
          throw new Error("Error al obtener historial de retiros");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
      }
    },
  });
  
  // Configurar formulario para retiro
  const form = useForm<z.infer<typeof withdrawalFormSchema>>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: undefined,
      bankName: "",
      accountType: "",
      accountNumber: "",
    },
  });
  
  // Actualizar valores del formulario con datos del socio
  useEffect(() => {
    if (partnerInfo) {
      form.setValue("bankName", partnerInfo.bankName || "");
      form.setValue("accountType", partnerInfo.accountType || "");
      form.setValue("accountNumber", partnerInfo.accountNumber || "");
    }
  }, [partnerInfo, form]);
  
  // Mutación para solicitar retiro
  const withdrawalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawalFormSchema>) => {
      const res = await apiRequest("POST", "/api/vecinos/withdrawal-request", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al solicitar retiro");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vecinos/partner-info"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vecinos/withdrawal-requests"] });
      setWithdrawalStatus('success');
      
      // Actualizar formulario
      form.reset({
        amount: undefined,
        bankName: partnerInfo?.bankName || "",
        accountType: partnerInfo?.accountType || "",
        accountNumber: partnerInfo?.accountNumber || "",
      });
    },
    onError: (error: Error) => {
      setWithdrawalStatus('error');
      toast({
        title: "Error al solicitar retiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: z.infer<typeof withdrawalFormSchema>) => {
    // Validar que tenga saldo suficiente
    if (partnerInfo && partnerInfo.balance < data.amount) {
      toast({
        title: "Saldo insuficiente",
        description: `Tu saldo actual es $${partnerInfo.balance.toLocaleString('es-CL')}`,
        variant: "destructive",
      });
      return;
    }
    
    withdrawalMutation.mutate(data);
  };
  
  // Mostrar detalles de un retiro
  const handleShowDetails = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalDetails(true);
  };
  
  // Actualizar mensaje basado en el estado de la solicitud
  const getStatusMessage = (status: string) => {
    switch (status) {
      case "completed":
        return "Tu retiro ha sido procesado y transferido a tu cuenta bancaria.";
      case "pending":
        return "Tu solicitud está siendo procesada. Los fondos se transferirán en 1-3 días hábiles.";
      case "rejected":
        return "Tu solicitud fue rechazada. Por favor, contacta a soporte para más información.";
      default:
        return "Estado desconocido. Por favor, contacta a soporte.";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-blue-700 mr-2"
              onClick={() => setLocation("/vecinos/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-xl font-bold">Retiro de Comisiones</h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Tarjeta de saldo */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-blue-800">Saldo disponible</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ${partnerInfo?.balance?.toLocaleString('es-CL') || "0"}
                  </p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowWithdrawalForm(true)}
                  disabled={!partnerInfo || partnerInfo.balance < 5000}
                >
                  Solicitar retiro
                </Button>
              </div>
              
              {(!partnerInfo || partnerInfo.balance < 5000) && (
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-600">Saldo insuficiente</AlertTitle>
                  <AlertDescription>
                    El monto mínimo para solicitar un retiro es de $5.000 CLP.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Historial de retiros */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de retiros</CardTitle>
              <CardDescription>
                Revisa el estado de tus solicitudes de retiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-500">Cargando historial de retiros...</p>
                </div>
              ) : withdrawalRequests && withdrawalRequests.length > 0 ? (
                <div className="space-y-4">
                  {withdrawalRequests.map((withdrawal) => (
                    <div 
                      key={withdrawal.id} 
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleShowDetails(withdrawal)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-blue-600 mr-1" />
                            <span className="font-semibold">${withdrawal.amount.toLocaleString('es-CL')}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Solicitado: {formatDate(withdrawal.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status === "completed" ? "Completado" : 
                             withdrawal.status === "pending" ? "Pendiente" : 
                             withdrawal.status === "rejected" ? "Rechazado" : 
                             withdrawal.status}
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No has realizado ninguna solicitud de retiro.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowWithdrawalForm(true)}
                    disabled={!partnerInfo || partnerInfo.balance < 5000}
                  >
                    Solicitar tu primer retiro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Información sobre retiros */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Información importante</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Cuándo se procesan las solicitudes de retiro?</AccordionTrigger>
                <AccordionContent>
                  Las solicitudes de retiro se procesan dentro de 1-3 días hábiles. Los fondos se transferirán a la cuenta bancaria registrada en tu perfil.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Hay un monto mínimo para solicitar un retiro?</AccordionTrigger>
                <AccordionContent>
                  Sí, el monto mínimo para solicitar un retiro es de $5.000 CLP. No hay límite en la cantidad de retiros que puedes solicitar por mes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Cómo actualizo mis datos bancarios?</AccordionTrigger>
                <AccordionContent>
                  Puedes actualizar tus datos bancarios en la sección "Mi Cuenta" &gt; "Datos bancarios". Los cambios se aplicarán a todas las solicitudes de retiro futuras.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      
      {/* Dialog para solicitar retiro */}
      <Dialog open={showWithdrawalForm} onOpenChange={setShowWithdrawalForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar retiro</DialogTitle>
            <DialogDescription>
              Ingresa los datos para transferir tus comisiones
            </DialogDescription>
          </DialogHeader>
          
          {withdrawalStatus === 'success' ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold">¡Solicitud enviada!</h3>
              <p className="text-gray-600">
                Tu solicitud de retiro ha sido recibida y será procesada en los próximos 1-3 días hábiles.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                onClick={() => {
                  setWithdrawalStatus('idle');
                  setShowWithdrawalForm(false);
                }}
              >
                Entendido
              </Button>
            </div>
          ) : withdrawalStatus === 'error' ? (
            <div className="py-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h3 className="text-xl font-bold">Error en la solicitud</h3>
              <p className="text-gray-600">
                Ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setWithdrawalStatus('idle')}
                >
                  Intentar nuevamente
                </Button>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setWithdrawalStatus('idle');
                    setShowWithdrawalForm(false);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Saldo disponible:</p>
                    <p className="font-bold text-lg text-blue-600">
                      ${partnerInfo?.balance?.toLocaleString('es-CL') || "0"}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (partnerInfo) {
                        form.setValue("amount", partnerInfo.balance);
                      }
                    }}
                    disabled={!partnerInfo || partnerInfo.balance < 5000}
                  >
                    Retirar todo
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto a retirar</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            className="pl-8"
                            {...field}
                            onChange={e => {
                              const value = e.target.value === "" ? undefined : Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Monto mínimo: $5.000 CLP
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Seleccionar banco</option>
                          <option value="banco_estado">Banco Estado</option>
                          <option value="banco_santander">Banco Santander</option>
                          <option value="banco_chile">Banco de Chile</option>
                          <option value="banco_bci">Banco BCI</option>
                          <option value="banco_scotiabank">Scotiabank</option>
                          <option value="otro">Otro</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de cuenta</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Seleccionar tipo de cuenta</option>
                          <option value="cuenta_corriente">Cuenta Corriente</option>
                          <option value="cuenta_vista">Cuenta Vista / RUT</option>
                          <option value="cuenta_ahorro">Cuenta de Ahorro</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de cuenta</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Bank className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-600">Información de pago</AlertTitle>
                  <AlertDescription>
                    Tus comisiones serán transferidas a esta cuenta bancaria en un plazo de 1-3 días hábiles.
                  </AlertDescription>
                </Alert>
              
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowWithdrawalForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={withdrawalMutation.isPending}
                  >
                    {withdrawalMutation.isPending ? "Procesando..." : "Solicitar retiro"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog para detalles de retiro */}
      <Dialog open={showWithdrawalDetails} onOpenChange={setShowWithdrawalDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del retiro</DialogTitle>
            <DialogDescription>
              Información detallada sobre tu solicitud
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Monto solicitado</h3>
                  <span className="text-xl font-bold">${selectedWithdrawal.amount.toLocaleString('es-CL')}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedWithdrawal.status)}`}>
                      {selectedWithdrawal.status === "completed" ? "Completado" : 
                       selectedWithdrawal.status === "pending" ? "Pendiente" : 
                       selectedWithdrawal.status === "rejected" ? "Rechazado" : 
                       selectedWithdrawal.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de solicitud:</span>
                    <span>{formatDate(selectedWithdrawal.createdAt)}</span>
                  </div>
                  {selectedWithdrawal.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de procesamiento:</span>
                      <span>{formatDate(selectedWithdrawal.processedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de solicitud:</span>
                    <span className="font-mono">{selectedWithdrawal.id}</span>
                  </div>
                </div>
                
                <Alert className={`mt-4 ${
                  selectedWithdrawal.status === "completed" ? "bg-green-50 border-green-200" :
                  selectedWithdrawal.status === "pending" ? "bg-yellow-50 border-yellow-200" :
                  selectedWithdrawal.status === "rejected" ? "bg-red-50 border-red-200" :
                  "bg-gray-50 border-gray-200"
                }`}>
                  <div className={`h-4 w-4 ${
                    selectedWithdrawal.status === "completed" ? "text-green-600" :
                    selectedWithdrawal.status === "pending" ? "text-yellow-600" :
                    selectedWithdrawal.status === "rejected" ? "text-red-600" :
                    "text-gray-600"
                  }`}>
                    {selectedWithdrawal.status === "completed" ? <CheckCircle className="h-4 w-4" /> :
                     selectedWithdrawal.status === "pending" ? <Clock className="h-4 w-4" /> :
                     selectedWithdrawal.status === "rejected" ? <AlertCircle className="h-4 w-4" /> :
                     <AlertCircle className="h-4 w-4" />}
                  </div>
                  <AlertDescription>
                    {getStatusMessage(selectedWithdrawal.status)}
                  </AlertDescription>
                </Alert>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Información bancaria</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banco:</span>
                    <span>{formatBankName(selectedWithdrawal.bankName)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de cuenta:</span>
                    <span>{formatAccountType(selectedWithdrawal.accountType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de cuenta:</span>
                    <span className="font-mono">{selectedWithdrawal.accountNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowWithdrawalDetails(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componentes provisionales mientras arreglamos las importaciones

function Accordion({ children, type, collapsible, className }: { children: React.ReactNode, type?: string, collapsible?: boolean, className?: string }) {
  return <div className={className}>{children}</div>;
}

function AccordionItem({ children, value }: { children: React.ReactNode, value: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === AccordionTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (React.isValidElement(child) && child.type === AccordionContent) {
          return isOpen ? child : null;
        }
        return child;
      })}
    </div>
  );
}

function AccordionTrigger({ children, isOpen, onClick }: { children: React.ReactNode, isOpen?: boolean, onClick?: () => void }) {
  return (
    <div 
      className="flex justify-between items-center py-4 font-medium cursor-pointer hover:underline"
      onClick={onClick}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
    </div>
  );
}

function AccordionContent({ children }: { children: React.ReactNode }) {
  return <div className="pb-4 pt-0 text-gray-600">{children}</div>;
}