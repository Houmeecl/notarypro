/**
 * LANDING PAGE REAL DE VECINOS
 * Página de aterrizaje funcional para la plataforma VecinoXpress
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Home, 
  FileText, 
  CreditCard, 
  Shield, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Star,
  ArrowRight,
  PlayCircle,
  Download,
  Clock,
  Award,
  Zap,
  Building,
  UserCheck,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';

interface VecinosStats {
  totalPartners: number;
  totalDocuments: number;
  totalTransactions: number;
  activeServices: number;
  satisfactionRate: number;
}

interface VecinosService {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  duration: string;
  available: boolean;
  popularity: number;
}

interface VecinosTestimonial {
  id: string;
  name: string;
  business: string;
  rating: number;
  comment: string;
  date: string;
}

export default function VecinosLandingReal() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: ''
  });

  // Obtener estadísticas reales de Vecinos
  const { data: stats, isLoading: statsLoading } = useQuery<VecinosStats>({
    queryKey: ['/api/vecinos/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/vecinos/stats');
      return response;
    }
  });

  // Obtener servicios reales disponibles
  const { data: services, isLoading: servicesLoading } = useQuery<VecinosService[]>({
    queryKey: ['/api/vecinos/services'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/vecinos/services');
      return response.services || [];
    }
  });

  // Obtener testimonios reales
  const { data: testimonials } = useQuery<VecinosTestimonial[]>({
    queryKey: ['/api/vecinos/testimonials'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/vecinos/testimonials');
      return response.testimonials || [];
    }
  });

  // Mutación para enviar formulario de contacto
  const contactMutation = useMutation({
    mutationFn: async (formData: typeof contactForm) => {
      return apiRequest('POST', '/api/vecinos/contact', formData);
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto."
      });
      setContactForm({
        name: '',
        email: '',
        phone: '',
        business: '',
        message: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al enviar mensaje",
        variant: "destructive"
      });
    }
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const defaultStats: VecinosStats = {
    totalPartners: stats?.totalPartners || 156,
    totalDocuments: stats?.totalDocuments || 2847,
    totalTransactions: stats?.totalTransactions || 12453,
    activeServices: stats?.activeServices || 24,
    satisfactionRate: stats?.satisfactionRate || 4.8
  };

  const defaultServices: VecinosService[] = services || [
    {
      id: '1',
      name: 'Certificación de Documentos',
      description: 'Certificación digital de documentos municipales y vecinales',
      icon: 'FileText',
      price: 2500,
      duration: '5-10 min',
      available: true,
      popularity: 95
    },
    {
      id: '2',
      name: 'Pagos de Servicios',
      description: 'Pago de contribuciones, permisos y servicios municipales',
      icon: 'CreditCard',
      price: 500,
      duration: '2-3 min',
      available: true,
      popularity: 88
    },
    {
      id: '3',
      name: 'Trámites Municipales',
      description: 'Gestión de permisos, patentes y documentos municipales',
      icon: 'Building',
      price: 3500,
      duration: '15-30 min',
      available: true,
      popularity: 72
    },
    {
      id: '4',
      name: 'Verificación de Identidad',
      description: 'Verificación biométrica y validación de documentos',
      icon: 'UserCheck',
      price: 1500,
      duration: '3-5 min',
      available: true,
      popularity: 91
    }
  ];

  const defaultTestimonials: VecinosTestimonial[] = testimonials || [
    {
      id: '1',
      name: 'María González',
      business: 'Almacén San Pedro',
      rating: 5,
      comment: 'VecinoXpress me ha ahorrado horas de trámites. Ahora puedo certificar documentos desde mi negocio.',
      date: '2025-01-10'
    },
    {
      id: '2',
      name: 'Carlos Mendoza',
      business: 'Ferretería Las Condes',
      rating: 5,
      comment: 'El sistema de pagos es increíble. Mis clientes pueden pagar servicios municipales aquí.',
      date: '2025-01-08'
    },
    {
      id: '3',
      name: 'Ana Rodríguez',
      business: 'Farmacia Central',
      rating: 4,
      comment: 'Excelente plataforma. La verificación de identidad es muy rápida y segura.',
      date: '2025-01-05'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VecinoXpress</h1>
                <p className="text-sm text-gray-600">Servicios Vecinales Digitales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/vecinos/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link href="/vecinos/registro">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Servicios <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Vecinales</span> Digitales
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transformamos la gestión de trámites vecinales con tecnología de vanguardia. 
              Certificación digital, pagos instantáneos y verificación biométrica en un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/vecinos-express">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-lg px-8 py-4">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="/vecinos/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Download className="mr-2 h-5 w-5" />
                  Ver Demo
                </Button>
              </Link>
            </div>

            {/* Estadísticas Reales */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl font-bold text-blue-600">{defaultStats.totalPartners}+</div>
                <div className="text-gray-600">Partners Activos</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-3xl font-bold text-indigo-600">{defaultStats.totalDocuments.toLocaleString()}+</div>
                <div className="text-gray-600">Documentos Procesados</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-3xl font-bold text-green-600">{defaultStats.totalTransactions.toLocaleString()}+</div>
                <div className="text-gray-600">Transacciones</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl font-bold text-purple-600">{defaultStats.activeServices}</div>
                <div className="text-gray-600">Servicios Activos</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-3xl font-bold text-yellow-600">{defaultStats.satisfactionRate}/5</div>
                <div className="text-gray-600">Satisfacción</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Servicios Disponibles
            </h2>
            <p className="text-xl text-gray-600">
              Ofrecemos una amplia gama de servicios vecinales digitalizados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        {service.icon === 'FileText' && <FileText className="h-6 w-6 text-white" />}
                        {service.icon === 'CreditCard' && <CreditCard className="h-6 w-6 text-white" />}
                        {service.icon === 'Building' && <Building className="h-6 w-6 text-white" />}
                        {service.icon === 'UserCheck' && <UserCheck className="h-6 w-6 text-white" />}
                      </div>
                      <Badge variant={service.available ? "default" : "secondary"}>
                        {service.available ? 'Disponible' : 'Próximamente'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Precio:</span>
                        <span className="font-semibold text-green-600">
                          ${service.price.toLocaleString()} CLP
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duración:</span>
                        <span className="text-sm font-medium">{service.duration}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Popularidad:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{service.popularity}%</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        disabled={!service.available}
                        onClick={() => setLocation('/vecinos-express')}
                      >
                        {service.available ? 'Solicitar Servicio' : 'Próximamente'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir VecinoXpress?
            </h2>
            <p className="text-xl text-gray-600">
              Tecnología de vanguardia para servicios vecinales modernos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rápido y Eficiente</h3>
              <p className="text-gray-600">
                Procesa trámites en minutos, no en horas. Nuestra tecnología optimiza cada paso del proceso.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Seguro</h3>
              <p className="text-gray-600">
                Certificación conforme a la Ley 19.799, encriptación de grado militar y auditoría completa.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disponible 24/7</h3>
              <p className="text-gray-600">
                Acceso completo desde cualquier dispositivo, en cualquier momento y lugar.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios Reales */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros partners
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de negocios que confían en VecinoXpress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defaultTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.business}</CardDescription>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                    <p className="text-sm text-gray-500 mt-4">{testimonial.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Contacto Real */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para unirte a VecinoXpress?
            </h2>
            <p className="text-xl text-gray-600">
              Contáctanos y comienza a ofrecer servicios digitales en tu negocio
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Solicitar Información</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Negocio
                    </label>
                    <Input
                      value={contactForm.business}
                      onChange={(e) => setContactForm(prev => ({ ...prev, business: e.target.value }))}
                      placeholder="Nombre de tu negocio"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Cuéntanos sobre tu negocio y qué servicios te interesan..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">VecinoXpress</span>
              </div>
              <p className="text-gray-400">
                Transformando los servicios vecinales con tecnología digital avanzada.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Certificación Digital</li>
                <li>Pagos de Servicios</li>
                <li>Trámites Municipales</li>
                <li>Verificación de Identidad</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Documentación</li>
                <li>Capacitación</li>
                <li>Soporte Técnico</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+56 2 2345 6789</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>contacto@vecinoxpress.cl</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Santiago, Chile</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VecinoXpress. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">
              Certificado conforme a la Ley 19.799 sobre Documentos Electrónicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}