import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 bg-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary font-heading mb-4">Cómo Funciona</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestro proceso de firma electrónica es rápido, seguro y completamente digital. Solo necesitas seguir estos simples pasos:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow p-6 relative">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold absolute -top-3 -left-3">1</div>
            <img
              src="https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              alt="Subir documento"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-secondary font-heading mb-2">Sube tu documento</h3>
            <p className="text-gray-600">
              Sube el documento que necesitas firmar en formato PDF o Word. Puedes añadir múltiples documentos si es necesario.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow p-6 relative">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold absolute -top-3 -left-3">2</div>
            <img
              src="https://images.unsplash.com/photo-1575908539614-ff89490f4a78?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              alt="Verifica identidad"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-secondary font-heading mb-2">Verifica tu identidad</h3>
            <p className="text-gray-600">
              Completa el proceso de verificación de identidad con tu documento de identidad y una selfie para firma avanzada.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow p-6 relative">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold absolute -top-3 -left-3">3</div>
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              alt="Firma documento"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-secondary font-heading mb-2">Firma y recibe</h3>
            <p className="text-gray-600">
              Firma el documento y recíbelo por correo electrónico con la certificación correspondiente y evidencias de validez legal.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/auth">
            <Button className="bg-primary hover:bg-red-700 text-white">
              Comenzar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
