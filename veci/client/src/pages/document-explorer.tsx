/**
 * Componente de exploración de documentos centralizado
 * 
 * Este componente permite visualizar y buscar documentos de todo el ecosistema
 * desde una interfaz única, facilitando la gestión documental para usuarios
 * de NotaryPro y VecinoXpress.
 */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CategoryDialog } from "@/components/document/CategoryDialog";
import { DocumentUploadDialog } from "@/components/document/DocumentUploadDialog";
import {
  FileText,
  FileCheck,
  Search,
  Filter,
  Clock,
  Calendar,
  Download,
  Plus,
  Tag,
  FolderOpen,
  Shield,
  ShieldCheck,
  User,
  BadgeDollarSign,
  FolderPlus,
  ArrowUpDown,
  Filter as FilterIcon,
  BookOpen,
  AlertTriangle,
  Share,
  Copy,
  Edit,
  Trash,
  MoreHorizontal,
  FolderInput
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Obtener el icono correcto según el tipo de documento
const getDocumentIcon = (documentType: string) => {
  switch (documentType?.toLowerCase()) {
    case "declaracion_jurada":
      return <Shield className="h-5 w-5 text-indigo-600" />;
    case "poder_simple":
      return <User className="h-5 w-5 text-indigo-600" />;
    case "autorizacion":
      return <ShieldCheck className="h-5 w-5 text-indigo-600" />;
    case "certificado":
      return <BadgeDollarSign className="h-5 w-5 text-indigo-600" />;
    default:
      return <FileText className="h-5 w-5 text-indigo-600" />;
  }
};

// Obtener el color de estado correcto
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "certified":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DocumentExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<any>(null);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  
  // Consultar categorías de documentos
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ["/api/document-management/categories"],
    queryFn: async () => {
      const res = await fetch("/api/document-management/categories");
      if (!res.ok) throw new Error("Error al cargar categorías");
      return res.json();
    }
  });
  
  // Consultar documentos por categoría o búsqueda
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: [
      "/api/document-management/documents", 
      categoryFilter,
      searchTerm,
      sortBy
    ],
    queryFn: async () => {
      let url;
      
      if (searchTerm) {
        url = `/api/document-management/documents/search?q=${encodeURIComponent(searchTerm)}`;
      } else if (categoryFilter) {
        url = `/api/document-management/documents/category/${categoryFilter}`;
      } else {
        // Por defecto cargamos documentos recientes
        url = `/api/document-management/documents/recent`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar documentos");
      return res.json();
    },
    enabled: !!categories // Solo consultar documentos después de cargar categorías
  });
  
  // Consultar documentos notariales
  const { data: notaryDocuments, isLoading: isLoadingNotary } = useQuery({
    queryKey: ["/api/notary-documents/my-documents"],
    queryFn: async () => {
      const res = await fetch("/api/notary-documents/my-documents");
      if (!res.ok) throw new Error("Error al cargar documentos notariales");
      return res.json();
    }
  });
  
  // Filtrar documentos por estado
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    
    if (!filterStatus) return documents;
    
    return documents.filter((doc: any) => 
      doc.status.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [documents, filterStatus]);
  
  // Manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Permisos
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCertifier = user?.role === "certifier";
  const canManageCategories = isAdmin || isCertifier;
  
  // Funciones para manejo de categorías
  const handleAddCategory = () => {
    setEditMode("create");
    setSelectedCategoryForEdit(null);
    setShowCategoryDialog(true);
  };
  
  const handleEditCategory = (category: any) => {
    setEditMode("edit");
    setSelectedCategoryForEdit(category);
    setShowCategoryDialog(true);
  };
  
  // Función para ordenar documentos
  const sortedDocuments = React.useMemo(() => {
    if (!filteredDocuments) return [];
    
    const docs = [...filteredDocuments];
    
    switch (sortBy) {
      case "date-desc":
        return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "date-asc":
        return docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "name-asc":
        return docs.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return docs.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return docs;
    }
  }, [filteredDocuments, sortBy]);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Sistema de Gestión Documental
          </h1>
          <p className="text-gray-500">
            Accede a todos tus documentos desde un solo lugar
          </p>
        </div>
        <div className="flex gap-2">
          {canManageCategories && (
            <Button 
              variant="outline" 
              onClick={handleAddCategory}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              <FolderPlus className="mr-2 h-4 w-4" /> Nueva Categoría
            </Button>
          )}
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setShowUploadDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Subir Documento
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Búsqueda de Documentos</CardTitle>
            <CardDescription>
              Busca por nombre, contenido o categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar documentos..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="certified">Certificado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos los Documentos</TabsTrigger>
          <TabsTrigger value="notarial">Documentos Notariales</TabsTrigger>
          <TabsTrigger value="recent">Actividad Reciente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
          ) : filteredDocuments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc: any) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getDocumentIcon(doc.documentType)}
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status === "certified" ? "Certificado" : 
                         doc.status === "pending" ? "Pendiente" :
                         doc.status === "active" ? "Activo" :
                         doc.status === "rejected" ? "Rechazado" : "Borrador"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {doc.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {doc.verificationCode && (
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <FileCheck className="h-3.5 w-3.5 mr-1" />
                        Código: {doc.verificationCode}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Creado: {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: es })}
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {doc.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end gap-2">
                    <Link href={`/documents/${doc.id}/download`}>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </Link>
                    <Link href={`/documents/${doc.id}`}>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Ver Detalle
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay documentos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron documentos con los criterios de búsqueda actual.
              </p>
              <div className="mt-6">
                <Link href="/document-upload">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Documento
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notarial" className="mt-6">
          {isLoadingNotary ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
          ) : notaryDocuments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notaryDocuments.map((doc: any) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getDocumentIcon(doc.documentType)}
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status === "certified" ? "Certificado" : 
                         doc.status === "pending" ? "Pendiente" :
                         doc.status === "active" ? "Activo" :
                         doc.status === "rejected" ? "Rechazado" : "Borrador"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {doc.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <FileCheck className="h-3.5 w-3.5 mr-1" />
                      Código: {doc.verificationCode}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Creado: {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: es })}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end gap-2">
                    <Link href={`/notary-documents/${doc.id}/download`}>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </Link>
                    <Link href={`/notary-documents/${doc.id}`}>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Ver Detalle
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay documentos notariales</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron documentos notariales asociados a tu cuenta.
              </p>
              <div className="mt-6">
                <Link href="/notary-documents/upload">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Documento Notarial
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Historial de actividades en documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Activity items would be mapped here */}
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <FileCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Documento certificado</p>
                    <p className="text-sm text-gray-500">
                      Contrato de arriendo ABC-123 fue certificado por NotaryPro
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Hace 2 horas
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Plus className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nuevo documento</p>
                    <p className="text-sm text-gray-500">
                      Declaración jurada XYZ-456 fue creada
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Hace 5 horas
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para crear/editar categorías */}
      <CategoryDialog 
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        selectedCategory={selectedCategoryForEdit}
        mode={editMode}
      />
      
      {/* Diálogo para subir documentos */}
      <DocumentUploadDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
}