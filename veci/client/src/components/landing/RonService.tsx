import { Button } from "@/components/ui/button";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Shield, CheckCircle2, Video } from "lucide-react";

export default function RonService() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <div className="mb-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                Exclusivo en Chile
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Certificación Online por Video (RON)
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Somos la <span className="font-bold">primera empresa en Chile</span> en ofrecer 
              certificación de documentos 100% online mediante videollamada, 
              respaldada por la Ley 19.799.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Validez legal completa</span>: Documentos certificados con el mismo valor que el proceso presencial.
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Ahorro de tiempo</span>: Sin desplazamientos ni esperas, realice todo el proceso desde su hogar u oficina.
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Máxima seguridad</span>: Verificación de identidad robusta y encriptación avanzada.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="px-6 bg-primary">
                <Link href="/ron-login">
                  Ingresar a la plataforma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="px-6">
                <Link href="/certificacion-por-video">
                  Ver detalles
                </Link>
              </Button>
              <ExplanatoryVideo
                title="Certificación Online por Video (RON) - Pioneros en Chile"
                description="Somos los primeros en Chile en ofrecer la certificación de documentos totalmente online mediante videollamada. En este video explicamos cómo funciona el proceso, su respaldo legal bajo la Ley 19.799 y por qué es tan seguro como el proceso tradicional presencial."
                videoType="explanation"
                triggerLabel="Ver video explicativo"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Ver video explicativo
                </Button>
              </ExplanatoryVideo>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary/90 to-primary rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ExplanatoryVideo
                    title="Somos pioneros en Certificación Online por Video en Chile"
                    description="En este video, explicamos cómo nuestro servicio de certificación por video RON (Remote Online Notarization) está revolucionando el proceso de legalización de documentos en Chile, ahorrando tiempo y ofreciendo la misma validez legal."
                    videoType="explanation"
                    triggerLabel="Reproducir video"
                  >
                    <div className="w-full h-full flex items-center justify-center cursor-pointer">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-primary ml-1"></div>
                      </div>
                    </div>
                  </ExplanatoryVideo>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-semibold text-gray-900">100% Legal en Chile</h3>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      Respaldado por la Ley 19.799 sobre documentos electrónicos y firma electrónica
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-sm text-gray-600 text-center">
                Nuestro sistema RON cumple con todos los estándares de seguridad y validación de identidad 
                exigidos por la legislación chilena.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}