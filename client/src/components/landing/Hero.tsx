import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Check, Clock, Building } from "lucide-react";
import { ExplanatoryVideo } from "@/components/ui/explanatory-video";
import logoImg from "@/assets/logo12582620.png";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-16 pb-32 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo principal con animación sutil */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center mb-16"
        >
          <img 
            src={logoImg} 
            alt="NotaryPro Logo" 
            className="h-24 w-auto drop-shadow-md" 
          />
        </motion.div>
        
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:w-1/2 md:pr-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-secondary leading-tight font-heading mb-6">
              <span className="relative">
                Transforme
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 rounded-full -z-10"></span>
              </span>{" "}
              su forma de firmar documentos
              <span className="text-primary block mt-2">con validez legal en Chile</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              La plataforma más completa para firma electrónica <strong>avalada por la Ley 19.799</strong>. 
              Firma y certifica documentos desde cualquier lugar, en cualquier momento, con total seguridad.
            </p>
            
            {/* Benefits icons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">100% validez legal</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Proceso en minutos</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <Check className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-sm font-medium">Firma simple y avanzada</p>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Ideal para empresas</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/service-selection">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-red-700 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-gray-50 transition-all">
                  Iniciar sesión
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="link" size="lg" className="w-full sm:w-auto text-secondary hover:text-primary transition-all">
                  Cómo funciona
                  <FileText className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
            
            <div className="mt-10 flex items-center p-4 bg-white rounded-lg shadow-md">
              <div className="flex -space-x-4 mr-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white font-bold">SC</div>
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white font-bold">MR</div>
                <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center border-2 border-white font-bold">JP</div>
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-white font-bold">+</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Más de <span className="font-bold text-secondary">10,000+ profesionales</span> ya confían en nosotros
                </p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-gray-500">4.9/5</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="md:w-1/2 mt-10 md:mt-0"
          >
            <div className="relative h-auto w-full rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                alt="Profesional firmando documento digitalmente"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Etiqueta de Validez Legal */}
              <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                <p className="text-sm font-bold text-primary flex items-center">
                  <Shield className="h-4 w-4 mr-1" /> Ley 19.799
                </p>
              </div>
              
              {/* Tarjetas superpuestas */}
              <div className="absolute -bottom-2 right-0 left-0 flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-t-xl p-4 shadow-lg max-w-xs">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-secondary font-bold text-lg">Plataforma Certificada</h3>
                    <p className="text-gray-600 text-sm">En cumplimiento con la ley chilena 19.799 de documento electrónico</p>
                  </div>
                </div>
              </div>
              
              {/* Características en mini-tarjetas */}
              <div className="absolute top-1/3 -right-3 transform rotate-3">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">
                  Firma 100% Legal
                </div>
              </div>
              
              <div className="absolute top-2/3 -left-3 transform -rotate-2">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">
                  Rápido y Seguro
                </div>
              </div>
            </div>
          </motion.div>
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
                  src="https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?q=80&w=2101&auto=format&fit=crop"
                  alt="Persona realizando firma digital" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    title="Cómo funciona NotaryPro"
                    description="Conoce todos los pasos para utilizar NotaryPro: desde la creación de tu cuenta hasta la firma y verificación de documentos."
                    videoType="explanation"
                    triggerLabel="Ver guión"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <FileText className="h-8 w-8" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">Cómo funciona NotaryPro</h3>
                <p className="text-gray-600 text-sm">Conoce todos los pasos para utilizar la plataforma, desde el registro hasta la firma y verificación de documentos.</p>
              </div>
            </div>
            
            {/* Tutorial paso a paso */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                  alt="Ejecutivos en reunión de negocios" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    title="NotaryPro para Empresas"
                    description="Dos ejecutivos discuten cómo implementar NotaryPro en su empresa y los beneficios para el negocio."
                    videoType="tutorial"
                    triggerLabel="Ver guión"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <FileText className="h-8 w-8" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">NotaryPro para Empresas</h3>
                <p className="text-gray-600 text-sm">Aprende cómo implementar NotaryPro en tu empresa. Dos oficinistas discuten los beneficios y el proceso de adopción.</p>
              </div>
            </div>
            
            {/* Proceso de verificación */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=2070&auto=format&fit=crop"
                  alt="Pequeño comercio de barrio" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <ExplanatoryVideo
                    title="Programa Vecinos NotaryPro Express"
                    description="Conoce cómo funciona nuestro programa Vecinos NotaryPro Express que permite a tiendas locales, minimarkets y almacenes de barrio convertirse en puntos de certificación."
                    videoType="verification"
                    triggerLabel="Ver guión"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-primary cursor-pointer transition-all">
                      <FileText className="h-8 w-8" />
                    </div>
                  </ExplanatoryVideo>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-secondary mb-2">Vecinos NotaryPro Express</h3>
                <p className="text-gray-600 text-sm">Descubre cómo los locales comerciales de tu barrio pueden ofrecer servicios de certificación como puntos Vecinos Express.</p>
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
