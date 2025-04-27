import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Video } from "lucide-react";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import logoImg from "@/assets/logo12582620.png";

export default function Hero() {
  return (
    <section className="relative bg-light pt-16 pb-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo principal - Sin texto adicional */}
        <div className="flex justify-center items-center mb-16">
          <img 
            src={logoImg} 
            alt="NotaryPro Logo" 
            className="h-20 w-auto" 
          />
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight font-heading mb-6">
              Firma documentos digitalmente{" "}
              <span className="text-primary">de manera segura y legal</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Plataforma completa para firma electrónica avanzada y simple de documentos con validez legal. 
              Rápido, seguro y desde cualquier dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/service-selection">
                <Button className="w-full sm:w-auto bg-primary hover:bg-red-700 text-white">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="w-full sm:w-auto">
                  Iniciar sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Cómo funciona
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2 mr-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"
                  alt="Usuario"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"
                  alt="Usuario"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"
                  alt="Usuario"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                />
              </div>
              <p className="text-sm text-gray-500">
                Más de <span className="font-medium text-secondary">10,000+ personas</span> confían en nosotros
              </p>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative h-auto w-full rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21ed6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Firma digital de documentos"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              <ExplanatoryVideo
                title="¿Cómo funciona nuestra plataforma?"
                description="Descubra cómo nuestra plataforma le permite firmar documentos con validez legal en simples pasos. Aprenda sobre la verificación de identidad, firmas electrónicas y más."
                videoType="explanation"
                triggerLabel="Ver demostración"
              >
                <button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-5 shadow-lg focus:outline-none"
                  aria-label="Reproducir video"
                >
                  <Play className="h-6 w-6" />
                </button>
              </ExplanatoryVideo>
            </div>
          </div>
        </div>

        {/* Stats */}
        {/* Videos explicativos destacados */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6 text-center">
            Descubre cómo funciona NotaryPro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Video explicativo general */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21ed6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Explicación general" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    videoType="explanation"
                    triggerLabel="Ver explicación"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">Cómo funciona NotaryPro</h3>
                <p className="text-gray-600 text-sm">Descubre cómo nuestra plataforma te permite firmar documentos con validez legal siguiendo la Ley 19.799.</p>
              </div>
            </div>
            
            {/* Tutorial paso a paso */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Tutorial" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    videoType="tutorial"
                    triggerLabel="Ver tutorial"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">Tutorial: Firma de documentos</h3>
                <p className="text-gray-600 text-sm">Guía paso a paso para firmar documentos en nuestra plataforma. Aprende a subir documentos y posicionar tu firma.</p>
              </div>
            </div>
            
            {/* Proceso de verificación */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Verificación" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    videoType="verification"
                    triggerLabel="Ver proceso"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">Proceso de verificación de identidad</h3>
                <p className="text-gray-600 text-sm">Conoce cómo funciona nuestro proceso de verificación para garantizar la validez legal de tus documentos.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-secondary font-heading">+250k</p>
            <p className="text-gray-600">Documentos firmados</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-secondary font-heading">+25k</p>
            <p className="text-gray-600">Usuarios activos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-secondary font-heading">100%</p>
            <p className="text-gray-600">Validez legal</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-secondary font-heading">4.9/5</p>
            <p className="text-gray-600">Valoración clientes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
