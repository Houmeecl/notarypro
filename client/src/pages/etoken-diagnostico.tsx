import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";

export default function EtokenDiagnostico() {
  const [status, setStatus] = useState({
    windowCheck: false,
    extensionCheck: false,
    extensionLoaded: false,
    message: ""
  });
  
  const checkExtension = () => {
    try {
      // Paso 1: Verificar si window existe
      if (typeof window !== "undefined") {
        setStatus(prev => ({ ...prev, windowCheck: true }));
        
        // Paso 2: Verificar si window.firmaDigitalChile existe
        if (window.firmaDigitalChile) {
          setStatus(prev => ({ 
            ...prev, 
            extensionCheck: true,
            message: "Extensión detectada en window.firmaDigitalChile"
          }));
          
          // Paso 3: Verificar si la extensión tiene la función isAvailable
          if (typeof window.firmaDigitalChile.isAvailable === "function") {
            window.firmaDigitalChile.isAvailable()
              .then((available: boolean) => {
                setStatus(prev => ({ 
                  ...prev, 
                  extensionLoaded: available,
                  message: available 
                    ? "La extensión está completamente disponible y funcionando" 
                    : "La extensión está presente pero no está completamente disponible"
                }));
              })
              .catch((error: any) => {
                setStatus(prev => ({ 
                  ...prev, 
                  message: `Error al verificar disponibilidad: ${error.message || "Error desconocido"}`
                }));
              });
          } else {
            setStatus(prev => ({ 
              ...prev, 
              message: "La extensión existe pero no tiene el método isAvailable"
            }));
          }
        } else {
          setStatus(prev => ({ 
            ...prev, 
            message: "La extensión firmaDigitalChile no está disponible en el objeto window"
          }));
        }
      } else {
        setStatus(prev => ({ 
          ...prev, 
          message: "Error: window no está definido"
        }));
      }
    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        message: `Error general: ${error.message || "Error desconocido"}`
      }));
    }
  };
  
  // Función para mostrar la información de la extensión
  const showExtensionInfo = () => {
    if (!window.firmaDigitalChile) {
      setStatus(prev => ({ 
        ...prev, 
        message: "La extensión no está disponible"
      }));
      return;
    }
    
    try {
      const info = {
        version: window.firmaDigitalChile.version || "No disponible",
        methods: Object.keys(window.firmaDigitalChile)
      };
      
      setStatus(prev => ({ 
        ...prev, 
        message: `Información de la extensión: ${JSON.stringify(info, null, 2)}`
      }));
    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        message: `Error al obtener información: ${error.message || "Error desconocido"}`
      }));
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Diagnóstico de eToken</h1>
      <p className="text-gray-600">
        Esta página realiza diagnósticos detallados para verificar la disponibilidad y configuración
        correcta de la extensión de firma digital.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <Button onClick={checkExtension} className="bg-indigo-600 hover:bg-indigo-700">
          <Shield className="mr-2 h-4 w-4" />
          Verificar extensión
        </Button>
        
        <Button onClick={showExtensionInfo} className="bg-blue-600 hover:bg-blue-700">
          <Shield className="mr-2 h-4 w-4" />
          Mostrar información de la extensión
        </Button>
      </div>

      <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
        <h2 className="text-xl font-semibold">Resultados del diagnóstico</h2>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${status.windowCheck ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Verificación de window</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${status.extensionCheck ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Extensión firmaDigitalChile en window</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${status.extensionLoaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Extensión completamente cargada y disponible</span>
          </div>
        </div>
        
        {status.message && (
          <Alert className={status.extensionLoaded ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            {status.extensionLoaded ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertTitle className={status.extensionLoaded ? "text-green-800" : "text-yellow-800"}>
              Diagnóstico
            </AlertTitle>
            <AlertDescription className={status.extensionLoaded ? "text-green-700" : "text-yellow-700"}>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs mt-2 p-2 bg-white border rounded">
                {status.message}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-indigo-50 text-indigo-800">
        <h2 className="font-semibold mb-2">Requisitos del sistema:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Navegador compatible (Chrome, Firefox, Edge)</li>
          <li>Extensión de firma digital instalada</li>
          <li>Dispositivo eToken físico conectado al equipo</li>
          <li>Drivers del dispositivo correctamente instalados</li>
          <li>Certificados digitales válidos en el token</li>
        </ul>
      </div>
    </div>
  );
}