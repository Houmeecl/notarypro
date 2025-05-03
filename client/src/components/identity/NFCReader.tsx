import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

export interface NFCReaderProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  demoMode?: boolean;
}

const NFCReader: React.FC<NFCReaderProps> = ({ onSuccess, onError, demoMode = false }) => {
  const [status, setStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('Presione el botón para iniciar la lectura');
  
  // Simulación de datos NFC para modo demo
  const simulateNFCRead = async () => {
    setStatus('reading');
    setMessage('Simulando lectura NFC...');
    
    try {
      // Simular un tiempo de lectura
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Datos simulados de un documento chileno
      // Usar datos que parezcan reales para mejor experiencia de demo
      const mockNFCData = {
        documentType: "CI-CHL",
        documentNumber: "16.782.453-K",
        names: "MARÍA ALEJANDRA",
        surnames: "GONZÁLEZ FUENTES",
        nationality: "CHL",
        birthDate: "1988-04-22",
        gender: "F",
        issueDate: "2019-08-15",
        expiryDate: "2029-08-15",
        personalNumber: "16782453K",
        chipId: "CLHSMF7285631A44",
        faceImage: true, // Indicar que hay imagen facial en el chip
        fingerprints: true, // Indicar que hay huellas dactilares en el chip
        success: true
      };
      
      setStatus('success');
      setMessage('Lectura NFC completada con éxito');
      onSuccess(mockNFCData);
      
    } catch (err) {
      setStatus('error');
      setMessage('Error en la simulación NFC');
      onError('Error en la simulación de lectura NFC');
    }
  };
  
  // Intentar leer NFC real
  const readNFC = async () => {
    // Si estamos en modo demo, usar los datos simulados
    if (demoMode) {
      simulateNFCRead();
      return;
    }
    
    setStatus('reading');
    setMessage('Acerque su documento de identidad al dispositivo...');
    
    try {
      // Comprobar qué API de NFC está disponible
      if ('NDEFReader' in window) {
        // Web NFC API (Chrome en Android)
        readWithWebNFC();
      } 
      else if ('nfc' in navigator && 'reading' in (navigator as any).nfc) {
        // API alternativa (Safari)
        readWithAlternativeNFC();
      }
      else if ('NfcAdapter' in window) {
        // NFC Android API
        readWithAndroidNFC();
      }
      else if ((window as any).androidInterface && (window as any).androidInterface.readNFC) {
        // Interfaz JavaScript-Android
        readWithAndroidInterface();
      }
      else {
        throw new Error('No se encontró una API NFC compatible');
      }
    } catch (err) {
      if (demoMode) {
        // En modo demo, si falla la lectura real, usamos simulación
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage('No se pudo acceder a la funcionalidad NFC');
        onError('Este dispositivo no soporta NFC o no se pudo acceder a la funcionalidad');
      }
    }
  };
  
  // Lectura con Web NFC API (Chrome) utilizando implementación avanzada
  const readWithWebNFC = async () => {
    try {
      const { readWithWebNFC } = await import('@/lib/nfc-real');
      
      setMessage('Acerque su documento al dispositivo...');
      
      // Utilizar la implementación avanzada para leer con Web NFC API
      const nfcData = await readWithWebNFC();
      
      setStatus('success');
      setMessage('Lectura NFC completada con éxito');
      onSuccess(nfcData);
      
    } catch (error: any) {
      // Si estamos en modo demo y falla, usamos simulación
      if (demoMode) {
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage(`Error al iniciar el escaneo NFC: ${error.message}`);
        onError(`Error al iniciar el escaneo NFC: ${error.message}`);
      }
    }
  };
  
  // Implementación para API alternativa (Safari)
  const readWithAlternativeNFC = async () => {
    try {
      const { readWithAlternativeNFC } = await import('@/lib/nfc-real');
      
      setMessage('Acerque su documento al dispositivo...');
      
      // Utilizar la implementación avanzada para la API alternativa
      const nfcData = await readWithAlternativeNFC();
      
      setStatus('success');
      setMessage('Lectura NFC completada con éxito');
      onSuccess(nfcData);
      
    } catch (error: any) {
      // Como fallback, usar simulación en modo demo
      if (demoMode) {
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage(`API NFC alternativa: ${error.message}`);
        onError(`API NFC alternativa: ${error.message}`);
      }
    }
  };
  
  // Implementación para API Android
  const readWithAndroidNFC = async () => {
    try {
      setMessage('Acerque su documento al dispositivo NFC...');
      
      // En una implementación real, usaríamos la API específica de Android
      // Por ahora, intentamos con la interfaz web
      const { readWithWebNFC } = await import('@/lib/nfc-real');
      const nfcData = await readWithWebNFC();
      
      setStatus('success');
      setMessage('Lectura NFC completada con éxito');
      onSuccess(nfcData);
      
    } catch (error: any) {
      // Como fallback, usar simulación en modo demo
      if (demoMode) {
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage(`Error en API Android: ${error.message}`);
        onError(`Error en API Android: ${error.message}`);
      }
    }
  };
  
  // Interfaz JavaScript-Android utilizando implementación avanzada
  const readWithAndroidInterface = async () => {
    try {
      const { readWithAndroidInterface } = await import('@/lib/nfc-real');
      
      setMessage('Acerque su documento al dispositivo...');
      
      // Utilizar la implementación avanzada para la interfaz JavaScript-Android
      const nfcData = await readWithAndroidInterface();
      
      setStatus('success');
      setMessage('Lectura NFC completada con éxito');
      onSuccess(nfcData);
      
    } catch (error: any) {
      // Como fallback, usar simulación en modo demo
      if (demoMode) {
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage(`Error en interfaz Android: ${error.message}`);
        onError(`Error en interfaz Android: ${error.message}`);
      }
    }
  };
  
  // Renderizar diferentes estados
  const renderStatus = () => {
    switch (status) {
      case 'reading':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-ping absolute w-10 h-10 rounded-full bg-blue-400 opacity-75"></div>
              <Smartphone className="w-8 h-8 text-blue-600 relative" />
            </div>
            <p className="font-medium text-blue-700 mb-2">Leyendo chip NFC</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-medium text-green-700 mb-2">¡Lectura exitosa!</p>
            <p className="text-sm text-gray-600">Información del documento obtenida correctamente</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="font-medium text-red-700 mb-2">Error de lectura</p>
            <p className="text-sm text-gray-600">{message}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                if (demoMode) {
                  // En modo demo, podemos simular la lectura directamente
                  simulateNFCRead();
                } else {
                  setStatus('idle');
                  setMessage('Presione el botón para iniciar la lectura');
                }
              }}
            >
              {demoMode ? 'Simular lectura NFC' : 'Intentar nuevamente'}
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-[#2d219b]" />
            </div>
            <p className="font-medium text-[#2d219b] mb-2">Lector NFC</p>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <Button onClick={readNFC} className="bg-[#2d219b] hover:bg-[#221a7c]">
              {demoMode ? 'Iniciar lectura (Demo)' : 'Iniciar lectura NFC'}
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {renderStatus()}
    </div>
  );
};

export default NFCReader;