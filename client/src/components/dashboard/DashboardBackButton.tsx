import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface DashboardBackButtonProps {
  className?: string;
}

export default function DashboardBackButton({ className = "" }: DashboardBackButtonProps) {
  const { user } = useAuth();
  
  // Determinar a qué dashboard redirigir según el rol del usuario
  const getDashboardUrl = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "certifier":
        return "/certifier-dashboard";
      case "lawyer":
        return "/lawyer-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  return (
    <Link href={getDashboardUrl()}>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex items-center gap-2 hover:bg-slate-100 ${className}`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Dashboard</span>
      </Button>
    </Link>
  );
}