import React from 'react';
import { Helmet } from 'react-helmet';
import ReadIDVerificationFlow from '@/components/identity/readid-style/ReadIDVerificationFlow';
import { useToast } from '@/hooks/use-toast';

export default function ReadIDVerificationPage() {
  const { toast } = useToast();

  const handleComplete = (success: boolean, data: any) => {
    if (success) {
      toast({
        title: 'Verificación completada',
        description: 'La identidad ha sido verificada correctamente.',
        variant: 'default',
      });
      console.log('Datos de verificación:', data);
    } else {
      toast({
        title: 'Verificación fallida',
        description: 'No se pudo verificar la identidad. Por favor, intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Helmet>
        <title>Verificación de Identidad ReadID | NotaryPro</title>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Verificación ReadID</h1>
            <p className="text-lg text-gray-600">
              Verificación segura de identidad mediante tecnología NFC
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <ReadIDVerificationFlow onComplete={handleComplete} />
          </div>

          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>
              Si tiene problemas con la verificación, por favor contacte a soporte técnico o 
              pruebe con un dispositivo que soporte tecnología NFC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}