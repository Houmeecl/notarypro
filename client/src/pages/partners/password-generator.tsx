import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

export default function PasswordGenerator() {
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();

  // Función para generar contraseña directamente en el frontend para demo
  const generatePassword = () => {
    // Caracteres posibles para la contraseña
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_-+=<>?';

    // Inicio con caracteres en minúscula
    let allChars = lowercaseChars;
    
    // Agregar otros conjuntos de caracteres según sea necesario
    if (includeUppercase) allChars += uppercaseChars;
    if (includeNumbers) allChars += numberChars;
    if (includeSymbols) allChars += symbolChars;

    // Generar la contraseña
    let password = '';
    
    // Asegurar que la contraseña contenga al menos un carácter de cada tipo incluido
    if (includeUppercase) {
      password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    }
    
    if (includeNumbers) {
      password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    }
    
    if (includeSymbols) {
      password += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
    }
    
    // Completar el resto de la contraseña
    while (password.length < passwordLength) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars.charAt(randomIndex);
    }
    
    // Mezclar caracteres para evitar un patrón predecible
    password = shuffleString(password);
    
    setGeneratedPassword(password);
  };

  // Mezclar caracteres de una cadena
  const shuffleString = (str: string): string => {
    const arr = str.split('');
    
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr.join('');
  };

  // Copiar contraseña al portapapeles
  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword).then(() => {
        toast({
          title: 'Contraseña copiada',
          description: 'La contraseña ha sido copiada al portapapeles',
        });
      });
    }
  };

  // Evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    
    // Longitud contribuye a la fortaleza
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;
    
    // Variedad de caracteres contribuye a la fortaleza
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Clasificación de fortaleza
    if (strength <= 2) return { strength: 1, text: 'Débil', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 2, text: 'Moderada', color: 'bg-yellow-500' };
    return { strength: 3, text: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = evaluatePasswordStrength(generatedPassword);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Generador de Contraseñas Seguras</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password-length">Longitud de la contraseña: {passwordLength}</Label>
                </div>
                <Slider
                  id="password-length"
                  min={6}
                  max={32}
                  step={1}
                  value={[passwordLength]}
                  onValueChange={(value) => setPasswordLength(value[0])}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="uppercase" 
                    checked={includeUppercase}
                    onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
                  />
                  <Label htmlFor="uppercase">Incluir letras mayúsculas (A-Z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="numbers" 
                    checked={includeNumbers}
                    onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
                  />
                  <Label htmlFor="numbers">Incluir números (0-9)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="symbols" 
                    checked={includeSymbols}
                    onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
                  />
                  <Label htmlFor="symbols">Incluir símbolos (!@#$%^&*)</Label>
                </div>
              </div>
              
              <Button 
                onClick={generatePassword} 
                className="w-full"
              >
                Generar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contraseña Generada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedPassword ? (
                <>
                  <div className="flex">
                    <Input 
                      value={generatedPassword} 
                      readOnly 
                      className="font-mono text-lg"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyToClipboard}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortaleza:</span>
                      <span>{passwordStrength.text}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color}`} 
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">Seguridad de tu contraseña:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Longitud: {generatedPassword.length} caracteres</li>
                      <li>Contiene letras minúsculas: {/[a-z]/.test(generatedPassword) ? '✓' : '✗'}</li>
                      <li>Contiene letras mayúsculas: {/[A-Z]/.test(generatedPassword) ? '✓' : '✗'}</li>
                      <li>Contiene números: {/[0-9]/.test(generatedPassword) ? '✓' : '✗'}</li>
                      <li>Contiene símbolos: {/[^A-Za-z0-9]/.test(generatedPassword) ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Configura los parámetros y genera una contraseña</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Acerca de la generación de contraseñas seguras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              En el sistema Vecinos, utilizamos un algoritmo avanzado para generar contraseñas seguras para los usuarios de los puntos de servicio POS. 
              Estas contraseñas se generan automáticamente cuando:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Se crea una nueva tienda asociada en el panel de administración</li>
              <li>Se registra un nuevo socio a través del formulario de afiliación</li>
              <li>Se resetea manualmente la contraseña de un usuario POS</li>
            </ul>
            <p>
              Las contraseñas generadas cumplen con los estándares más altos de seguridad:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mínimo de 12 caracteres para mayor seguridad</li>
              <li>Combinación de letras mayúsculas y minúsculas</li>
              <li>Inclusión de números y símbolos especiales</li>
              <li>Distribución aleatoria para evitar patrones predecibles</li>
            </ul>
            <p className="text-red-500 font-semibold">
              ¡Importante! Las contraseñas generadas deben ser guardadas y comunicadas de forma segura a los usuarios finales.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}