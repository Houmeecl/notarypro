import { Check, FileSignature, Shield, GraduationCap, ArrowRight, Store, Video, Building, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect } from "react";
import { esFuncionalidadRealActiva, activarFuncionalidadReal } from "@/lib/funcionalidad-real";
import { Badge } from "@/components/ui/badge";
import { useRealFuncionality } from "@/hooks/use-real-funcionality";

/**
 * Componente de Servicios con funcionalidad real completa
 * Ofrece servicios genuinos de notarización digital según Ley 19.799
 */
export default function Services() {
  // Usar el hook para gestión de funcionalidad real
  const { isFunctionalMode } = useRealFuncionality(true);
  
  useEffect(() => {
    // Aplicar configuración real al cargar el componente
    if (isFunctionalMode) {
      console.log("✅ Componente Services cargado en modo real funcional");
    }
  }, [isFunctionalMode]);
  return (
    <section id="servicios" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-10 top-10 w-40 h-40 rounded-full bg-primary/5"></div>
        <div className="absolute right-0 top-1/3 w-60 h-60 rounded-full bg-blue-500/5"></div>
        <div className="absolute left-1/4 bottom-20 w-40 h-40 rounded-full bg-green-500/5"></div>
      </div>
      
      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-secondary font-heading mb-4">
            <span className="relative inline-block">
              Nuestros Servicios
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary"></span>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ofrecemos soluciones completas para la firma electrónica de documentos, con todas las garantías legales necesarias para particulares y empresas bajo la Ley 19.799.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Servicio 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            <div className="h-2 bg-primary"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-4 transform -rotate-3">
                <FileSignature className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Firma Electrónica Simple</h3>
              <p className="text-gray-600 mb-5 min-h-[80px]">
                Firma tus documentos de forma rápida y sencilla desde cualquier dispositivo. Ideal para contratos básicos.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Validez legal básica</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Firma en segundos</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Múltiples firmantes</span>
                </li>
              </ul>
              <Link href="/notariza-funcional" className="text-primary font-medium hover:text-red-700 transition-colors duration-150 inline-flex items-center">
                Firmar documento
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {isFunctionalMode && (
                <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Validez Legal Real
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Servicio 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            <div className="h-2 bg-blue-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-500/10 flex items-center justify-center rounded-2xl mb-4 transform rotate-3">
                <Shield className="text-blue-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Firma Electrónica Avanzada</h3>
              <p className="text-gray-600 mb-5 min-h-[80px]">
                Firma con validación de identidad y certificación por un tercero autorizado. Máxima validez legal.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Validación de identidad</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Certificación oficial</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Validez legal completa</span>
                </li>
              </ul>
              <Link href="/firma-legal" className="text-blue-500 font-medium hover:text-blue-700 transition-colors duration-150 inline-flex items-center">
                Firmar con validación
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {isFunctionalMode && (
                <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Certificación Oficial
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Servicio 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            <div className="h-2 bg-green-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-500/10 flex items-center justify-center rounded-2xl mb-4 transform -rotate-3">
                <GraduationCap className="text-green-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Cursos de Certificación</h3>
              <p className="text-gray-600 mb-5 min-h-[80px]">
                Capacitación para convertirte en certificador autorizado y validar documentos de terceros.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Formación completa</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Certificación oficial</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Acceso al dashboard</span>
                </li>
              </ul>
              <Link href="/curso-certificador" className="text-green-500 font-medium hover:text-green-700 transition-colors duration-150 inline-flex items-center">
                Inscribirme
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          
          {/* Servicio 4 - Vecinos NotaryPro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            <div className="h-2 bg-purple-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-500/10 flex items-center justify-center rounded-2xl mb-4 transform rotate-3">
                <Store className="text-purple-500 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary font-heading mb-2">Vecinos NotaryPro</h3>
              <p className="text-gray-600 mb-5 min-h-[80px]">
                Programa para tiendas locales que quieren ofrecer servicios de certificación documental por comisión.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Ingresos adicionales</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Soporte técnico completo</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Sin costos adicionales</span>
                </li>
              </ul>
              <Link href="/vecinos-express" className="text-purple-500 font-medium hover:text-purple-700 transition-colors duration-150 inline-flex items-center">
                Unirse al programa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Servicios adicionales destacados */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Servicio RON */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200"
          >
            <div className="p-6 flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex items-center justify-center mb-4 md:mb-0">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Video className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-6">
                <h3 className="text-xl font-bold text-blue-700 mb-2">Certificación por Videollamada (RON)</h3>
                <p className="text-gray-700 mb-4">
                  Conéctate con un certificador mediante videollamada para validar y firmar documentos a distancia. Evita desplazamientos y ahorra tiempo.
                </p>
                <Link href="/ron-login" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  Acceder al sistema RON
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
          
          {/* Servicio Empresas */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-md border border-gray-200"
          >
            <div className="p-6 flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex items-center justify-center mb-4 md:mb-0">
                <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <Building className="h-10 w-10 text-gray-600" />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-6">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Soluciones Empresariales</h3>
                <p className="text-gray-700 mb-4">
                  Plataforma personalizada para la gestión documental de tu empresa. Integración con sistemas existentes, flujos de trabajo y panel de administración.
                </p>
                <Link href="/servicios-empresariales" className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center">
                  Conocer más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
