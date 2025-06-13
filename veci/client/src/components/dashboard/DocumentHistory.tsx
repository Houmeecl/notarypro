import { useQuery } from "@tanstack/react-query";
import { Document, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, EditIcon, UserCheck, FileSignature, CheckCircle, User as UserIcon, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentHistoryProps {
  document: Document;
}

// Interfaz para el objeto de verificación de identidad
interface IdentityVerification {
  id: number;
  documentId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Formato para las fechas
const formatDate = (dateString?: Date | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DocumentHistory({ document }: DocumentHistoryProps) {
  // Fetch del usuario que creó el documento
  const { data: creator, isLoading: isCreatorLoading } = useQuery<User>({
    queryKey: [`/api/users/${document.userId}`],
    enabled: !!document.userId && document.userId !== 1, // No cargar si es anónimo (userId = 1)
  });

  // Fetch del certificador (si existe)
  const { data: certifier, isLoading: isCertifierLoading } = useQuery<User>({
    queryKey: [`/api/users/${document.certifierId}`],
    enabled: !!document.certifierId,
  });

  // Fetch de la verificación de identidad (si existe)
  const { data: verification, isLoading: isVerificationLoading } = useQuery<IdentityVerification>({
    queryKey: [`/api/identity-verification/${document.id}`],
    enabled: !!document.id,
  });

  // Construir una línea de tiempo del documento
  const buildTimelineEvents = () => {
    const events = [
      {
        icon: <EditIcon className="h-5 w-5 text-blue-500" />,
        title: "Documento Creado",
        description: "El documento fue creado y completado",
        timestamp: document.createdAt,
        user: creator?.username || "Usuario anónimo",
      }
    ];

    // Si hay verificación, añadir al historial
    if (verification) {
      events.push({
        icon: <UserCheck className="h-5 w-5 text-orange-500" />,
        title: "Verificación de Identidad",
        description: verification.status === "pending" 
          ? "Verificación de identidad enviada" 
          : verification.status === "approved"
            ? "Identidad verificada"
            : "Verificación rechazada",
        timestamp: verification.createdAt,
        user: creator?.username || "Usuario anónimo",
      });

      // Si la verificación fue procesada
      if (verification.status !== "pending" && verification.updatedAt) {
        events.push({
          icon: verification.status === "approved" 
            ? <CheckCircle className="h-5 w-5 text-green-500" />
            : <AlertCircle className="h-5 w-5 text-red-500" />,
          title: verification.status === "approved" 
            ? "Identidad Validada" 
            : "Identidad Rechazada",
          description: verification.notes || 
            (verification.status === "approved" 
              ? "La verificación de identidad fue aprobada" 
              : "La verificación de identidad fue rechazada"),
          timestamp: verification.updatedAt,
          user: certifier?.username || "Certificador",
        });
      }
    }

    // Si el documento está firmado
    if (document.status === "signed") {
      events.push({
        icon: <FileSignature className="h-5 w-5 text-green-500" />,
        title: "Documento Firmado",
        description: "El documento fue firmado electrónicamente",
        timestamp: document.updatedAt || document.createdAt,
        user: creator?.username || "Usuario anónimo",
      });
    }

    // Ordenar eventos por fecha
    return events.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA; // orden descendente (más reciente primero)
    });
  };

  const isLoading = isCreatorLoading || isCertifierLoading || isVerificationLoading;
  const events = buildTimelineEvents();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 text-primary mr-2" />
          Historial del Documento
        </CardTitle>
        <CardDescription>
          Registro de actividades relacionadas con este documento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative pl-6 pb-6">
                {/* Línea vertical de conexión excepto para el último elemento */}
                {index < events.length - 1 && (
                  <div className="absolute left-2.5 top-3 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                {/* Punto de timeline */}
                <div className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  {event.icon}
                </div>
                
                {/* Contenido del evento */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-xs text-gray-500">{formatDate(event.timestamp as Date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <UserIcon className="h-3 w-3 mr-1" />
                    <span>{event.user}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay registros de actividad para este documento
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}