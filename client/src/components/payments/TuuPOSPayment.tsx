import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PaymentProps {
  amount: number;
  terminalId?: string;
  description?: string;
  onPaymentComplete?: (transactionData: any) => void;
  onPaymentError?: (error: any) => void;
  clientRut?: string;
  autoStart?: boolean;
}

enum PaymentStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  WAITING = 'waiting',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELED = 'canceled'
}

const TuuPOSPayment: React.FC<PaymentProps> = ({
  amount,
  terminalId,
  description = 'Pago NotaryPro',
  onPaymentComplete,
  onPaymentError,
  clientRut,
  autoStart = false
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [transaction, setTransaction] = useState<any>(null);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string>(terminalId || '');
  const [error, setError] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<any>(null);

  // Cargar terminales disponibles al iniciar
  useEffect(() => {
    if (!terminalId) {
      fetchTerminals();
    } else {
      setSelectedTerminal(terminalId);
    }
  }, [terminalId]);

  // Iniciar automáticamente si se solicita
  useEffect(() => {
    if (autoStart && selectedTerminal) {
      handleStartPayment();
    }
  }, [autoStart, selectedTerminal]);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Obtener terminales disponibles
  const fetchTerminals = async () => {
    try {
      const response = await apiRequest('GET', '/api/tuu-payment/terminals');
      const data = await response.json();
      
      if (data.success && data.data) {
        setTerminals(data.data);
        if (data.data.length > 0 && !selectedTerminal) {
          setSelectedTerminal(data.data[0].id);
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron obtener los terminales disponibles',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error al obtener terminales:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servicio de pagos',
        variant: 'destructive'
      });
    }
  };

  // Iniciar proceso de pago
  const handleStartPayment = async () => {
    if (!selectedTerminal) {
      toast({
        title: 'Terminal no seleccionado',
        description: 'Debe seleccionar un terminal para continuar',
        variant: 'destructive'
      });
      return;
    }

    setStatus(PaymentStatus.INITIALIZING);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/tuu-payment/create-transaction', {
        amount,
        terminalId: selectedTerminal,
        description,
        currency: 'CLP',
        clientRut
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setTransaction(data.data);
        setStatus(PaymentStatus.WAITING);
        
        // Iniciar comprobación de estado
        const interval = setInterval(() => checkTransactionStatus(data.data.id), 3000);
        setStatusCheckInterval(interval);
        
        toast({
          title: 'Procesando pago',
          description: 'Siga las instrucciones en la terminal POS',
        });
      } else {
        setStatus(PaymentStatus.ERROR);
        setError(data.message || 'Error al iniciar la transacción');
        
        if (onPaymentError) {
          onPaymentError(data);
        }
        
        toast({
          title: 'Error',
          description: data.message || 'Error al iniciar el pago',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error al iniciar transacción:', error);
      setStatus(PaymentStatus.ERROR);
      setError(error.message || 'Error de conexión');
      
      if (onPaymentError) {
        onPaymentError(error);
      }
      
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servicio de pagos',
        variant: 'destructive'
      });
    }
  };

  // Comprobar estado de la transacción
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const response = await apiRequest('GET', `/api/tuu-payment/transaction/${transactionId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setTransaction(data.data);
        
        // Actualizar estado según respuesta
        const transactionStatus = data.data.status.toLowerCase();
        
        if (transactionStatus === 'completed' || transactionStatus === 'approved') {
          setStatus(PaymentStatus.SUCCESS);
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
          
          toast({
            title: 'Pago exitoso',
            description: 'La transacción ha sido completada con éxito',
          });
          
          if (onPaymentComplete) {
            onPaymentComplete(data.data);
          }
        } else if (transactionStatus === 'declined' || transactionStatus === 'failed' || transactionStatus === 'error') {
          setStatus(PaymentStatus.ERROR);
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
          setError(data.data.message || 'Transacción rechazada');
          
          toast({
            title: 'Pago fallido',
            description: data.data.message || 'La transacción ha sido rechazada',
            variant: 'destructive'
          });
          
          if (onPaymentError) {
            onPaymentError(data.data);
          }
        } else if (transactionStatus === 'canceled') {
          setStatus(PaymentStatus.CANCELED);
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
          
          toast({
            title: 'Pago cancelado',
            description: 'La transacción ha sido cancelada',
            variant: 'destructive'
          });
          
          if (onPaymentError) {
            onPaymentError(data.data);
          }
        } else if (transactionStatus === 'processing') {
          setStatus(PaymentStatus.PROCESSING);
        }
      }
    } catch (error) {
      console.error('Error al verificar estado de transacción:', error);
    }
  };

  // Cancelar la transacción
  const handleCancelPayment = async () => {
    if (!transaction || !transaction.id) return;
    
    try {
      await apiRequest('POST', `/api/tuu-payment/transaction/${transaction.id}/cancel`);
      
      setStatus(PaymentStatus.CANCELED);
      
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
      
      toast({
        title: 'Pago cancelado',
        description: 'La transacción ha sido cancelada',
      });
    } catch (error) {
      console.error('Error al cancelar transacción:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la transacción',
        variant: 'destructive'
      });
    }
  };

  // Reiniciar el proceso de pago
  const handleReset = () => {
    setStatus(PaymentStatus.IDLE);
    setTransaction(null);
    setError(null);
    
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  // Renderizar contenido según el estado
  const renderContent = () => {
    switch (status) {
      case PaymentStatus.IDLE:
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="terminal">Terminal POS</Label>
              <select 
                id="terminal"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                value={selectedTerminal}
                onChange={(e) => setSelectedTerminal(e.target.value)}
                disabled={terminalId !== undefined}
              >
                <option value="">Seleccione un terminal</option>
                {terminals.map((terminal: any) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name || terminal.id} - {terminal.model}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              className="w-full" 
              onClick={handleStartPayment}
              disabled={!selectedTerminal}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Iniciar Pago con Tarjeta
            </Button>
          </>
        );
      
      case PaymentStatus.INITIALIZING:
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Iniciando transacción...</p>
          </div>
        );
      
      case PaymentStatus.WAITING:
      case PaymentStatus.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <Terminal className="h-8 w-8 text-primary mb-4" />
            <p className="text-center font-medium mb-2">
              {status === PaymentStatus.WAITING 
                ? 'Esperando acción en el terminal' 
                : 'Procesando pago...'}
            </p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Siga las instrucciones en la terminal POS
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleCancelPayment}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Transacción
            </Button>
          </div>
        );
      
      case PaymentStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-center font-medium text-green-700 mb-2">¡Pago exitoso!</p>
            <div className="bg-green-50 p-3 rounded-md w-full mt-2 mb-4">
              <p className="text-sm"><strong>ID Transacción:</strong> {transaction?.id}</p>
              <p className="text-sm"><strong>Monto:</strong> ${amount.toLocaleString('es-CL')}</p>
              {transaction?.card && (
                <p className="text-sm">
                  <strong>Tarjeta:</strong> {transaction.card.brand} **** {transaction.card.last_4}
                </p>
              )}
            </div>
            <Button onClick={handleReset} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          </div>
        );
      
      case PaymentStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-center font-medium text-red-700 mb-2">Error en el pago</p>
            <p className="text-center text-sm text-red-600 mb-4">
              {error || 'Ocurrió un error durante el procesamiento del pago'}
            </p>
            <Button onClick={handleReset} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar Nuevamente
            </Button>
          </div>
        );
      
      case PaymentStatus.CANCELED:
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <XCircle className="h-10 w-10 text-amber-500 mb-4" />
            <p className="text-center font-medium text-amber-700 mb-2">Transacción cancelada</p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              La transacción ha sido cancelada
            </p>
            <Button onClick={handleReset} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Iniciar Nuevamente
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Terminal className="mr-2 h-5 w-5" />
          Pago con Terminal POS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground">
        <p>Monto a pagar: <span className="font-semibold">${amount.toLocaleString('es-CL')}</span></p>
        <p className="text-xs mt-1">Powered by Tuu Payments</p>
      </CardFooter>
    </Card>
  );
};

export default TuuPOSPayment;