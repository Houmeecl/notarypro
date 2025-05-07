import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Key, ChevronRight, AlertTriangle } from 'lucide-react';

// Importar el servicio independiente para Vecinos Express Standalone
import VecinosStandaloneService from '@/services/vecinos-standalone-service';

// Logo de Vecinos Express
import vecinoLogo from "@/assets/new/vecino-xpress-logo-nuevo.png";

export default function VecinosLoginStandalone() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    if (VecinosStandaloneService.isAuthenticated()) {
      // Si ya está autenticado, redirigir a la aplicación principal
      window.location.href = '/vecinos-standalone';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, ingrese su nombre de usuario y contraseña');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Usar el servicio independiente para el login
      const response = await VecinosStandaloneService.login(username, password);

      // Obtener los datos del usuario actual
      const user = VecinosStandaloneService.getCurrentUser();
      
      if (user) {
        // Mostrar mensaje de éxito
        toast({
          title: '¡Bienvenido!',
          description: `Sesión iniciada como ${user.fullName || user.username}`,
        });
        
        // Redirigir a la aplicación independiente
        window.location.href = '/vecinos-standalone';
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error de login:', error);
      setError('Credenciales incorrectas. Por favor, verifique su nombre de usuario y contraseña.');
      
      toast({
        title: 'Error de inicio de sesión',
        description: 'No se pudo iniciar sesión. Verifique sus credenciales.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Panel de formulario de login */}
      <div className="flex flex-col justify-center items-center md:w-1/2 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-32 mx-auto mb-4" />
            <p className="text-gray-600 mt-1">Accede a tu cuenta para gestionar documentos y trámites</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  {error && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <User className="h-5 w-5" />
                      </span>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Ingrese su nombre de usuario"
                        className="pl-10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Key className="h-5 w-5" />
                      </span>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingrese su contraseña"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#2d219b] hover:bg-[#241a7d] text-white font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          Iniciar Sesión
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-gray-500 text-center">
                <a href="#" className="text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Contacta a soporte si tienes problemas para acceder
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Panel informativo */}
      <div className="hidden md:flex md:w-1/2 bg-[#2d219b] text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6">Tu plataforma para trámites legales simplificados</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Firma Digital Avanzada</h3>
                <p className="text-white/80">Firma documentos con validez legal desde cualquier dispositivo</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Verificación de Identidad</h3>
                <p className="text-white/80">Tecnología biométrica para garantizar la identidad de los firmantes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Gestión Documental</h3>
                <p className="text-white/80">Administra, organiza y verifica todos tus documentos en un solo lugar</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-white/10 p-4 rounded-lg">
            <p className="italic text-white/90">
              "VecinoExpress ha transformado nuestra forma de gestionar documentos, reduciendo el tiempo de procesamiento en un 70% y mejorando la experiencia de nuestros clientes."
            </p>
            <p className="mt-2 font-semibold">— Roberto Martínez, Gerente Legal</p>
          </div>
        </div>
      </div>
    </div>
  );
}