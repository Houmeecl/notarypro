import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import PendingDocuments from "@/components/certifier/PendingDocuments";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  TrendingUp,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Document } from "@shared/schema";

export default function CertifierDashboard() {
  const { user } = useAuth();
  
  // Fetch certifier documents
  const { data: certifierDocuments } = useQuery<Document[]>({
    queryKey: ["/api/certifier/my-documents"],
  });
  
  // Fetch pending documents
  const { data: pendingDocuments } = useQuery<Document[]>({
    queryKey: ["/api/certifier/documents"],
  });

  // Status badge for documents
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800">Pendiente</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Validado</Badge>;
      case "signed":
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800">Firmado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date helper
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Mock metrics for dashboard
  const metrics = {
    documentsValidated: certifierDocuments?.filter(d => d.status === "validated").length || 0,
    documentsRejected: certifierDocuments?.filter(d => d.status === "rejected").length || 0,
    pendingCount: pendingDocuments?.length || 0,
    averageValidationTime: "45 min"
  };

  // Get recent activity from certifier documents
  const recentActivity = certifierDocuments?.slice(0, 5) || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="md:pl-64 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel del Certificador</h1>
            <p className="text-gray-500 mt-1">
              Bienvenido, {user?.fullName}. Gestiona y valida documentos para certificación.
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Documentos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                  <div className="text-3xl font-bold">{metrics.pendingCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Validados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div className="text-3xl font-bold">{metrics.documentsValidated}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Rechazados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div className="text-3xl font-bold">{metrics.documentsRejected}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Tiempo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                  <div className="text-3xl font-bold">{metrics.averageValidationTime}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PendingDocuments />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Últimos documentos validados o rechazados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-6">
                      <FileCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No hay actividad reciente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {doc.status === "validated" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : doc.status === "rejected" ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <FileCheck className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{doc.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(doc.updatedAt)}</p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Información del Certificador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                        {user?.fullName.charAt(0)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                      <p className="font-medium">{user?.fullName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estado</p>
                      <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800 mt-1">
                        Certificador Activo
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Certificaciones Realizadas</p>
                      <p className="font-medium">{metrics.documentsValidated + metrics.documentsRejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
