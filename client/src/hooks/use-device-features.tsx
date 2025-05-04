import { useState, useEffect, createContext, useContext } from 'react';

// Interface para el contexto de detección de dispositivo
interface DeviceFeatures {
  hasCamera: boolean | null;
  hasNfc: boolean | null;
  deviceModel: string | null;
  deviceSupportsNFC: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  simulateNfcRead: (callback: (data: any) => void) => Promise<any>;
  capturePhoto: (cameraFacing?: 'user' | 'environment') => Promise<string>;
}

// Crear contexto
const DeviceFeaturesContext = createContext<DeviceFeatures | null>(null);

// Proveedor del contexto
export function DeviceFeaturesProvider({ children }: { children: React.ReactNode }) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [hasNfc, setHasNfc] = useState<boolean | null>(null);
  const [deviceModel, setDeviceModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // Detectar características del dispositivo
  useEffect(() => {
    const detectDeviceFeatures = async () => {
      setIsLoading(true);
      
      // Detectar sistema operativo
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isAndroidDevice = /android/.test(userAgent);
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      
      setIsAndroid(isAndroidDevice);
      setIsIOS(isIOSDevice);
      
      // Detectar modelo de dispositivo
      let deviceModelName = 'Dispositivo Desconocido';
      
      if (isAndroidDevice) {
        const match = userAgent.match(/android\s([0-9.]+);\s([^;]+)/);
        if (match && match[2]) {
          deviceModelName = match[2].trim();
        }
      } else if (isIOSDevice) {
        const match = userAgent.match(/iphone|ipad|ipod/);
        if (match) {
          deviceModelName = match[0].charAt(0).toUpperCase() + match[0].slice(1);
        }
      }
      
      setDeviceModel(deviceModelName);
      
      // Detectar si tiene NFC
      const hasNfcSupport = 
        isAndroidDevice && 
        'NDEFReader' in window && 
        typeof (window as any).NDEFReader === 'function';
      
      setHasNfc(hasNfcSupport);

      // Detectar si tiene cámara
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      } catch (err) {
        console.error('Error detectando cámara:', err);
        setHasCamera(false);
      }
      
      setIsLoading(false);
    };

    detectDeviceFeatures();
  }, []);

  // Simular lectura NFC (modo demo)
  const simulateNfcRead = async (callback: (data: any) => void) => {
    console.log('Simulando lectura NFC...');
    
    // Simular delay de lectura
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Datos de ejemplo de una cédula chilena
    const mockNfcData = {
      documentNumber: '12345678-9',
      names: 'JUAN PEDRO',
      lastNames: 'GONZALEZ RODRIGUEZ',
      nationality: 'CHL',
      gender: 'M',
      dateOfBirth: '1985-05-15',
      dateOfExpiry: '2030-05-14',
      issueDate: '2020-05-15',
      documentType: 'ID',
      _readingDevice: 'DEMO_DEVICE'
    };
    
    // Ejecutar callback con datos simulados
    callback(mockNfcData);
    
    return mockNfcData;
  };

  // Capturar foto (real o simulada)
  const capturePhoto = async (cameraFacing: 'user' | 'environment' = 'environment'): Promise<string> => {
    if (!hasCamera && !isDemoMode) {
      throw new Error('Este dispositivo no tiene cámara');
    }
    
    if (isDemoMode) {
      // En modo demo, retornar una imagen de ejemplo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/...'; // Base64 truncado
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing }
      });
      
      // Crear un elemento video para capturar la imagen
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Esperar a que el video se cargue
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(null);
        };
      });
      
      // Crear un canvas para capturar la imagen
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detener la transmisión
      stream.getTracks().forEach(track => track.stop());
      
      // Convertir canvas a base64
      return canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error('Error al capturar foto:', error);
      throw new Error('No se pudo acceder a la cámara');
    }
  };

  // Determinar si estamos en modo demo basado en configuración o falta de hardware
  const isDemoMode = !hasNfc || window.location.hostname === 'localhost' || 
                    window.location.search.includes('demo=true');

  return (
    <DeviceFeaturesContext.Provider value={{
      hasCamera,
      hasNfc,
      deviceModel,
      deviceSupportsNFC: !!hasNfc,
      isAndroid,
      isIOS,
      isLoading,
      isDemoMode,
      simulateNfcRead,
      capturePhoto
    }}>
      {children}
    </DeviceFeaturesContext.Provider>
  );
}

// Hook para usar el contexto
export function useDeviceFeatures() {
  const context = useContext(DeviceFeaturesContext);
  
  if (!context) {
    throw new Error('useDeviceFeatures debe ser usado dentro de un DeviceFeaturesProvider');
  }
  
  return context;
}