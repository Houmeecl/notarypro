import React from 'react';
import { useRealFuncionality } from '@/hooks/use-real-funcionality';
import { Shield, LockKeyhole, FileDigit, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentSecurityInfoProps {
  documentId: number;
  securityLevel?: 'basic' | 'advanced' | 'qualified';
  hasSignature?: boolean;
  isVerified?: boolean;
  hasSecureStorage?: boolean;
  onRequestVerification?: () => void;
  onViewSecurityInfo?: () => void;
}

/**
 * Componente que muestra información de seguridad de un documento
 * cumpliendo con Ley 19.799 de Chile
 */
export function DocumentSecurityInfo({
  documentId,
  securityLevel = 'basic',
  hasSignature = false,
  isVerified = false,
  hasSecureStorage = false,
  onRequestVerification,
  onViewSecurityInfo
}: DocumentSecurityInfoProps) {
  const { isFunctionalMode } = useRealFuncionality();
  
  // Si no está en modo funcional, mostrar placeholder más simple
  if (!isFunctionalMode) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Información de seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Información de seguridad no disponible en modo de demostración.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Obtener textos según nivel de seguridad
  const getSecurityLevelContent = () => {
    switch (securityLevel) {
      case 'qualified':
        return {
          title: 'Avanzada Certificada',
          color: 'bg-green-100 text-green-800',
          description: 'Firma electrónica calificada con certificado acreditado según Ley 19.799'
        };
      case 'advanced':
        return {
          title: 'Avanzada',
          color: 'bg-blue-100 text-blue-800',
          description: 'Firma electrónica avanzada que cumple con Ley 19.799'
        };
      default:
        return {
          title: 'Básica',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Firma electrónica simple con verificación de identidad'
        };
    }
  };
  
  const securityContent = getSecurityLevelContent();
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Seguridad del documento</span>
          </CardTitle>
          <Badge className={securityContent.color}>
            {securityContent.title}
          </Badge>
        </div>
        <CardDescription>
          {securityContent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className={`p-1 rounded-md mt-0.5 ${hasSignature ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileDigit className={`h-4 w-4 ${hasSignature ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="text-sm font-medium">
                {hasSignature ? 'Documento firmado' : 'Documento sin firma'}
              </h4>
              <p className="text-xs text-gray-500">
                {hasSignature 
                  ? 'Este documento cuenta con firma electrónica verificable' 
                  : 'Este documento aún no ha sido firmado electrónicamente'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`p-1 rounded-md mt-0.5 ${isVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
              <CheckSquare className={`h-4 w-4 ${isVerified ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="text-sm font-medium">
                {isVerified ? 'Identidad verificada' : 'Identidad sin verificar'}
              </h4>
              <p className="text-xs text-gray-500">
                {isVerified 
                  ? 'La identidad del firmante ha sido verificada' 
                  : 'No se ha realizado verificación de identidad'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`p-1 rounded-md mt-0.5 ${hasSecureStorage ? 'bg-green-100' : 'bg-gray-100'}`}>
              <LockKeyhole className={`h-4 w-4 ${hasSecureStorage ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="text-sm font-medium">
                {hasSecureStorage ? 'Almacenamiento seguro' : 'Almacenamiento estándar'}
              </h4>
              <p className="text-xs text-gray-500">
                {hasSecureStorage 
                  ? 'Este documento está almacenado con cifrado AES-256' 
                  : 'Este documento no utiliza almacenamiento cifrado'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        {onRequestVerification && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRequestVerification}
            className="w-full sm:w-auto"
          >
            Solicitar verificación
          </Button>
        )}
        
        {onViewSecurityInfo && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewSecurityInfo}
            className="w-full sm:w-auto"
          >
            Ver detalles de seguridad
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default DocumentSecurityInfo;