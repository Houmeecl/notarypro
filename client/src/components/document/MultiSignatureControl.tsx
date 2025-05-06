import React from 'react';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { UserCircle2, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export interface SignerInfo {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  signedAt?: Date;
  role?: string;
}

interface MultiSignatureControlProps {
  documentId: number;
  documentName: string;
  signers: SignerInfo[];
  currentUserId?: number;
  progress?: number;
  onSignDocument?: () => void;
  onRemindSigner?: (signerId: number) => void;
  onAddSigner?: () => void;
}

/**
 * Componente para gestionar múltiples firmantes en un documento
 * según los requerimientos de la Ley 19.799 de Chile
 */
export function MultiSignatureControl({
  documentId,
  documentName,
  signers,
  currentUserId,
  progress = 0,
  onSignDocument,
  onRemindSigner,
  onAddSigner
}: MultiSignatureControlProps) {
  const { isFunctionalMode } = useRealFuncionality();
  
  // Si no está en modo funcional, mostrar placeholder básico
  if (!isFunctionalMode) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Firmantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            El control de múltiples firmantes no está disponible en modo de demostración.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Obtener el estado del firmante actual (si existe)
  const currentSigner = signers.find(signer => signer.id === currentUserId);
  const isCurrentUserPending = currentSigner && currentSigner.status === 'pending';
  
  // Comprobar si todos los firmantes han completado el proceso
  const allSignersCompleted = signers.every(signer => signer.status === 'completed');
  
  // Obtener mensaje según progreso
  const getProgressMessage = () => {
    if (allSignersCompleted) {
      return 'Todos los firmantes han completado el proceso';
    }
    
    const completedCount = signers.filter(s => s.status === 'completed').length;
    return `${completedCount} de ${signers.length} firmas completadas`;
  };
  
  // Renderizar un firmante
  const renderSigner = (signer: SignerInfo, index: number) => {
    // Obtener color e icono según estado
    const getStatusInfo = () => {
      switch (signer.status) {
        case 'completed':
          return {
            icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
            text: 'Firmado',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          };
        case 'in_progress':
          return {
            icon: <Clock className="h-4 w-4 text-amber-600" />,
            text: 'En proceso',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
          };
        case 'rejected':
          return {
            icon: <AlertCircle className="h-4 w-4 text-red-600" />,
            text: 'Rechazado',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          };
        default:
          return {
            icon: <Clock className="h-4 w-4 text-gray-400" />,
            text: 'Pendiente',
            color: 'text-gray-500',
            bgColor: 'bg-gray-50'
          };
      }
    };
    
    const statusInfo = getStatusInfo();
    const isCurrentUser = signer.id === currentUserId;
    
    return (
      <div 
        key={signer.id} 
        className={`flex items-center gap-3 p-2 rounded-md ${isCurrentUser ? statusInfo.bgColor : ''}`}
      >
        <Avatar className="h-8 w-8">
          {signer.avatarUrl ? (
            <AvatarImage src={signer.avatarUrl} alt={signer.name} />
          ) : (
            <AvatarFallback className="text-xs">
              {signer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {signer.name} 
              {isCurrentUser && <span className="text-xs text-gray-500 ml-1">(Tú)</span>}
            </p>
            {statusInfo.icon}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 truncate">
              {signer.role || signer.email}
            </p>
            <p className={`text-xs ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
          </div>
        </div>
        
        {signer.status === 'pending' && onRemindSigner && !isCurrentUser && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={() => onRemindSigner(signer.id)}
          >
            Recordar
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Firmantes del documento</span>
          </CardTitle>
          
          {(progress > 0 && progress < 100) && (
            <span className="text-xs font-medium">
              {progress}%
            </span>
          )}
        </div>
        <CardDescription>{getProgressMessage()}</CardDescription>
        
        {progress > 0 && (
          <Progress value={progress} className="h-1.5 mt-1" />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          {signers.map(renderSigner)}
        </div>
        
        {onAddSigner && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 text-xs"
            onClick={onAddSigner}
          >
            <UserCircle2 className="h-3 w-3 mr-1" />
            Añadir firmante
          </Button>
        )}
        
        {isCurrentUserPending && onSignDocument && (
          <Button 
            variant="default" 
            className="w-full mt-3"
            onClick={onSignDocument}
          >
            Firmar documento
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default MultiSignatureControl;