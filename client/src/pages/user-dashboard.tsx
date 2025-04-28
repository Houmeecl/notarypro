import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/dashboard/Sidebar";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { AchievementsList } from "@/components/micro-interactions/AchievementsList";
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileSignature, 
  Eye, 
  PlusCircle,
  Award,
  Trophy
} from "lucide-react";
import { Document } from "@shared/schema";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("documents");

  // Fetch user documents
  const { data: documents, isLoading: isDocumentsLoading } = useQuery<any[]>({
    queryKey: ["/api/documents"],
  });

  // Status badge for documents
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case "validated":
        return (
          <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Validado</span>
          </Badge>
        );
      case "signed":
        return (
          <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Firmado</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Rechazado</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date helper
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bienvenido, {user?.fullName}. Gestiona tus documentos y firma electrónicamente.
            </p>
          </header>
          
          <Tabs 
            defaultValue="documents" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Mis Documentos</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Subir Documento</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Mis Logros</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Link href="/documents">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Todos mis documentos
                  </Button>
                </Link>
                <Link href="/document-categories">
                  <Button className="bg-primary hover:bg-primary/90">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nuevo Documento
                  </Button>
                </Link>
              </div>
            </div>
            
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Documentos Recientes</CardTitle>
                  <CardDescription>
                    Gestiona y firma tus documentos electrónicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isDocumentsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !documents || documents.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay documentos</h3>
                      <p className="text-gray-500 mb-4">Aún no has subido ningún documento</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("upload")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir mi primer documento
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Documento</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.map((document) => (
                            <TableRow key={document.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{document.title}</div>
                                    <div className="text-xs text-gray-500">ID: {document.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(document.createdAt)}</div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(document.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Link href={`/document-sign/${document.id}`}>
                                    <Button variant="outline" size="sm">
                                      {document.status === "signed" ? (
                                        <>
                                          <Eye className="h-4 w-4 mr-1" />
                                          Ver
                                        </>
                                      ) : (
                                        <>
                                          <FileSignature className="h-4 w-4 mr-1" />
                                          Firmar
                                        </>
                                      )}
                                    </Button>
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Documentos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{documents?.length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {documents?.filter(d => d.status === "pending").length || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Firmados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {documents?.filter(d => d.status === "signed").length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="upload">
              <DocumentUpload />
            </TabsContent>
            
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Mis Logros</CardTitle>
                  <CardDescription>
                    Mira los logros que has desbloqueado y compártelos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AchievementsList className="mt-2" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
