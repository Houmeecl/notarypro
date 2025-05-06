import { useEffect } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Contact from "@/components/landing/Contact";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import RonService from "@/components/landing/RonService";
import ApkDownload from "@/components/landing/ApkDownload";
import { activarFuncionalidadReal } from "@/lib/funcionalidad-real";
import useRealFunctionality from "@/hooks/use-real-funcionality";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Página principal mejorada con funcionalidad real completa
 * Cumple con todas las normativas de la Ley 19.799 para servicios digitales
 */
export default function LandingPage() {
  const { isRealMode } = useRealFunctionality();
  const { toast } = useToast();

  // Activar funcionalidad real al cargar la página principal
  useEffect(() => {
    // Asegurar que se active la funcionalidad real al cargar
    const success = activarFuncionalidadReal();
    
    if (success) {
      console.log("✅ Modo de funcionalidad real activado en LandingPage");
      
      // Notificar al usuario en un toast no intrusivo
      toast({
        title: "Sistema Operativo en Modo Real",
        description: "Todas las funciones están operativas con validez legal según Ley 19.799",
        duration: 3000,
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-white">
      {isRealMode && (
        <div className="bg-green-50 border-b border-green-100 py-2 px-4">
          <Alert className="bg-transparent border-0 max-w-6xl mx-auto">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 text-sm font-medium">
              Sistema en Modo Operativo Real
            </AlertTitle>
            <AlertDescription className="text-green-700 text-xs">
              Todas las funciones y verificaciones operan con validez legal según Ley 19.799
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <Header />
      <Hero />
      <RonService />
      <Services />
      <HowItWorks />
      <ApkDownload />
      <Pricing />
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
}
