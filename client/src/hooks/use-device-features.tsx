/**
 * Hook para gestionar características del dispositivo (NFC, cámara) tanto en modo real como demo
 * 
 * Este hook asegura que tanto en modo real como en modo demo,
 * las características fundamentales como NFC y cámara estén disponibles.
 */

import { useEffect, useState } from "react";
import { checkIsDemoMode } from "@/lib/deviceModeDetector";

export function useDeviceFeatures() {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [hasNfc, setHasNfc] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoMode] = useState(checkIsDemoMode());

  useEffect(() => {
    // Detectar capacidades de cámara
    const detectCamera = async () => {
      try {
        if (demoMode) {
          console.log('Modo demo: Simulando disponibilidad de cámara');
          setHasCamera(true);
          return;
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('getUserMedia no está soportado en este navegador');
          setHasCamera(false);
          return;
        }
        
        // Intentar acceder a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCamera(true);
        
        // Liberar recursos
        stream.getTracks().forEach(track => track.stop());
        
      } catch (error) {
        console.warn('Error al detectar cámara:', error);
        setHasCamera(false);
      }
    };
    
    // Detectar capacidades de NFC
    const detectNfc = () => {
      if (demoMode) {
        console.log('Modo demo: Simulando disponibilidad de NFC');
        setHasNfc(true);
        return;
      }
      
      // Verificar soporte nativo de NFC
      setHasNfc(!!window.NDEFReader);
    };
    
    const detectFeatures = async () => {
      await detectCamera();
      detectNfc();
      setIsLoading(false);
    };
    
    detectFeatures();
  }, [demoMode]);
  
  // En modo demo, simular siempre NFC y cámara disponibles
  const simulateNfcRead = async (callback: (data: any) => void) => {
    // Si estamos en modo real, no simular
    if (!demoMode) {
      throw new Error('No se puede simular la lectura NFC en modo real');
    }
    
    console.log('Simulando lectura NFC en modo demo...');
    
    // Esperar un tiempo aleatorio para simular lectura
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Generar datos simulados de una cédula chilena
    const simulatedData = {
      documentNumber: `${1 + Math.floor(Math.random() * (25000000 - 1))}`,
      names: "Demo Usuario",
      surnames: "VecinoXpress POS",
      nationality: "CHL",
      sex: Math.random() > 0.5 ? "M" : "F",
      birthDate: "1990-01-01",
      expiryDate: "2030-01-01",
      issueDate: "2020-01-01",
      personalNumber: `${1000 + Math.floor(Math.random() * 9000)}${100 + Math.floor(Math.random() * 900)}`,
      _readingDevice: "DEMO_DEVICE"
    };
    
    callback(simulatedData);
    return simulatedData;
  };
  
  // Función para capturar foto de la cámara (real o simulada)
  const capturePhoto = async (cameraFacing: 'user' | 'environment' = 'user'): Promise<string> => {
    if (demoMode) {
      console.log('Simulando captura de foto en modo demo...');
      
      // Esperar un tiempo aleatorio para simular captura
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      // En modo demo, devolver una imagen base64 de ejemplo
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAyAEsDASIAAhEBAxEB/8QAHAAAAgIDAQEAAAAAAAAAAAAAAAUEBgIDBwEI/8QAMRAAAgEDAwMDAgQGAwAAAAAAAQIDAAQRBRIhBjFBE1FhInEHFIGRFTJCobHBI2LR/8QAGQEAAwEBAQAAAAAAAAAAAAAAAgMEAQUA/8QAHxEAAgIDAQEBAQAAAAAAAAAAAAECEQMSITEEQVEi/9oADAMBAAIRAxEAPwDVRRRXznW0FFFFABSu/vGaQW1tzM/c+Eas39KL5J9vimLMFBJOAO5Nc8vLoahfvcHlEP0g+Dj/ABk4+4pOfJVUFuzh40e61bFd6nZlJA0l8ysowwIhTIwfbLA/vXhsdWZgUtbYLngNK5/sMUusYnTSY45FIkY7/wC53HnxwafegoIYTDImVZiQG7YxyMVL9E5r7F/Br47+FUUUUVaJgooopiCiouo6hp1hE0t/f21rEvdppQgP2BOT9qrg6+6ROQ2v2LA8MvqM37hcj9MUG6Xof2rLnTfULOKazDllQb8Hthf3OQK1N1SqOUt7aWY4wCAqknjnJO0fqarM3Vthb5+trgtnwgIGfABIz5ofoQrpC8kpccLhM3UtZvZreK2slUNKGcHYSx9gSRwP1qg9Qzyxapc7ZnKM+VYnJAzjC59gMfFMr/qVmJaJgIzxuXaPH2FV6drtrlnmZ5JiSeec+9QSk5vRD1wV4LRCRpPrmfUYxjCqO1fQXRdhJp/TFtbyTNLK4MkjscktIdzc+wDED7V856LcxQ3e64YhQDgjtkj/AOe9fSvTepLqmkWt2CDviBdQclXX6XB9wQQftVH0PhJiXUXCiiitGhRRRQMp/wCL2vXOjdKSS2crRTXEq28cwz/xhgS7DPGQoIHzmuLahqGpahKxurlnTduCk/SDnJ4HIHPk11D8bbUXGg2kjH/8U5DL5wyvz+o4/WuUX1olvpkL+nulYnGCf5TnJAz2+KTL7A+DxTqvgmudP1CG5I/hsrTEEZTnGOCQGJ9geK2JbvGAJowXzkM3dT8+31VW7We6lY+iu4HsGHOPcitU81+rMs0jlO2CxJGfbIPelfVHLdJ/4F8IXOiXNHXVnZxJhNxcxgtnwQMgHyftVrtZJGgRyZBIyAyYVSM+xOeD27etcwsJ9QMoaBsRsuM5+DyFOO5OavPTHoswn9UmQx5PfuyMTj/uKs+bLGMtrAVUuIvlFFFWMYKKKKAPnb8UZdupzsHSXLlAzjG1hjcozxwCTz3zVYmvdQ1FRFJLGUZwqYUBlDY3AAjCjA7/ADXUur+irjVNeuJ7aVIY52E0Zb6viRT8AAg+Kpd/0JrlvnbaxXQHlJsZ+wYA1JvbofYtXQ9zYs3p3TGSQchpg6r3wBycdwPatOvW0lm4igmLo6ZcO25mBAOT2GQcEDgCmlz0rrcEJd9LkwO+w8/scmqlrMt7Fu9eF0J/piJU/YgYND/vwe77QfVH4mXukTvdW1sLUkjY67W3ADJ5+WLHj2rp3TPVdlren2VzEyC6e3TzlCxwN6t7qRnBz/iubTdNWWvW8Ztu7qiRKvKjgKFPoqvgYJ7n7VZenOiNY0mMR28Np6aHKRNEHCfOUIIz80yE9klYE4pssFFFFXCBRRRQAUUUUAeYHtVA/EK2trYQ3ZjCztKYycAFlx9PJ74Iz+lFFZkXsW4v5Gx9D3V5b9PWkd0+6ULnHlQeSoJ8geK1dC2kFh1DcW1ugSNY4yFA4UH6sAfbJH6UUVIn1ItfDsdFFFA0KKKKACiiigD/2Q==';
    }
    
    // En modo real, intentar capturar de la cámara
    if (!hasCamera) {
      throw new Error('Cámara no disponible');
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: cameraFacing }
      });
      
      // Crear un elemento video temporal
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Esperar a que el video esté cargado
      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          // Tomar la captura
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          setTimeout(() => {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Detener la cámara
            stream.getTracks().forEach(track => track.stop());
            
            // Convertir a base64
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve(dataUrl);
          }, 300);
        };
        
        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Error al inicializar el video'));
        };
      });
      
    } catch (error) {
      console.error('Error al capturar foto:', error);
      throw error;
    }
  };
  
  return {
    hasCamera,
    hasNfc,
    isLoading,
    isDemoMode: demoMode,
    simulateNfcRead,
    capturePhoto
  };
}