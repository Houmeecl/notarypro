import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight, Download, ShoppingBag, FileText, Users, PiggyBank } from "lucide-react";

export default function VecinosXpressLanding() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Encabezado */}
      <header className="relative overflow-hidden bg-blue-600 text-white">
        {/* Botón de inicio de sesión destacado en la esquina superior derecha */}
        <div className="absolute top-4 right-4 z-20">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
            onClick={() => setLocation("/vecinos/login")}
          >
            Iniciar Sesión
          </Button>
        </div>
        
        <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="z-10 mb-8 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Vecinos Xpress</h1>
              <span className="ml-2 text-sm bg-white text-blue-600 px-2 py-1 rounded-md">by NotaryPro</span>
            </div>
            <p className="text-xl sm:text-2xl mb-6 max-w-xl">
              La forma más fácil de ofrecer servicios de documentos certificados en tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setLocation("/vecinos/registro")}
              >
                ¡Únete como socio! <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-blue-700"
                onClick={() => setLocation("/partners/descargar-apk")}
              >
                Descargar App <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <motion.div 
            className="hidden md:block relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Aquí irá la imagen de Certi */}
            <div className="bg-white p-6 rounded-xl shadow-lg w-72 h-72 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">Imagen de Certi</span>
            </div>
          </motion.div>
          
          {/* Formas decorativas */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
            <motion.div 
              className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20"
              animate={{ x: [0, 10, 0], y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 8 }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10"
              animate={{ x: [0, -10, 0], y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 7 }}
            />
          </div>
        </div>
      </header>

      {/* Beneficios */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="text-blue-600">Beneficios</span> para tu negocio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <ShoppingBag className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Atrae más clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Ofrece un servicio adicional que atraerá nuevos clientes a tu negocio.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Fácil de usar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sin conocimientos técnicos. Te damos todo listo para empezar a generar ingresos.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Soporte completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Te acompañamos en todo el proceso. Capacitación y soporte continuo.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <PiggyBank className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Ganancias adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Comisiones atractivas por cada documento procesado en tu negocio.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Cómo <span className="text-blue-600">funciona</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Regístrate</h3>
              <p>Completa el formulario de registro con los datos de tu negocio.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Descarga la app</h3>
              <p>Instala nuestra aplicación en tu dispositivo o usa la versión web.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-4xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">¡Empieza a ganar!</h3>
              <p>Comienza a procesar documentos y recibe comisiones por cada uno.</p>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/vecinos/registro")}
            >
              Comenzar ahora <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonios */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Lo que dicen nuestros <span className="text-blue-600">socios</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>María González</CardTitle>
                  <CardDescription>Almacén "El Barrio"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>"Desde que empecé con Vecinos Xpress, mi negocio ha visto un aumento en clientes. Es muy fácil de usar y el soporte es excelente."</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Juan Pérez</CardTitle>
                  <CardDescription>Farmacia "Salud Total"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>"Un servicio adicional que no me toma casi tiempo y me genera buenos ingresos extra. ¡Totalmente recomendado para cualquier negocio!"</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Carlos Rodríguez</CardTitle>
                  <CardDescription>Cibercafé "Conectados"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>"La plataforma es súper intuitiva. Mis clientes aprecian poder resolver trámites sin tener que ir al centro de la ciudad."</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Llamado a la acción final */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¡Únete a Vecinos Xpress hoy mismo!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Comienza a ofrecer servicios de documentos certificados en tu negocio y genera ingresos adicionales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation("/vecinos/registro")}
            >
              Registrar mi negocio <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-blue-700"
              onClick={() => setLocation("/partners/descargar-apk")}
            >
              Descargar App <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              className="bg-green-500 text-white hover:bg-green-600 font-bold"
              onClick={() => setLocation("/vecinos/login")}
            >
              Acceder a mi cuenta
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <h3 className="text-xl font-bold">Vecinos Xpress</h3>
                <span className="ml-2 text-xs bg-white text-gray-800 px-1 py-0.5 rounded-sm">by NotaryPro</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">© 2025 NotaryPro. Todos los derechos reservados.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="font-bold mb-2">Enlaces</h4>
                <ul className="text-sm space-y-1">
                  <li><a href="#" className="hover:text-blue-300">Inicio</a></li>
                  <li><a href="#" className="hover:text-blue-300">Beneficios</a></li>
                  <li><a href="#" className="hover:text-blue-300">Cómo funciona</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2">Soporte</h4>
                <ul className="text-sm space-y-1">
                  <li><a href="#" className="hover:text-blue-300">Contacto</a></li>
                  <li><a href="#" className="hover:text-blue-300">Preguntas frecuentes</a></li>
                  <li><a href="#" className="hover:text-blue-300">Términos de servicio</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}