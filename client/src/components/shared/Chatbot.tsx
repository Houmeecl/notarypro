import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  title?: string;
  documentContext?: string;
  className?: string;
  onClose?: () => void;
}

export function Chatbot({ 
  title = "Asistente Legal Cerfidoc", 
  documentContext,
  className,
  onClose
}: ChatbotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hola, soy el asistente legal de Cerfidoc. ¿En qué puedo ayudarte hoy?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Añadir mensaje del usuario
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Enviar mensaje al servicio de chatbot
      const response = await apiRequest('POST', '/api/chatbot/message', {
        message: input,
        documentContext
      });
      
      const data = await response.json();
      
      // Añadir respuesta del bot
      const botMessage: Message = {
        text: data.response || "Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        text: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md h-[500px] flex flex-col shadow-lg", className)}>
      <CardHeader className="bg-primary text-white rounded-t-lg py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-primary-foreground/20"
            >
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <CardContent className="p-0 space-y-4">
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-start gap-2 max-w-[80%]",
                message.sender === 'user' ? "ml-auto" : ""
              )}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 bg-primary text-white p-1 rounded-full">
                  <Bot size={18} />
                </div>
              )}
              
              <div className={cn(
                "rounded-lg p-3",
                message.sender === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-muted rounded-tl-none"
              )}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 bg-primary text-white p-1 rounded-full">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta legal..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}