import React, { useState } from "react";
import { VecinosAdminLayout } from "@/components/vecinos/VecinosAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PencilIcon, 
  Trash2Icon, 
  UserPlusIcon, 
  User, 
  Settings, 
  Key, 
  Shield, 
  UserCog,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

// Datos simulados para la demostración
const usersData = [
  {
    id: 1,
    username: "adminprincipal",
    fullName: "Administrador Principal",
    email: "admin@vecinos.test",
    role: "admin",
    status: "active",
    createdAt: "2025-01-01",
    lastLogin: "2025-05-03"
  },
  {
    id: 2,
    username: "certificador1",
    fullName: "Carlos Rodríguez",
    email: "carlos@vecinos.test",
    role: "certifier",
    status: "active",
    createdAt: "2025-01-15",
    lastLogin: "2025-05-02"
  },
  {
    id: 3,
    username: "certificador2",
    fullName: "Ana Martínez",
    email: "ana@vecinos.test",
    role: "certifier",
    status: "active",
    createdAt: "2025-02-10",
    lastLogin: "2025-05-01"
  },
  {
    id: 4,
    username: "supervisor1",
    fullName: "Juan Pérez",
    email: "juan@vecinos.test",
    role: "supervisor",
    status: "active",
    createdAt: "2025-03-01",
    lastLogin: "2025-04-30"
  },
  {
    id: 5,
    username: "vendedor1",
    fullName: "María López",
    email: "maria@vecinos.test",
    role: "seller",
    status: "active",
    createdAt: "2025-03-15",
    lastLogin: "2025-05-03"
  },
  {
    id: 6,
    username: "vendedor2",
    fullName: "Luis González",
    email: "luis@vecinos.test",
    role: "seller",
    status: "inactive",
    createdAt: "2025-04-01",
    lastLogin: "2025-04-25"
  }
];

// Esquema para validación de formulario
const userFormSchema = z.object({
  username: z.string().min(4, { message: "El usuario debe tener al menos 4 caracteres" }),
  fullName: z.string().min(3, { message: "El nombre completo es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
  confirmPassword: z.string().optional(),
  role: z.string().min(1, { message: "Seleccione un rol" }),
  status: z.boolean().default(true),
}).refine((data) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Componente principal
const VecinosUsersManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  // Configuración del formulario para agregar/editar usuario
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      status: true,
    },
  });

  // Filtrar usuarios según pestaña seleccionada
  const getFilteredUsers = () => {
    if (activeTab === "all") {
      return usersData;
    } else {
      return usersData.filter(user => user.role === activeTab);
    }
  };

  // Configurar formulario para editar usuario
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status === "active",
    });
    setIsEditUserOpen(true);
  };

  // Configurar formulario para agregar usuario
  const handleAddUser = () => {
    form.reset({
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      status: true,
    });
    setIsAddUserOpen(true);
  };

  // Mostrar confirmación para eliminar usuario
  const handleDeleteConfirmation = (user: any) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  // Eliminar usuario
  const handleDeleteUser = () => {
    // Aquí iría la lógica real para eliminar el usuario
    toast({
      title: "Usuario eliminado",
      description: `El usuario ${selectedUser.username} ha sido eliminado.`,
      variant: "default",
    });
    setIsDeleteConfirmOpen(false);
  };

  // Guardar usuario (nuevo o editado)
  const onSubmit = (values: z.infer<typeof userFormSchema>) => {
    if (isEditUserOpen) {
      // Lógica para editar usuario
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${values.username} ha sido actualizado correctamente.`,
        variant: "default",
      });
      setIsEditUserOpen(false);
    } else {
      // Lógica para crear usuario
      toast({
        title: "Usuario creado",
        description: `El usuario ${values.username} ha sido creado correctamente.`,
        variant: "default",
      });
      setIsAddUserOpen(false);
    }
  };

  // Obtener badge para rol de usuario
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500">Administrador</Badge>;
      case "certifier":
        return <Badge className="bg-blue-500">Certificador</Badge>;
      case "supervisor":
        return <Badge className="bg-green-500">Supervisor</Badge>;
      case "seller":
        return <Badge className="bg-amber-500">Vendedor</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  // Obtener badge para estado de usuario
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactivo</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  // Obtener icono para rol de usuario
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "certifier":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "supervisor":
        return <UserCog className="h-4 w-4 text-green-500" />;
      case "seller":
        return <User className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <VecinosAdminLayout title="Gestión de Usuarios">
      <div className="space-y-6">
        {/* Resumen de usuarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Administradores</p>
                  <p className="text-2xl font-bold">
                    {usersData.filter(user => user.role === "admin").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Certificadores</p>
                  <p className="text-2xl font-bold">
                    {usersData.filter(user => user.role === "certifier").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Supervisores</p>
                  <p className="text-2xl font-bold">
                    {usersData.filter(user => user.role === "supervisor").length}
                  </p>
                </div>
                <UserCog className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Vendedores</p>
                  <p className="text-2xl font-bold">
                    {usersData.filter(user => user.role === "seller").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gestión de usuarios */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Usuarios del sistema</CardTitle>
                <CardDescription>
                  Administre los usuarios de la plataforma Vecinos Xpress
                </CardDescription>
              </div>
              
              <Button onClick={handleAddUser}>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b">
                <TabsList className="bg-transparent -mb-px mx-6">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Admins
                  </TabsTrigger>
                  <TabsTrigger 
                    value="certifier" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Certificadores
                  </TabsTrigger>
                  <TabsTrigger 
                    value="supervisor" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Supervisores
                  </TabsTrigger>
                  <TabsTrigger 
                    value="seller" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Vendedores
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="pt-0 pb-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último acceso</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredUsers().map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              {getRoleBadge(user.role)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditUser(user)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              
                              {user.username !== "adminprincipal" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteConfirmation(user)}
                                >
                                  <Trash2Icon className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {getFilteredUsers().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            No se encontraron usuarios
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Modal para agregar usuario */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="certifier">Certificador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Usuario activo</FormLabel>
                      <FormDescription>
                        Activar o desactivar acceso del usuario
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddUserOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear usuario</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal para editar usuario */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos del usuario {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña (opcional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Dejar en blanco para mantener la actual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="certifier">Certificador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Usuario activo</FormLabel>
                      <FormDescription>
                        Activar o desactivar acceso del usuario
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditUserOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmación para eliminar usuario */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el usuario {selectedUser?.username}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
    </VecinosAdminLayout>
  );
};

export default VecinosUsersManagement;