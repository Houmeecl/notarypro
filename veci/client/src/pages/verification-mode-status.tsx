import { useEffect, useState } from "react";
import {
  verifyRealModeConfig,
  forceRealModeConfig,
} from "@/lib/checkRealModeForced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VerificationModeStatus() {
  const [status, setStatus] = useState<ReturnType<typeof verifyRealModeConfig> | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = () => {
    setLoading(true);
    const result = verifyRealModeConfig();
    setStatus(result);
    setLoading(false);
  };

  const fixConfiguration = () => {
    setLoading(true);
    const result = forceRealModeConfig();
    if (result.success) {
      toast({
        title: "Configuración Actualizada",
        description: result.message,
      });
      checkStatus();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5fa] p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-[#2d219b] text-white">
          <CardTitle className="text-xl">
            Estado del Modo de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center space-x-2">
            <div
              className={`h-4 w-4 rounded-full ${
                status?.isValid ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="font-medium">
              {status?.isValid
                ? "Modo Real Forzado Correctamente"
                : "Configuración de Modo Real Incorrecta"}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Detalles de Configuración</h3>
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Modo Actual:</span>
                    <span className="font-medium">{status?.deviceMode || "No definido"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`font-medium ${
                        status?.isValid ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {status?.isValid ? "Válido" : "Inválido"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {status && !status.isValid && (
              <div>
                <h3 className="text-lg font-medium mb-2">Errores Detectados</h3>
                <div className="bg-red-50 rounded-md p-4 border border-red-200">
                  <ul className="list-disc list-inside space-y-1">
                    {status.errors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">
                        <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {status && status.isValid && (
              <div>
                <h3 className="text-lg font-medium mb-2">Verificación Completa</h3>
                <div className="bg-green-50 rounded-md p-4 border border-green-200">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>La aplicación está correctamente configurada en modo real forzado.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <Button
                onClick={checkStatus}
                variant="outline"
                className="border-[#2d219b] text-[#2d219b]"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Verificar Estado
              </Button>
              
              {status && !status.isValid && (
                <Button
                  onClick={fixConfiguration}
                  className="bg-[#2d219b] hover:bg-[#231c7c]"
                  disabled={loading}
                >
                  Forzar Modo Real
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}