import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Printer,
  UserPlus,
} from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WebAppPOSAlternativa = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("inicio");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState("");
  const [clienteRegistrado, setClienteRegistrado] = useState(false);
  const [procesoCompletado, setProcesoCompletado] = useState(false);

  const documentosDisponibles = [
    { id: "doc1", nombre: "Declaración Jurada Simple", precio: 3500 },
    { id: "doc2", nombre: "Poder Especial", precio: 4500 },
    { id: "doc3", nombre: "Contrato de Arriendo", precio: 5500 },
    { id: "doc4", nombre: "Contrato de Compraventa", precio: 6500 },
    { id: "doc5", nombre: "Finiquito Laboral", precio: 4000 },
  ];

  const handleRegistrarCliente = () => {
    setClienteRegistrado(true);
    setActiveTab("documentos");
  };

  const handleSeleccionarDocumento = (id: string) => {
    setDocumentoSeleccionado(id);
    setActiveTab("pago");
  };

  const handleProcesarPago = () => {
    setProcesoCompletado(true);
    setActiveTab("comprobante");
  };

  const reiniciarProceso = () => {
    setClienteRegistrado(false);
    setDocumentoSeleccionado("");
    setProcesoCompletado(false);
    setActiveTab("inicio");
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vecinos POS - Versión Web</h1>
        <Button
          variant="outline"
          onClick={() => setLocation("/partners/sdk-demo")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-600">
            Aplicación activa
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-medium">Almacén Don Pedro</h2>
            <p className="text-sm text-gray-500">ID Socio: VEC-12345</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Comisión disponible</p>
            <p className="text-xl font-bold text-primary">$27.500</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procesamiento de documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger
                value="inicio"
                disabled={activeTab !== "inicio" && !procesoCompletado}
              >
                Inicio
              </TabsTrigger>
              <TabsTrigger
                value="documentos"
                disabled={!clienteRegistrado && activeTab !== "documentos"}
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger
                value="pago"
                disabled={!documentoSeleccionado && activeTab !== "pago"}
              >
                Pago
              </TabsTrigger>
              <TabsTrigger
                value="comprobante"
                disabled={!procesoCompletado && activeTab !== "comprobante"}
              >
                Comprobante
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de Inicio - Registro de cliente */}
            <TabsContent value="inicio">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">
                    Registrar cliente nuevo
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input id="nombre" placeholder="Ej: Juan Pérez González" />
                  </div>
                  <div>
                    <Label htmlFor="rut">RUT</Label>
                    <Input id="rut" placeholder="Ej: 12.345.678-9" />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej: juan@ejemplo.cl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="Ej: +56 9 1234 5678" />
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={handleRegistrarCliente}
                  >
                    Registrar cliente
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Documentos */}
            <TabsContent value="documentos">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <QrCode className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Seleccionar documento</h2>
                </div>

                <div className="space-y-3">
                  {documentosDisponibles.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSeleccionarDocumento(doc.id)}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        documentoSeleccionado === doc.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doc.nombre}</p>
                          <p className="text-sm text-gray-500">
                            Código: {doc.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${doc.precio}</p>
                          <p className="text-xs text-primary">
                            Comisión: ${Math.round(doc.precio * 0.15)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Pago */}
            <TabsContent value="pago">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Printer className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Procesamiento de pago</h2>
                </div>

                {documentoSeleccionado && (
                  <div className="p-4 bg-gray-50 rounded-md mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Documento:</span>
                      <span className="font-medium">
                        {
                          documentosDisponibles.find(
                            (d) => d.id === documentoSeleccionado,
                          )?.nombre
                        }
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Precio:</span>
                      <span className="font-medium">
                        $
                        {
                          documentosDisponibles.find(
                            (d) => d.id === documentoSeleccionado,
                          )?.precio
                        }
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        Su comisión:
                      </span>
                      <span className="font-medium text-primary">
                        $
                        {Math.round(
                          (documentosDisponibles.find(
                            (d) => d.id === documentoSeleccionado,
                          )?.precio || 0) * 0.15,
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="metodoPago">Método de pago</Label>
                    <Select defaultValue="efectivo">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">
                          Tarjeta (débito/crédito)
                        </SelectItem>
                        <SelectItem value="transferencia">
                          Transferencia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full mt-6" onClick={handleProcesarPago}>
                    Procesar pago
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de Comprobante */}
            <TabsContent value="comprobante">
              <div className="text-center space-y-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-medium">
                  ¡Pago procesado con éxito!
                </h2>

                <div className="bg-gray-50 p-6 rounded-md mx-auto max-w-sm">
                  <h3 className="font-medium text-lg mb-4">
                    Comprobante de pago
                  </h3>
                  <div className="space-y-2 text-left mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Código:</span>
                      <span>
                        VEC-{Math.floor(100000 + Math.random() * 900000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Documento:</span>
                      <span>
                        {
                          documentosDisponibles.find(
                            (d) => d.id === documentoSeleccionado,
                          )?.nombre
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monto:</span>
                      <span>
                        $
                        {
                          documentosDisponibles.find(
                            (d) => d.id === documentoSeleccionado,
                          )?.precio
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hora:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      El documento ha sido enviado automáticamente al correo del
                      cliente.
                    </p>
                    <p className="text-sm text-primary">
                      Su comisión ha sido registrada automáticamente.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={reiniciarProceso}>
                    Procesar nuevo documento
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebAppPOSAlternativa;
