import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-heading mb-4">¿Listo para comenzar a firmar digitalmente?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de profesionales y empresas que ya confían en nosotros para sus firmas electrónicas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth">
              <Button variant="default" className="bg-white text-secondary hover:bg-gray-100 w-full sm:w-auto">
                Registrarse gratis
              </Button>
            </Link>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
              Ver demostración
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
