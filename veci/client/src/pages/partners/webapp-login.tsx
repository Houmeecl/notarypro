import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const WebappLogin = () => {
  const [storeCode, setStoreCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeCode.trim()) {
      setError('Debes ingresar un código de local');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('POST', '/api/partners/webapp/store-login', { 
        storeCode: storeCode.trim() 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }
      
      const storeData = await res.json();
      
      // Guardar en localStorage para persistencia de sesión
      localStorage.setItem('webapp_store', JSON.stringify(storeData));
      
      toast({
        title: 'Sesión iniciada',
        description: `Bienvenido/a a ${storeData.storeName}`,
      });
      
      // Redireccionar al dashboard o POS
      navigate('/partners/webapp-pos');
    } catch (error) {
      console.error('Error de login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
      
      toast({
        title: 'Error de inicio de sesión',
        description: error instanceof Error ? error.message : 'Error al iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Acceso a POS Web</CardTitle>
          <CardDescription>
            Ingresa el código de tu local para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-code">Código de local</Label>
                <Input
                  id="store-code"
                  placeholder="Ej: VC-123456"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  disabled={loading}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button type="submit" disabled={loading || !storeCode.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <p>
            Este es el acceso alternativo web para los puntos de servicio Vecinos Express.
          </p>
          <p className="mt-2">
            Si no conoces tu código de local, consulta con tu supervisor.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WebappLogin;