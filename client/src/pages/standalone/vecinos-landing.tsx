import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileSignature, 
  ShieldCheck, 
  Smartphone, 
  Lock,
  Users, 
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Store,
  Receipt,
  Clipboard,
  BarChart2,
  DollarSign,
  Percent
} from 'lucide-react';

// Logo de Vecinos Express
import vecinoLogo from "@/assets/new/vecino-xpress-logo-nuevo.png";
// Importar imagen de minimarket con monos redondos
import minimarketImage from "@/assets/new/minimarket-monos.png";

/**
 * Landing Page para la versión standalone de VecinosExpress
 * 
 * Esta página sirve como punto de entrada para la aplicación standalone,
 * mostrando las características principales y un enlace al login.
 */
export default function VecinosLandingStandalone() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-28 w-auto" />
              <span className="font-bold text-2xl text-[#2d219b] hidden">VecinoExpress</span>
            </div>
            <span className="text-sm text-gray-600 ml-1 mt-1 italic">Transformando negocios locales con certificación digital</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/vecinos-standalone-login">
              <Button>
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2d219b] to-[#4338ca] text-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-300 filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400 filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Tu Minimarket, Más Digital</h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Revoluciona tu negocio de barrio con nuestra plataforma integral de gestión para almacenes y minimarkets. Documentación, ventas e inventario en un solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/vecinos-standalone-login">
                  <Button size="lg" className="bg-white text-[#2d219b] hover:bg-white/90 shadow-lg">
                    Digitaliza Tu Negocio
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                  Ver Beneficios
                </Button>
              </div>
              <div className="mt-6 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <div className="flex items-center text-white">
                  <Percent className="h-5 w-5 mr-2" />
                  <p className="text-sm font-medium">Promoción Especial: 30 días gratis para negocios de barrio</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-white/10 rounded-lg p-6 border border-white/20 backdrop-blur-sm shadow-xl">
                  <div className="aspect-video rounded flex items-center justify-center mb-4 overflow-hidden bg-white">
                    <img 
                      src={minimarketImage} 
                      alt="Minimarket con personal atendiendo" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                      <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                      <div className="h-4 w-full bg-white/20 rounded"></div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                      <div className="h-4 w-5/6 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-purple-500/30 rounded mt-6 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-white mr-2" />
                      <span className="text-white font-medium">Tu Negocio Digital</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-5 h-24 w-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center drop-shadow-lg transform hover:rotate-3 transition-transform">
                  <div className="text-white font-bold text-xs text-center">
                    <div className="text-xl">100%</div>
                    <div>DIGITAL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-50 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50 rounded-tr-full opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu Minimarket, Totalmente Digital</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              VecinoExpress transforma tu almacén o tienda de barrio con herramientas digitales pensadas para el pequeño comerciante
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="rounded-full w-14 h-14 flex items-center justify-center bg-purple-100 text-[#2d219b] mb-4 shadow-sm">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#2d219b]">Gestión de tu Negocio</h3>
                <p className="text-gray-600">
                  Maneja la documentación de tu almacén, minimarket o tienda de barrio con validez legal desde cualquier dispositivo.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="rounded-full w-14 h-14 flex items-center justify-center bg-purple-100 text-[#2d219b] mb-4 shadow-sm">
                  <Receipt className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#2d219b]">Facturación Digital</h3>
                <p className="text-gray-600">
                  Genera boletas, facturas y documentos tributarios digitales con validez legal para tu negocio local.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="rounded-full w-14 h-14 flex items-center justify-center bg-purple-100 text-[#2d219b] mb-4 shadow-sm">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#2d219b]">Control de Inventario</h3>
                <p className="text-gray-600">
                  Seguimiento de productos, gestión de stock y alertas de reposición en tiempo real para tu almacén o minimarket.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-t from-purple-50 to-transparent opacity-70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold text-[#2d219b] mb-6">Beneficios del sistema</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#2d219b]">
                    <ShoppingBag className="h-6 w-6 text-[#2d219b] mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2d219b]">Gestión de inventario</h3>
                      <p className="text-gray-600">Maneja tu stock con alertas automáticas y reportes en tiempo real</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#2d219b]">
                    <Receipt className="h-6 w-6 text-[#2d219b] mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2d219b]">Boletas digitales</h3>
                      <p className="text-gray-600">Emite comprobantes digitales con validez tributaria desde tu punto de venta</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#2d219b]">
                    <DollarSign className="h-6 w-6 text-[#2d219b] mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2d219b]">Control de ventas</h3>
                      <p className="text-gray-600">Registra todas tus ventas con métodos de pago flexibles y cuadre de caja</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#2d219b]">
                    <BarChart2 className="h-6 w-6 text-[#2d219b] mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2d219b]">Reportes de negocio</h3>
                      <p className="text-gray-600">Análisis de ventas, productos más vendidos y rentabilidad de tu tienda</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/vecinos-standalone-login">
                    <Button size="lg" className="bg-[#2d219b] hover:bg-[#231a78] shadow-md">
                      Acceder ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 text-[#2d219b] mb-3">
                    <Store className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-[#2d219b]">Gestión de tienda</h3>
                  <p className="text-gray-600 text-sm">Control completo de tu almacén o minimarket</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 text-[#2d219b] mb-3">
                    <Clipboard className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-[#2d219b]">Documentación legal</h3>
                  <p className="text-gray-600 text-sm">Facturas, boletas y contratos con validez legal</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 col-span-2 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 text-[#2d219b]">
                      <div className="h-2 w-2 rounded-full bg-[#2d219b]"></div>
                    </div>
                    <div className="text-[#2d219b] font-medium">Sistema en línea 24/7</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2d219b] rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tiempo de actividad</span>
                      <span>99.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2d219b] to-[#4338ca] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-purple-300 filter blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-indigo-400 filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">¿Listo para transformar tu negocio?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a los cientos de negocios locales que ya están potenciando su crecimiento con VecinoExpress
          </p>
          <div className="inline-block relative">
            <div className="absolute -top-10 -left-10 w-8 h-8 bg-purple-300 rounded-full opacity-50"></div>
            <div className="absolute -bottom-6 -right-6 w-10 h-10 bg-indigo-300 rounded-full opacity-50"></div>
            <Link href="/vecinos-standalone-login">
              <Button size="lg" className="bg-white text-[#2d219b] hover:bg-white/90 shadow-lg px-8 py-6 text-lg">
                Iniciar sesión
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="mb-4">
                <img src={vecinoLogo} alt="VecinoXpress Logo" className="h-24 w-auto" />
              </div>
              <p className="text-gray-400 max-w-md">
                Plataforma integral para la gestión de tiendas, minimarkets y almacenes con documentación digital certificada según la normativa chilena.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Soluciones</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Punto de Venta POS</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Control de Inventario</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Facturación Electrónica</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Reportes de Ventas</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Recursos</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Documentación</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Centro de Ayuda</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Tutoriales</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Términos de Servicio</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidad</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cumplimiento Legal</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Certificaciones</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© 2025 VecinoExpress. Todos los derechos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}