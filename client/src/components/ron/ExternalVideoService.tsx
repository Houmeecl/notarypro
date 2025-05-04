import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Video, ExternalLink } from 'lucide-react';

interface ExternalVideoServiceProps {
  sessionId: string;
  onSessionEnd?: () => void;
}

export const ExternalVideoService = ({ sessionId, onSessionEnd }: ExternalVideoServiceProps) => {
  const [serviceType, setServiceType] = useState<'zoom' | 'meet'>('zoom');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  const { toast } = useToast();

  // Función para copiar al portapapeles
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado al portapapeles",
        description: message,
      });
    }).catch(err => {
      console.error('No se pudo copiar:', err);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      });
    });
  };

  // Generar mensaje para compartir
  const generateShareMessage = () => {
    if (serviceType === 'zoom') {
      return `Sesión RON ${sessionId}\n\nEnlace Zoom: ${meetingUrl}\nID de reunión: ${meetingId}\nContraseña: ${meetingPassword}\n\nPor favor conéctese a la hora programada.`;
    } else {
      return `Sesión RON ${sessionId}\n\nEnlace Google Meet: ${meetingUrl}\n\nPor favor conéctese a la hora programada.`;
    }
  };

  // Abrir la reunión en una nueva pestaña
  const openMeeting = () => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Por favor, ingrese un enlace de reunión válido.",
        variant: "destructive"
      });
    }
  };

  // Finalizar la sesión
  const endSession = () => {
    setIsActive(false);
    if (onSessionEnd) {
      onSessionEnd();
    }
    
    toast({
      title: 'Sesión finalizada',
      description: 'La sesión RON ha sido finalizada correctamente.',
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-white p-4">
      <Card className="bg-slate-800 border-slate-700 shadow-lg text-white">
        <CardHeader className="border-b border-slate-700 bg-slate-800">
          <CardTitle className="text-xl flex items-center">
            <Video className="mr-2 h-6 w-6 text-blue-400" />
            Sesión RON con {serviceType === 'zoom' ? 'Zoom' : 'Google Meet'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Servicio de videoconferencia</Label>
              <Select 
                value={serviceType} 
                onValueChange={(value: 'zoom' | 'meet') => setServiceType(value)}
              >
                <SelectTrigger id="service-type" className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting-url">Enlace de la reunión</Label>
              <div className="flex gap-2">
                <Input
                  id="meeting-url"
                  type="text"
                  placeholder={`Enlace de ${serviceType === 'zoom' ? 'Zoom' : 'Google Meet'}`}
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(meetingUrl, "Enlace copiado")}
                  className="border-slate-600 hover:bg-slate-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {serviceType === 'zoom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="meeting-id">ID de la reunión</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meeting-id"
                      type="text"
                      placeholder="ID de la reunión Zoom"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(meetingId, "ID copiado")}
                      className="border-slate-600 hover:bg-slate-600"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meeting-password">Contraseña</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meeting-password"
                      type="text"
                      placeholder="Contraseña de la reunión"
                      value={meetingPassword}
                      onChange={(e) => setMeetingPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(meetingPassword, "Contraseña copiada")}
                      className="border-slate-600 hover:bg-slate-600"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            <div className="bg-slate-700 p-4 rounded-md">
              <Label className="block mb-2">Mensaje para compartir</Label>
              <div className="bg-slate-800 p-3 rounded text-sm whitespace-pre-wrap mb-2">
                {generateShareMessage()}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => copyToClipboard(generateShareMessage(), "Información de la reunión copiada")}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar toda la información
              </Button>
            </div>
            
            <div className="pt-4">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={openMeeting}
                disabled={!meetingUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir reunión
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-slate-700 bg-slate-800 flex justify-between">
          <div className="text-sm text-slate-400">
            ID de Sesión RON: {sessionId}
          </div>
          <Button variant="destructive" size="sm" onClick={endSession}>
            Finalizar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExternalVideoService;