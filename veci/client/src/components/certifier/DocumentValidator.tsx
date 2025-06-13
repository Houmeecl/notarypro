import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  UserCheck, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Loader2,
  Clock
} from "lucide-react";
import { Document, IdentityVerification } from "@shared/schema";

interface DocumentValidatorProps {
  documentId: number;
  onValidationComplete?: () => void;
}

export default function DocumentValidator({ documentId, onValidationComplete }: DocumentValidatorProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("document");

  // Fetch document details
  const { data: document, isLoading: isDocumentLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId,
  });

  // Fetch identity verification details
  const { data: verification, isLoading: isVerificationLoading } = useQuery<IdentityVerification>({
    queryKey: [`/api/identity-verification/${documentId}`],
    enabled: !!documentId,
  });

  // Approve verification mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/identity-verification/${verification?.id}`, {
        status: "approved",
        notes: notes.trim() || "Identidad verificada correctamente",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/identity-verification/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/certifier/documents"] });
      
      toast({
        title: "Verificación aprobada",
        description: "La identidad del usuario ha sido validada correctamente.",
      });
      
      if (onValidationComplete) {
        onValidationComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Error al aprobar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject verification mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/identity-verification/${verification?.id}`, {
        status: "rejected",
        notes: notes.trim() || "Verificación rechazada",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/identity-verification/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/certifier/documents"] });
      
      toast({
        title: "Verificación rechazada",
        description: "La identidad del usuario ha sido rechazada.",
      });
      
      if (onValidationComplete) {
        onValidationComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Error al rechazar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = isDocumentLoading || isVerificationLoading;
  const isPending = approveMutation.isPending || rejectMutation.isPending;
  const isActionDisabled = isPending || (verification?.status !== "pending");

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800">Pendiente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download document
  const handleDownload = () => {
    if (document?.filePath) {
      // In a real app, we would create a download link here
      // For simplicity, we'll just show a toast
      toast({
        title: "Descarga iniciada",
        description: "El documento comenzará a descargarse en breve.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Validación de Identidad
        </CardTitle>
        <CardDescription>
          Revisa el documento y la información de identidad proporcionada por el usuario.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-500">Cargando información...</p>
          </div>
        ) : !document || !verification ? (
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">No se encontró la información del documento o la verificación</p>
          </div>
        ) : (
          <>
            <div className="mb-6 pb-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Documento</h3>
                  <p className="text-lg font-semibold">{document.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(verification.status)}
                    
                    {verification.status === "pending" && (
                      <span className="text-sm text-yellow-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Esperando validación
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de solicitud</h3>
                  <p>{formatDate(document.createdAt)}</p>
                </div>
                {verification.status !== "pending" && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notas del certificador</h3>
                    <p>{verification.notes || "Sin notas"}</p>
                  </div>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="document" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="document">
                  <FileText className="h-4 w-4 mr-2" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="identity">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Identidad
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="document" className="pt-4">
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-center mb-4">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-700">{document.title}</h3>
                    <p className="text-sm text-gray-500">
                      Documento subido: {formatDate(document.createdAt)}
                    </p>
                  </div>
                  
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Ver documento
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="identity" className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Documento de identidad</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={verification.idPhotoPath}
                        alt="Documento de identidad"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Selfie de verificación</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={verification.selfiePath}
                        alt="Selfie"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        {/* Notes field - only show for pending validations */}
        {!isLoading && verification?.status === "pending" && (
          <div className="mt-6">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas opcionales sobre la verificación"
              className="resize-none"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
        {!isLoading && verification?.status === "pending" && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Confirmar rechazo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción rechazará la verificación de identidad del usuario y no podrá firmar el documento con firma avanzada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => rejectMutation.mutate()} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar rechazo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              className="bg-primary hover:bg-primary/90"
              disabled={isPending} 
              onClick={() => approveMutation.mutate()}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar verificación
                </>
              )}
            </Button>
          </>
        )}
        
        {!isLoading && verification?.status !== "pending" && (
          <div className="w-full p-3 rounded-md border bg-gray-50 text-center">
            <p className="text-gray-600">
              Esta verificación ya fue {verification?.status === "approved" ? "aprobada" : "rechazada"}.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
