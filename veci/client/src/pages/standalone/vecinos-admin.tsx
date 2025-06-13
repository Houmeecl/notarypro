import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Users, FileText, Store, Settings, PieChart, Database, 
  UserPlus, FileSignature, LayoutDashboard, LogOut, 
  Search, Plus, Filter, MoreVertical, Edit, Trash2, RefreshCw, 
  FileUp, Download, FileCheck, CheckSquare
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import vecinoLogo from '@/assets/new/vecino-xpress-logo-nuevo.png';

// Datos de ejemplo para la demo
import { samplePartners, sampleDocuments, sampleClients, DOCUMENT_TYPES } from './admin-demo-data';

// Componente principal
export default function VecinosAdmin() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Estado para las entidades
  const [partners, setPartners] = useState(samplePartners);
  const [documents, setDocuments] = useState(sampleDocuments);
  const [clients, setClients] = useState(sampleClients);
  
  // Estado para diálogos
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  
  // Estado para nuevas entidades
  const [newPartner, setNewPartner] = useState({
    name: '',
    businessType: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    description: '',
    template: '',
    price: ''
  });
  
  const [newClient, setNewClient] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Handlers para formularios
  const handlePartnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDocumentSelectChange = (name: string, value: string) => {
    setNewDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Funciones para agregar entidades
  const addPartner = () => {
    const id = 'partner-' + (partners.length + 1);
    const partner = {
      ...newPartner,
      id,
      dateAdded: new Date().toISOString(),
      documents: 0,
      sales: 0
    };
    
    setPartners(prev => [...prev, partner]);
    setShowAddPartnerDialog(false);
    setNewPartner({
      name: '',
      businessType: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
    
    toast({
      title: "Socio agregado",
      description: `Se ha agregado el socio ${partner.name}`
    });
  };
  
  const addDocument = () => {
    const id = 'doc-' + (documents.length + 1);
    const document = {
      ...newDocument,
      id,
      dateAdded: new Date().toISOString(),
      usageCount: 0,
      status: 'active',
      price: parseFloat(newDocument.price) || 0
    };
    
    setDocuments(prev => [...prev, document]);
    setShowAddDocumentDialog(false);
    setNewDocument({
      title: '',
      type: '',
      description: '',
      template: '',
      price: ''
    });
    
    toast({
      title: "Documento agregado",
      description: `Se ha agregado el documento ${document.title}`
    });
  };
  
  const addClient = () => {
    const id = 'client-' + (clients.length + 1);
    const client = {
      ...newClient,
      id,
      dateAdded: new Date().toISOString(),
      documents: 0,
      status: 'active'
    };
    
    setClients(prev => [...prev, client]);
    setShowAddClientDialog(false);
    setNewClient({
      name: '',
      rut: '',
      email: '',
      phone: '',
      address: ''
    });
    
    toast({
      title: "Cliente agregado",
      description: `Se ha agregado el cliente ${client.name}`
    });
  };
  
  // Funciones para eliminar entidades
  const deletePartner = (id: string) => {
    setPartners(prev => prev.filter(partner => partner.id !== id));
    
    toast({
      title: "Socio eliminado",
      description: "Se ha eliminado el socio correctamente"
    });
  };
  
  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    toast({
      title: "Documento eliminado",
      description: "Se ha eliminado el documento correctamente"
    });
  };
  
  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    
    toast({
      title: "Cliente eliminado",
      description: "Se ha eliminado el cliente correctamente"
    });
  };
  
  // Formato de fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };
  
  // Cerrar sesión
  const handleLogout = () => {
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión correctamente"
    });
    
    setLocation('/vecinos-standalone-login');
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r hidden md:block">
        <div className="p-4 border-b">
          <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-10" />
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Avatar>
              <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
              <AvatarFallback>ED</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Administrador</p>
              <p className="text-xs text-gray-500">admin@vecinoxpress.cl</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <Store className="h-4 w-4 mr-2" />
                Socios
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <PieChart className="h-4 w-4 mr-2" />
                Reportes
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </div>
            </Button>
            
            <Separator className="my-4" />
            
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Navbar */}
        <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                className="pl-8"
              />
            </div>
            
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button onClick={handleLogout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="partners">Socios</TabsTrigger>
            </TabsList>
            
            {/* Documentos */}
            <TabsContent value="documents" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Documentos</h2>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAddDocumentDialog(true)}
                    className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Documento
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-gray-500">{doc.id}</div>
                          </TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>${doc.price.toLocaleString('es-CL')}</TableCell>
                          <TableCell>{formatDate(doc.dateAdded)}</TableCell>
                          <TableCell>
                            <Badge className={
                              doc.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {doc.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Ver plantilla
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => deleteDocument(doc.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Clientes */}
            <TabsContent value="clients" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Clientes</h2>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAddClientDialog(true)}
                    className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Documentos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map(client => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.id}</div>
                          </TableCell>
                          <TableCell>{client.rut}</TableCell>
                          <TableCell>
                            <div>{client.email}</div>
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          </TableCell>
                          <TableCell>{client.documents}</TableCell>
                          <TableCell>
                            <Badge className={
                              client.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {client.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver documentos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => deleteClient(client.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Socios */}
            <TabsContent value="partners" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Socios</h2>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPartnerDialog(true)}
                    className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Socio
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Negocio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Documentos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map(partner => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-gray-500">{partner.id}</div>
                          </TableCell>
                          <TableCell>{partner.businessType}</TableCell>
                          <TableCell>
                            <div>{partner.email}</div>
                            <div className="text-sm text-gray-500">{partner.phone}</div>
                          </TableCell>
                          <TableCell>{partner.documents}</TableCell>
                          <TableCell>
                            <Badge className={
                              partner.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {partner.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Database className="h-4 w-4 mr-2" />
                                  Ver transacciones
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => deletePartner(partner.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Diálogo para agregar socio */}
      <Dialog open={showAddPartnerDialog} onOpenChange={setShowAddPartnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Socio</DialogTitle>
            <DialogDescription>
              Complete la información del nuevo socio comercial.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Negocio</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Almacén Don Pedro"
                value={newPartner.name}
                onChange={handlePartnerChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessType">Tipo de Negocio</Label>
              <Input
                id="businessType"
                name="businessType"
                placeholder="Ej: Minimarket"
                value={newPartner.businessType}
                onChange={handlePartnerChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ej: contacto@negocio.cl"
                  value={newPartner.email}
                  onChange={handlePartnerChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ej: +56 9 1234 5678"
                  value={newPartner.phone}
                  onChange={handlePartnerChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                placeholder="Ej: Av. Ejemplo 123, Santiago"
                value={newPartner.address}
                onChange={handlePartnerChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPartnerDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addPartner}
              className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
              disabled={!newPartner.name || !newPartner.businessType}
            >
              Agregar Socio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para agregar documento */}
      <Dialog open={showAddDocumentDialog} onOpenChange={setShowAddDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Documento</DialogTitle>
            <DialogDescription>
              Complete la información del nuevo tipo de documento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Documento</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Poder Simple"
                value={newDocument.title}
                onChange={handleDocumentChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select 
                value={newDocument.type} 
                onValueChange={(value) => handleDocumentSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipos de Documento</SelectLabel>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ej: Documento para autorizar a un tercero"
                value={newDocument.description}
                onChange={handleDocumentChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Precio (CLP)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="Ej: 5000"
                value={newDocument.price}
                onChange={handleDocumentChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla HTML</Label>
              <Input
                id="template"
                name="template"
                placeholder="Ej: <div>Plantilla del documento</div>"
                value={newDocument.template}
                onChange={handleDocumentChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocumentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addDocument}
              className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
              disabled={!newDocument.title || !newDocument.type || !newDocument.price}
            >
              Agregar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para agregar cliente */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Complete la información del nuevo cliente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Juan Pérez"
                value={newClient.name}
                onChange={handleClientChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                name="rut"
                placeholder="Ej: 12.345.678-9"
                value={newClient.rut}
                onChange={handleClientChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ej: cliente@ejemplo.com"
                  value={newClient.email}
                  onChange={handleClientChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ej: +56 9 1234 5678"
                  value={newClient.phone}
                  onChange={handleClientChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                placeholder="Ej: Av. Ejemplo 123, Santiago"
                value={newClient.address}
                onChange={handleClientChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addClient}
              className="bg-[#2d219b] hover:bg-[#241a7d] text-white"
              disabled={!newClient.name || !newClient.rut}
            >
              Agregar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}