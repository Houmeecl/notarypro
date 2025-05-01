import { useState, useEffect } from "react";
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
import { useWebSocket } from "@/hooks/use-websocket";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { AchievementsList } from "@/components/micro-interactions/AchievementsList";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentStats } from "@/components/dashboard/charts/DocumentStats";
import { ActivityTimeline } from "@/components/dashboard/charts/ActivityTimeline";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
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
  Trophy,
  Bell,
  Book,
  Bookmark,
  Calendar,
  Settings,
  User,
  Sparkles,
  Shield
} from "lucide-react";
import { Document } from "@shared/schema";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const { user } = useAuth();
  const { status: wsStatus } = useWebSocket();
  const [activeTab, setActiveTab] = useState("documents");
  const [showWelcome, setShowWelcome] = useState(true);

  // Ocultar mensaje de bienvenida después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

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

  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "Recordatorio de documento",
      description: "Tienes 2 documentos pendientes por firmar.",
      date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isRead: false,
      link: "/documents"
    },
    {
      id: 2,
      type: "success",
      title: "Documento firmado",
      description: "Tu documento 'Contrato de Servicios' ha sido firmado correctamente.",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 3,
      type: "warning",
      title: "Verificación pendiente",
      description: "Tu identidad necesita verificación adicional para continuar.",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      link: "/verificar-documento"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <Badge variant={wsStatus === 'connected' ? 'outline' : 'destructive'} className="font-normal">
                    {wsStatus === 'connected' ? (
                      <>
                        <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                        Conectado
                      </>
                    ) : (
                      <>
                        <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-gray-500 mt-1">
                  Bienvenido{user?.fullName ? `, ${user.fullName}` : ''}. Gestiona tus documentos y firma electrónicamente.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/user-badges">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Trophy className="h-4 w-4" />
                    Mis Insignias
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          
          {showWelcome && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">¡Bienvenido a tu nuevo dashboard!</h3>
                <p className="text-sm text-gray-600">Hemos mejorado la interfaz para brindarte una mejor experiencia con visualizaciones interactivas.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowWelcome(false)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            <div className="md:col-span-9">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Documentos Totales"
                  value={documents?.length || 0}
                  icon={<FileText className="h-5 w-5 text-primary" />}
                  trend={documents?.length ? { value: 20, isPositive: true } : undefined}
                />
                
                <StatCard 
                  title="Pendientes por Firmar"
                  value={documents?.filter(d => d.status === "pending").length || 0}
                  icon={<Clock className="h-5 w-5 text-amber-500" />}
                  iconBgColor="bg-amber-100"
                  textColor="text-amber-700"
                />
                
                <StatCard 
                  title="Documentos Firmados"
                  value={documents?.filter(d => d.status === "signed").length || 0}
                  icon={<Shield className="h-5 w-5 text-green-500" />}
                  iconBgColor="bg-green-100"
                  textColor="text-green-700"
                  trend={documents?.filter(d => d.status === "signed").length ? { value: 15, isPositive: true } : undefined}
                />
              </div>
            </div>
            
            <div className="md:col-span-3">
              <NotificationCenter 
                notifications={notifications}
                maxHeight={130}
              />
            </div>
          </div>
          
          <Tabs 
            defaultValue="documents" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex justify-between items-center flex-wrap gap-4">
              <TabsList>
                <TabsTrigger id="documents-tab" value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Mis Documentos</span>
                </TabsTrigger>
                <TabsTrigger id="upload-tab" value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Subir Documento</span>
                </TabsTrigger>
                <TabsTrigger id="activity-tab" value="activity" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Actividad</span>
                </TabsTrigger>
                <TabsTrigger id="achievements-tab" value="achievements" className="gap-2">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
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
                              {documents.slice(0, 5).map((document) => (
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
                          
                          {documents.length > 5 && (
                            <div className="flex justify-center mt-4">
                              <Link href="/documents">
                                <Button variant="outline" size="sm">
                                  Ver todos los documentos
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <DocumentStats 
                    documents={documents} 
                    title="Resumen de Documentos"
                    description="Estado de tus documentos"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload">
              <DocumentUpload />
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="grid grid-cols-1 gap-6">
                <ActivityTimeline 
                  data={documents}
                  title="Actividad de Documentos" 
                  description="Documentos procesados en los últimos 7 días"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="achievements">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
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
                    <CardFooter className="border-t pt-6 flex justify-between">
                      <Button variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        Ver todos los logros
                      </Button>
                      <Link href="/user-badges">
                        <Button>
                          <Trophy className="h-4 w-4 mr-2" />
                          Ver mis insignias
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Próximas Insignias</CardTitle>
                      <CardDescription>
                        Objetivos por completar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">Verificador Oro</h4>
                            <p className="text-xs text-muted-foreground">Verifica 10 documentos</p>
                            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <p className="text-xs text-right mt-0.5 text-muted-foreground">3/10</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Award className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">Coleccionista</h4>
                            <p className="text-xs text-muted-foreground">Obtén 5 insignias distintas</p>
                            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            <p className="text-xs text-right mt-0.5 text-muted-foreground">2/5</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Trophy className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">Compartidor</h4>
                            <p className="text-xs text-muted-foreground">Comparte 3 insignias en redes</p>
                            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <p className="text-xs text-right mt-0.5 text-muted-foreground">0/3</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
