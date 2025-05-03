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
      const mockNFCData = {
        documentType: "CI-CHL",
        documentNumber: "12345678-9",
        names: "JUAN PEDRO",
        surnames: "RODRIGUEZ SOTO",
        nationality: "CHL",
        birthDate: "1985-06-15",
        gender: "M",
        issueDate: "2020-01-10",
        expiryDate: "2030-01-10",
        personalNumber: "12345678-9",
        chipId: "CLHSMF123456789",
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
  
  // Lectura con Web NFC API (Chrome)
  const readWithWebNFC = async () => {
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        // Procesar mensaje NDEF
        const records = Array.from(message.records);
        const textDecoder = new TextDecoder();
        
        // Extraer datos relevantes
        let nfcData: any = {
          chipId: serialNumber,
          success: true
        };
        
        records.forEach((record: any) => {
          if (record.recordType === "text") {
            const text = textDecoder.decode(record.data);
            try {
              const parsedData = JSON.parse(text);
              nfcData = { ...nfcData, ...parsedData };
            } catch (e) {
              // Si no es JSON, guardar como texto plano
              nfcData.rawText = text;
            }
          }
        });
        
        setStatus('success');
        setMessage('Lectura NFC completada con éxito');
        onSuccess(nfcData);
      });
      
      ndef.addEventListener("error", (error: any) => {
        setStatus('error');
        setMessage(`Error en la lectura NFC: ${error.message}`);
        onError(`Error en la lectura NFC: ${error.message}`);
      });
      
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
  
  // Implementaciones alternativas para diferentes APIs NFC
  const readWithAlternativeNFC = () => {
    // Implementación para API alternativa (Safari)
    // Como fallback, usar simulación en modo demo
    if (demoMode) {
      simulateNFCRead();
    } else {
      setStatus('error');
      setMessage('API NFC no implementada en este navegador');
      onError('API NFC no implementada en este navegador');
    }
  };
  
  const readWithAndroidNFC = () => {
    // Implementación para API Android
    // Como fallback, usar simulación en modo demo
    if (demoMode) {
      simulateNFCRead();
    } else {
      setStatus('error');
      setMessage('API NFC Android no implementada');
      onError('API NFC Android no implementada');
    }
  };
  
  const readWithAndroidInterface = () => {
    // Implementación para interfaz JavaScript-Android
    try {
      (window as any).androidInterface.readNFC((result: string) => {
        try {
          const nfcData = JSON.parse(result);
          if (nfcData.success) {
            setStatus('success');
            setMessage('Lectura NFC completada con éxito');
            onSuccess(nfcData);
          } else {
            throw new Error(nfcData.error || 'Error desconocido');
          }
        } catch (parseError) {
          setStatus('error');
          setMessage('Error al procesar los datos NFC');
          onError('Error al procesar los datos NFC');
        }
      });
    } catch (error) {
      // Como fallback, usar simulación en modo demo
      if (demoMode) {
        simulateNFCRead();
      } else {
        setStatus('error');
        setMessage('Error al comunicarse con la interfaz Android');
        onError('Error al comunicarse con la interfaz Android');
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
                setStatus('idle');
                setMessage('Presione el botón para iniciar la lectura');
              }}
            >
              Intentar nuevamente
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-gray-600" />
            </div>
            <p className="font-medium text-gray-700 mb-2">Lector NFC</p>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <Button onClick={readNFC}>
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