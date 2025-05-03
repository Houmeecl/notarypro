
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { Send, User, Clock, FileText, CheckCheck, AlarmClock, Paperclip } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  senderType: 'system' | 'partner' | 'admin' | 'supervisor';
  content: string;
  attachment?: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  unreadCount: number;
  lastActive?: Date;
}

const VecinosPartnerChat: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { socket, connected } = useWebSocket();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("contacts");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate contacts data
  useEffect(() => {
    const mockContacts: ChatContact[] = [
      {
        id: "1",
        name: "Soporte Técnico",
        role: "Equipo de Soporte",
        status: "online",
        unreadCount: 0,
        lastMessage: "¿En qué podemos ayudarte?",
        lastActive: new Date()
      },
      {
        id: "2",
        name: "Carlos Mendoza",
        role: "Supervisor",
        status: "online",
        unreadCount: 2,
        lastMessage: "Hola, ¿cómo va todo con la terminal POS?",
        lastActive: new Date()
      },
      {
        id: "3",
        name: "Ana Silva",
        role: "Administradora",
        status: "away",
        unreadCount: 0,
        lastMessage: "Por favor envía los documentos pendientes",
        lastActive: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    setContacts(mockContacts);
    
    // Initialize with some example chat history
    const initialHistory: Record<string, Message[]> = {};
    
    initialHistory["1"] = [
      {
        id: "msg1",
        sender: "Soporte Técnico",
        senderType: "admin",
        content: "¡Hola! Bienvenido al chat de soporte de Vecinos NotaryPro. ¿En qué podemos ayudarte hoy?",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        isRead: true
      }
    ];
    
    initialHistory["2"] = [
      {
        id: "msg2",
        sender: "Carlos Mendoza",
        senderType: "supervisor",
        content: "Hola, ¿cómo va todo con la terminal POS?",
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        isRead: false
      },
      {
        id: "msg3",
        sender: "Carlos Mendoza",
        senderType: "supervisor",
        content: "Pasaré a visitarlos la próxima semana para verificar que todo esté funcionando correctamente.",
        timestamp: new Date(Date.now() - 34 * 60 * 1000),
        isRead: false
      }
    ];
    
    initialHistory["3"] = [
      {
        id: "msg4",
        sender: "Ana Silva",
        senderType: "admin",
        content: "Por favor envía los documentos pendientes de la semana pasada.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: "msg5",
        sender: "Mi Tienda",
        senderType: "partner",
        content: "Hola Ana, los enviaré esta tarde sin falta.",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        isRead: true
      }
    ];
    
    setChatHistory(initialHistory);
    
    // Set first contact as active by default
    if (mockContacts.length > 0) {
      setActiveContactId(mockContacts[0].id);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, activeContactId]);

  // Mark messages as read when changing active contact
  useEffect(() => {
    if (activeContactId) {
      // Update contact unread count
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeContactId 
            ? { ...contact, unreadCount: 0 } 
            : contact
        )
      );
      
      // Mark messages as read
      setChatHistory(prev => {
        if (!prev[activeContactId]) return prev;
        
        return {
          ...prev,
          [activeContactId]: prev[activeContactId].map(msg => ({
            ...msg,
            isRead: true
          }))
        };
      });
    }
  }, [activeContactId]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeContactId) return;

    // Create new message
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: "Mi Tienda", // Replace with actual partner name
      senderType: "partner",
      content: message,
      timestamp: new Date(),
      isRead: true
    };

    // Add to chat history
    setChatHistory(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    // Reset input
    setMessage("");
    
    // Simulate response after short delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: contacts.find(c => c.id === activeContactId)?.name || "Unknown",
        senderType: "admin",
        content: `Gracias por tu mensaje. ${Math.random() > 0.5 ? "Un agente te responderá pronto." : "¿Hay algo más en lo que pueda ayudarte?"}`,
        timestamp: new Date(),
        isRead: true
      };
      
      setChatHistory(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), responseMessage]
      }));
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Chat de Soporte</span>
          <Badge 
            variant={connected ? "default" : "secondary"}
            className={connected ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
          >
            {connected ? "Conectado" : "Desconectado"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="contacts" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="grid grid-cols-2 px-4 pt-2">
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="flex-1 overflow-y-auto p-0">
          <div className="p-4 space-y-2">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => {
                  setActiveContactId(contact.id);
                  setActiveTab("chat");
                }}
                className={`p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
                  activeContactId === contact.id ? 'bg-gray-50 border-primary' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          contact.status === 'online' ? 'bg-green-500' : 
                          contact.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center">
                        {contact.name}
                        {contact.unreadCount > 0 && (
                          <Badge className="ml-2 bg-primary" variant="default">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">{contact.role}</p>
                    </div>
                  </div>
                  {contact.lastActive && (
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(contact.lastActive)}
                    </div>
                  )}
                </div>
                {contact.lastMessage && (
                  <p className="text-xs text-gray-600 mt-2 truncate pl-11">
                    {contact.lastMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 overflow-hidden mx-0 mt-0">
          {activeContactId ? (
            <>
              <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {contacts.find(c => c.id === activeContactId)?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">
                      {contacts.find(c => c.id === activeContactId)?.name}
                    </h4>
                    <div className="flex items-center">
                      <span 
                        className={`h-2 w-2 rounded-full mr-1 ${
                          contacts.find(c => c.id === activeContactId)?.status === 'online' 
                            ? 'bg-green-500' 
                            : contacts.find(c => c.id === activeContactId)?.status === 'away'
                              ? 'bg-amber-500'
                              : 'bg-gray-400'
                        }`}
                      ></span>
                      <p className="text-xs text-gray-500">
                        {contacts.find(c => c.id === activeContactId)?.status === 'online' 
                          ? 'En línea' 
                          : contacts.find(c => c.id === activeContactId)?.status === 'away'
                            ? 'Ausente'
                            : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("contacts")}
                  className="text-xs h-8"
                >
                  Volver
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory[activeContactId]?.map((msg, idx, arr) => {
                  // Check if we need to show date header
                  const showDateHeader = idx === 0 || 
                    formatDate(arr[idx-1].timestamp) !== formatDate(msg.timestamp);
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateHeader && (
                        <div className="flex justify-center my-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {formatDate(msg.timestamp)}
                          </Badge>
                        </div>
                      )}
                      
                      <div 
                        className={`flex ${msg.senderType === 'partner' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.senderType === 'partner' 
                              ? 'bg-primary text-white rounded-br-none' 
                              : msg.senderType === 'system'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          {msg.senderType !== 'partner' && (
                            <div className="font-medium text-xs mb-1">
                              {msg.sender}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.timestamp)}
                            </span>
                            {msg.senderType === 'partner' && (
                              <CheckCheck className={`h-3 w-3 ${msg.isRead ? 'text-white' : 'text-white/70'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <CardFooter className="p-3 border-t flex items-end gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 flex-shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input 
                    placeholder="Escribe un mensaje..." 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full"
                  />
                </div>
                <Button 
                  className="rounded-full h-8 w-8 p-0 flex-shrink-0" 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <User className="h-12 w-12 mb-2 text-gray-300" />
              <p>Selecciona un contacto para comenzar a chatear</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VecinosPartnerChat;
