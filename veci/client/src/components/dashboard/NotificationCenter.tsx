import { useState } from "react";
import { 
  Bell,
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  User, 
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "error" | "system";
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  link?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onReadAll?: () => void;
  onDismiss?: (id: number) => void;
  maxHeight?: number;
  className?: string;
}

export function NotificationCenter({
  notifications = [],
  onReadAll,
  onDismiss,
  maxHeight = 400,
  className = ""
}: NotificationCenterProps) {
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Obtener el ícono según tipo
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Justo ahora';
    }
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-3 flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Notificaciones</CardTitle>
          {unreadCount > 0 && (
            <Badge className="ml-1 bg-primary hover:bg-primary px-2 py-0">
              {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      {!collapsed && (
        <>
          {notifications.length === 0 ? (
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground text-sm">No tienes notificaciones</p>
            </CardContent>
          ) : (
            <>
              <CardContent className="p-0">
                <ScrollArea className={`max-h-[${maxHeight}px]`}>
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-medium leading-none truncate">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {getTimeAgo(notification.date)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            {notification.link && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">
                                Ver detalles <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="py-2 px-4 flex justify-between border-t">
                <Button variant="ghost" size="sm" onClick={onReadAll}>
                  Marcar todo como leído
                </Button>
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </CardFooter>
            </>
          )}
        </>
      )}
    </Card>
  );
}