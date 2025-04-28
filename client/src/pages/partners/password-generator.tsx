import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCopy, RefreshCw, Lock } from 'lucide-react';

const PasswordGenerator = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(12);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = '';
    let newPassword = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos un tipo de carácter',
        variant: 'destructive',
      });
      return;
    }
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    
    setPassword(newPassword);
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una nueva contraseña segura',
    });
  };
  
  const copyToClipboard = () => {
    if (!password) {
      toast({
        title: 'Error',
        description: 'No hay contraseña para copiar',
        variant: 'destructive',
      });
      return;
    }
    
    navigator.clipboard.writeText(password)
      .then(() => {
        toast({
          title: 'Copiado',
          description: 'Contraseña copiada al portapapeles',
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'No se pudo copiar al portapapeles',
          variant: 'destructive',
        });
      });
  };
  
  const calculatePasswordStrength = (): { strength: string; color: string } => {
    if (!password) return { strength: 'Sin contraseña', color: 'bg-gray-300' };
    
    let score = 0;
    
    // Length factor
    if (length > 10) score += 2;
    else if (length > 8) score += 1;
    
    // Character types
    if (includeUppercase) score += 1;
    if (includeLowercase) score += 1;
    if (includeNumbers) score += 1;
    if (includeSymbols) score += 2;
    
    // Variety check
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 2;
    
    // Final strength assessment
    if (score >= 10) return { strength: 'Muy fuerte', color: 'bg-green-500' };
    if (score >= 7) return { strength: 'Fuerte', color: 'bg-green-400' };
    if (score >= 5) return { strength: 'Moderada', color: 'bg-yellow-400' };
    if (score >= 3) return { strength: 'Débil', color: 'bg-orange-400' };
    return { strength: 'Muy débil', color: 'bg-red-500' };
  };
  
  const { strength, color } = calculatePasswordStrength();
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Generador de Contraseñas
          </CardTitle>
          <CardDescription>
            Genera contraseñas seguras para usuarios POS de Vecinos Express
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña aparecerá aquí"
              className="pr-12"
              readOnly
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full px-3"
              onClick={copyToClipboard}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Fortaleza: {strength}</span>
              <span className="font-medium">{length} caracteres</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div 
                className={`h-full rounded-full ${color}`} 
                style={{ width: `${(calculatePasswordStrength().strength === 'Sin contraseña' ? 0 : (password.length / length) * 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="length">Longitud</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="length"
                  value={[length]}
                  min={8}
                  max={30}
                  step={1}
                  onValueChange={(value) => setLength(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{length}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="uppercase">Incluir mayúsculas (A-Z)</Label>
                <Switch
                  id="uppercase"
                  checked={includeUppercase}
                  onCheckedChange={setIncludeUppercase}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="lowercase">Incluir minúsculas (a-z)</Label>
                <Switch
                  id="lowercase"
                  checked={includeLowercase}
                  onCheckedChange={setIncludeLowercase}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="numbers">Incluir números (0-9)</Label>
                <Switch
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={setIncludeNumbers}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="symbols">Incluir símbolos (!@#$%)</Label>
                <Switch
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={setIncludeSymbols}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generatePassword} 
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generar contraseña
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordGenerator;