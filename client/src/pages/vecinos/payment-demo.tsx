import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  CreditCard, 
  ShoppingBag, 
  Check, 
  Info, 
  User, 
  Store, 
  Building
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import VecinosPayment from "@/components/payments/VecinosPayment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Lista de servicios disponibles para demostración
const DEMO_SERVICES = [
  { id: "contrato-arriendo", title: "Contrato de Arriendo", amount: 15000 },
  { id: "poder-simple", title: "Poder Simple", amount: 8500 },
  { id: "declaracion-jurada", title: "Declaración Jurada", amount: 12000 },
  { id: "contrato-compraventa", title: "Contrato de Compraventa", amount: 25000 },
  { id: "finiquito-laboral", title: "Finiquito Laboral", amount: 18000 },
];

// Lista de puntos Vecinos para demostración
const DEMO_PARTNERS = [
  { code: "LOCAL-XP125", name: "Mini Market El Sol", location: "Providencia" },
  { code: "LOCAL-XP201", name: "Farmacia Vida", location: "Santiago Centro" },
  { code: "LOCAL-XP315", name: "Librería Central", location: "Ñuñoa" },
  { code: "LOCAL-XP427", name: "Café Internet Express", location: "Las Condes" },
];

export default function VecinosPaymentDemo() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Estados para el proceso de pago
  const [showPayment, setShowPayment] = useState(false);
  const [selectedService, setSelectedService] = useState(DEMO_SERVICES[0]);
  const [selectedPartner, setSelectedPartner] = useState(DEMO_PARTNERS[0]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [currentTab, setCurrentTab] = useState("quick-service");
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  
  // Manejador para iniciar el proceso de pago
  const handleStartPayment = () => {
    if (currentTab === "custom-service" && (!customAmount || isNaN(parseFloat(customAmount)) || parseFloat(customAmount) <= 0)) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingrese un monto válido mayor a cero.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedPartner) {
      toast({
        title: "Punto Vecino requerido",
        description: "Seleccione un punto Vecino para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    setShowPayment(true);
  };
  
  // Manejador para cuando se completa el pago
  const handlePaymentComplete = (transactionId: string) => {
    setTransactionId(transactionId);
    setTransactionComplete(true);
    setShowPayment(false);
  };
  
  // Manejador para cancelar el pago
  const handleCancelPayment = () => {
    setShowPayment(false);
  };
  
  // Determinar el monto a cobrar basado en la pestaña activa
  const getPaymentAmount = () => {
    if (currentTab === "custom-service") {
      return parseFloat(customAmount) || 0;
    }
    return selectedService.amount;
  };
  
  // Obtener la descripción del servicio
  const getServiceDescription = () => {
    if (currentTab === "custom-service") {
      return "Servicio personalizado";
    }
    return selectedService.title;
  };
  
  // Si se ha completado una transacción, mostrar pantalla de éxito
  if (transactionComplete) {
    return (
      <div className="container max-w-3xl mx-auto p-4 md:p-8">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">¡Transacción Exitosa!</CardTitle>
            <CardDescription className="text-green-600">
              Su pago ha sido procesado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white rounded-lg border p-4 mb-6 mx-auto max-w-sm">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">Monto:</span>
                <span className="font-bold">${getPaymentAmount().toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">Servicio:</span>
                <span>{getServiceDescription()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">Punto Vecino:</span>
                <span>{selectedPartner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">ID Transacción:</span>
                <span className="font-mono text-xs">{transactionId}</span>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200 mb-6 text-left">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Proceso de documentos</AlertTitle>
              <AlertDescription className="text-blue-600">
                Un certificador revisará su solicitud y el documento procesado será enviado a su correo electrónico una vez aprobado.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => {
                setTransactionComplete(false);
                setCurrentTab("quick-service");
                setClientName("");
                setClientEmail("");
                setCustomAmount("");
              }}
            >
              Nueva Transacción
            </Button>
            <Button 
              onClick={() => setLocation("/vecinos-express")}
            >
              Volver a Inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Si se está mostrando la pantalla de pago
  if (showPayment) {
    return (
      <div className="container max-w-md mx-auto p-4 md:p-8">
        <VecinosPayment 
          serviceId={currentTab === "custom-service" ? "custom-service" : selectedService.id}
          amount={getPaymentAmount()}
          partnerCode={selectedPartner.code}
          clientId={clientName ? `client-${Date.now()}` : undefined}
          description={getServiceDescription()}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleCancelPayment}
        />
      </div>
    );
  }
  
  // Pantalla principal de selección de servicio
  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Pago en Punto Vecino</CardTitle>
          <CardDescription>
            Servicio de documentos y certificación NotaryPro
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="quick-service" onValueChange={setCurrentTab} value={currentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-service">Servicios Rápidos</TabsTrigger>
              <TabsTrigger value="custom-service">Servicio Personalizado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-service" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Seleccione un documento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEMO_SERVICES.map((service) => (
                      <div 
                        key={service.id}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary ${selectedService.id === service.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${selectedService.id === service.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{service.title}</p>
                              <p className="text-sm text-gray-500">Certificado legal</p>
                            </div>
                          </div>
                          <p className="font-bold">${service.amount.toLocaleString('es-CL')}</p>
                        </div>
                        
                        {selectedService.id === service.id && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del cliente (opcional)</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client-name">Nombre completo</Label>
                      <div className="relative">
                        <Input
                          id="client-name"
                          placeholder="Juan Pérez"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="pl-10"
                        />
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="client-email">Correo electrónico</Label>
                      <div className="relative">
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="pl-10"
                        />
                        <Info className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Punto Vecino</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="partner">Seleccione un punto Vecino</Label>
                      <Select 
                        value={selectedPartner.code} 
                        onValueChange={(value) => setSelectedPartner(DEMO_PARTNERS.find(p => p.code === value) || DEMO_PARTNERS[0])}
                      >
                        <SelectTrigger className="w-full pl-10 relative">
                          <Store className="absolute left-3 h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Seleccione un punto Vecino" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEMO_PARTNERS.map((partner) => (
                            <SelectItem key={partner.code} value={partner.code}>
                              {partner.name} - {partner.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="custom-service" className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Detalles del servicio personalizado</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Monto a cobrar</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="10000"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-10"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del cliente (opcional)</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="custom-client-name">Nombre completo</Label>
                      <div className="relative">
                        <Input
                          id="custom-client-name"
                          placeholder="Juan Pérez"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="pl-10"
                        />
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="custom-client-email">Correo electrónico</Label>
                      <div className="relative">
                        <Input
                          id="custom-client-email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="pl-10"
                        />
                        <Info className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Punto Vecino</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="custom-partner">Seleccione un punto Vecino</Label>
                      <Select 
                        value={selectedPartner.code} 
                        onValueChange={(value) => setSelectedPartner(DEMO_PARTNERS.find(p => p.code === value) || DEMO_PARTNERS[0])}
                      >
                        <SelectTrigger className="w-full pl-10 relative">
                          <Store className="absolute left-3 h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Seleccione un punto Vecino" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEMO_PARTNERS.map((partner) => (
                            <SelectItem key={partner.code} value={partner.code}>
                              {partner.name} - {partner.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between py-6">
          <Button variant="outline" onClick={() => setLocation("/vecinos-express")}>
            Cancelar
          </Button>
          <Button onClick={handleStartPayment}>
            Proceder al Pago
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}