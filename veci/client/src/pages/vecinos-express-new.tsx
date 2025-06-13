import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Building, 
  CreditCard, 
  ChevronDown, 
  ChevronRight,
  Check,
  Clock,
  Award,
  DollarSign,
  Store,
  ArrowRight,
  FileText,
  Stamp,
  BookOpen,
  FilePen,
  FileCheck,
  ArrowUpRight,
  Zap,
  MonitorSmartphone,
  BarChart3,
  Shield,
  Heart,
  Users,
  Calendar,
  Phone as PhoneIcon,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VecinosIllustrations from "@/components/vecinos/VecinosIllustrations";
import { useToast } from "@/hooks/use-toast";

// Importamos el logo
import vecinosXpressLogo from "@/assets/vecino-xpress-logo.svg";

export default function VecinosExpress() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("comercios");
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Estados para el formulario
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    rut: "",
    bankAccount: "",
    bankName: "",
  });

  // Controlar la barra de navegación al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const nextStep = () => {
    setFormStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setFormStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mostrar loading toast
      toast({
        title: "Enviando solicitud",
        description: "Procesando su solicitud, por favor espere...",
        variant: "default"
      });
      
      // Aquí enviaríamos los datos del formulario a la API
      // Por ahora simulamos un delay para mostrar el proceso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar confirmación
      toast({
        title: "¡Solicitud enviada con éxito!",
        description: "Hemos recibido su solicitud. Una supervisora revisará sus datos y se pondrá en contacto con usted en breve.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        businessName: "",
        businessType: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        rut: "",
        bankAccount: "",
        bankName: "",
      });
      
      // Mostrar página de confirmación
      setFormStep(4);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast({
        title: "Error al enviar solicitud",
        description: "Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Componente para cada paso del formulario
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-900">Información del Negocio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Nombre del Negocio</label>
                <Input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Ej: Minimarket Don Pedro"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Tipo de Negocio</label>
                <Input
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  placeholder="Ej: Minimarket, Librería, etc."
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Nombre del Propietario</label>
                <Input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">RUT</label>
                <Input
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  placeholder="12.345.678-9"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <Button 
              onClick={nextStep} 
              className="mt-4 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              Continuar <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-900">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Correo Electrónico</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.cl"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Teléfono</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56 9 1234 5678"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Dirección</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Ciudad</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="border-indigo-300 text-indigo-700"
              >
                Volver
              </Button>
              <Button 
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Continuar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-900">Datos Bancarios</h3>
            <p className="text-indigo-700 text-sm mb-4">
              Esta información será utilizada para transferir sus comisiones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Banco</label>
                <Input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Nombre del banco"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-indigo-900">Número de Cuenta</label>
                <Input
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="Número de cuenta bancaria"
                  className="border-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
              <p className="text-sm text-indigo-700">
                <strong>Nota importante:</strong> Al enviar este formulario, usted acepta nuestros términos y condiciones para el programa VecinoXpress. Un representante se pondrá en contacto con usted para concretar los detalles de su incorporación.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="border-indigo-300 text-indigo-700"
              >
                Volver
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Enviar Solicitud
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-indigo-900">¡Solicitud enviada con éxito!</h2>
            <div className="max-w-lg mx-auto mb-8">
              <p className="text-indigo-800 mb-4 text-lg">
                Gracias por su interés en unirse al programa VecinoXpress. Hemos recibido su solicitud y será revisada por nuestro equipo de supervisión.
              </p>
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-6">
                <h3 className="font-semibold text-xl mb-4 text-indigo-900">Próximos pasos:</h3>
                <ul className="text-left space-y-4">
                  <li className="flex items-start">
                    <span className="inline-block bg-indigo-100 rounded-full p-1.5 mr-3 mt-0.5">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </span>
                    <span className="text-indigo-800">Una supervisora revisará su solicitud en un plazo de 48 horas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-indigo-100 rounded-full p-1.5 mr-3 mt-0.5">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </span>
                    <span className="text-indigo-800">Recibirá un correo de confirmación con sus credenciales de acceso al sistema.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-indigo-100 rounded-full p-1.5 mr-3 mt-0.5">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </span>
                    <span className="text-indigo-800">La supervisora coordinará la entrega y configuración del equipamiento en su negocio.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-indigo-100 rounded-full p-1.5 mr-3 mt-0.5">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </span>
                    <span className="text-indigo-800">Recibirá capacitación sobre el uso del sistema.</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Volver a la página principal
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={vecinosXpressLogo} alt="VecinoXpress Logo" className="h-10" />
              <div className={`ml-10 hidden lg:flex space-x-8 ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>
                <a href="#beneficios" className="font-medium hover:text-indigo-400 transition">Beneficios</a>
                <a href="#como-funciona" className="font-medium hover:text-indigo-400 transition">Cómo Funciona</a>
                <a href="#testimonios" className="font-medium hover:text-indigo-400 transition">Testimonios</a>
                <a href="#registro" className="font-medium hover:text-indigo-400 transition">Registro</a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                className={`hidden md:flex ${isScrolled ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'border-white text-white hover:bg-white/20'}`}
                onClick={() => setLocation('/vecinos/login')}
              >
                <User className="mr-2 h-4 w-4" />
                Acceso Socios
              </Button>
              <Button 
                className={`${isScrolled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}
                onClick={() => {
                  const element = document.getElementById('registro');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Registrar Negocio
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Modern Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2d219b] to-indigo-950 text-white">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"></div>
          
          {/* Document Patterns */}
          <svg width="100" height="100" viewBox="0 0 100 100" className="absolute top-20 right-1/4 opacity-20">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="30" x2="70" y2="30" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="70" x2="70" y2="70" stroke="white" strokeWidth="2"/>
          </svg>
          
          <svg width="60" height="60" viewBox="0 0 100 100" className="absolute bottom-20 right-1/5 opacity-20">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="30" x2="70" y2="30" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2"/>
            <line x1="30" y1="70" x2="70" y2="70" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-6 py-20 z-10 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 lg:pr-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-800/30 text-blue-100 text-sm font-medium mb-6">
                <span className="animate-pulse mr-2 h-3 w-3 rounded-full bg-blue-400"></span>
                Servicio innovador para negocios locales
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Transforma tu negocio en un 
                <span className="relative inline-block px-2 mx-1">
                  <span className="absolute inset-0 transform -skew-x-12 bg-indigo-500/20 rounded"></span>
                  <span className="relative">centro digital</span>
                </span> 
                de servicios legales
              </h1>
              
              <p className="text-xl text-indigo-100 mb-8 lg:max-w-xl">
                Aumenta tus ingresos ofreciendo servicios de certificación de documentos y trámites legales mientras atraes más clientes a tu establecimiento.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  className="bg-white hover:bg-indigo-50 text-indigo-900 border-0 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => {
                    const element = document.getElementById('registro');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Registra tu negocio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 py-3 px-8 rounded-lg font-medium transition-all duration-300"
                  onClick={() => {
                    const element = document.getElementById('como-funciona');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Descubre cómo funciona
                </Button>
              </div>
              
              <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl p-4">
                <div className="text-blue-100 font-medium mb-3">Accesos directos:</div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="default"
                    className="bg-indigo-700 hover:bg-indigo-600 transition-all duration-300"
                    onClick={() => setLocation('/vecinos/login')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Portal de Socios
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-indigo-400 text-indigo-100 hover:bg-indigo-700/40"
                    onClick={() => setLocation('/vecinos/pos-app')}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Acceso POS
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-green-400 text-green-100 hover:bg-green-900/30"
                    onClick={() => {
                      const demoCode = 'LOCAL-XP125';
                      localStorage.setItem('store_code', demoCode);
                      setLocation('/partners/webapp-pos-official');
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Probar Demo
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-900/40 rounded-2xl transform rotate-3 scale-105"></div>
              
              <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="absolute -top-6 -right-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 shadow-lg">
                    <Stamp className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <VecinosIllustrations.StoreServing className="w-full h-auto" />
                
                <div className="mt-6 flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-300">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sistema fácil de usar</h3>
                    <p className="text-indigo-200">Interfaz intuitiva que no requiere experiencia técnica previa</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-300">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Comisiones atractivas</h3>
                    <p className="text-indigo-200">Recibe un porcentaje por cada documento procesado en tu local</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-3 -left-3 p-3 bg-white rounded-lg shadow-lg transform -rotate-6">
                <div className="flex items-center">
                  <div className="rounded-full overflow-hidden w-12 h-12 bg-indigo-100 flex items-center justify-center">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <div className="h-2.5 bg-gray-200 rounded-full w-24 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating stats badges */}
          <div className="flex flex-wrap justify-center mt-12 gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg border border-white/20">
              <div className="mr-3 bg-indigo-500/20 p-2 rounded-full">
                <Users className="h-4 w-4 text-indigo-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-200">+500 negocios asociados</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg border border-white/20">
              <div className="mr-3 bg-indigo-500/20 p-2 rounded-full">
                <FileCheck className="h-4 w-4 text-indigo-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-200">+10,000 documentos certificados</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg border border-white/20">
              <div className="mr-3 bg-indigo-500/20 p-2 rounded-full">
                <Shield className="h-4 w-4 text-indigo-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-200">100% seguridad legal</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave shape divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#fff" fill-opacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,224C672,235,768,245,864,240C960,235,1056,213,1152,202.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Beneficios Section */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
              Beneficios de unirse a <span className="text-indigo-600">VecinoXpress</span>
            </h2>
            <p className="text-lg text-indigo-700 max-w-3xl mx-auto">
              Ofrecemos una oportunidad única para que los negocios locales diversifiquen sus servicios y aumenten sus ingresos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Ingresos adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Recibe comisiones por cada documento procesado en tu establecimiento. Un flujo constante de ingresos extras sin inversión inicial.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Mayor afluencia de clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Atrae nuevos clientes que visitan tu negocio para realizar trámites y potencialmente realizan compras adicionales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <MonitorSmartphone className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Equipamiento sin costo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Te proporcionamos toda la tecnología necesaria sin costo alguno. Instalamos y configuramos todo el sistema.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Sistema fácil de usar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Interfaz intuitiva diseñada para ser operada sin conocimientos técnicos. Capacitación completa incluida.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Horario flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Ofrece los servicios en el horario que más te convenga. Tú decides cuándo estar disponible para estos trámites.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="p-3 w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-900">Analíticas detalladas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700">
                  Accede a informes y estadísticas sobre tus transacciones, comisiones y actividad mensual en tiempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
              ¿Cómo funciona <span className="text-indigo-600">VecinoXpress</span>?
            </h2>
            <p className="text-lg text-indigo-700 max-w-3xl mx-auto">
              Nuestro proceso es simple y está diseñado para integrarse perfectamente con tu negocio existente.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-3 mb-12">
            <Button 
              variant={activeTab === "comercios" ? "default" : "outline"}
              className={activeTab === "comercios" ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-300 text-indigo-700"}
              onClick={() => setActiveTab("comercios")}
            >
              Para comercios
            </Button>
            <Button 
              variant={activeTab === "clientes" ? "default" : "outline"}
              className={activeTab === "clientes" ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-300 text-indigo-700"}
              onClick={() => setActiveTab("clientes")}
            >
              Para clientes
            </Button>
          </div>

          {activeTab === "comercios" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Regístrate como socio</h3>
                <p className="text-indigo-700 mb-4">
                  Completa el formulario de registro con tus datos y los de tu negocio. Un representante revisará tu solicitud.
                </p>
                <Button 
                  variant="link" 
                  className="text-indigo-600 p-0"
                  onClick={() => {
                    const element = document.getElementById('registro');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Comenzar registro <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Instalación y capacitación</h3>
                <p className="text-indigo-700 mb-4">
                  Recibirás el equipo necesario e instalaremos el sistema en tu negocio. Nuestro equipo te capacitará en su uso.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Comienza a ganar</h3>
                <p className="text-indigo-700 mb-4">
                  Empieza a ofrecer servicios de certificación de documentos y recibe comisiones por cada transacción realizada.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Encuentra un local</h3>
                <p className="text-indigo-700 mb-4">
                  Localiza un comercio VecinoXpress cercano a través de nuestra aplicación o sitio web.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Lleva tu documento</h3>
                <p className="text-indigo-700 mb-4">
                  Visita el comercio con tu documento e identificación personal. No necesitas cita previa.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Verifica tu identidad</h3>
                <p className="text-indigo-700 mb-4">
                  El operador verificará tu identidad utilizando nuestro sistema de validación seguro.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-900 mt-2">Recibe tu documento</h3>
                <p className="text-indigo-700 mb-4">
                  Obtén tu documento certificado legalmente de forma inmediata o digital según el tipo de trámite.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-14 bg-white shadow-xl rounded-xl overflow-hidden border border-indigo-100">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Play className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-bold text-indigo-900">Descubre cómo funciona VecinoXpress</h3>
              </div>
              <p className="text-indigo-700 mb-4">
                Mira este video para entender mejor cómo funciona nuestra plataforma y los beneficios que ofrece tanto para comercios como para clientes.
              </p>
              <div 
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setShowVideoModal(true)}
              >
                <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-indigo-600 ml-1" />
                  </div>
                </div>
                <VecinosIllustrations.StoreServing className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="ubicaciones" className="py-20 bg-gradient-to-br from-indigo-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
              Encuentra VecinoXpress en todo Chile
            </h2>
            <p className="text-lg text-indigo-700 max-w-3xl mx-auto">
              Nuestra red de locales asociados crece cada día. Ubica el punto más cercano a ti.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-xl border border-indigo-100 relative h-[500px] bg-white">
              {/* SVG Map of Chile with interactive points */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <svg 
                  viewBox="0 0 200 800" 
                  className="w-full h-full max-h-[480px]" 
                  style={{ maxWidth: '250px' }}
                >
                  {/* Simplified outline of Chile */}
                  <path 
                    d="M120,50 C130,100 140,150 130,200 C120,250 110,300 100,350 C90,400 85,450 90,500 C95,550 100,600 95,650 C90,700 80,750 70,780" 
                    fill="none" 
                    stroke="#2d219b" 
                    strokeWidth="20" 
                    strokeLinecap="round"
                    opacity="0.1"
                  />
                  
                  {/* Hotspot for Arica */}
                  <circle 
                    cx="120" 
                    cy="50" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                    onClick={() => {
                      // Show tooltip for Arica
                    }}
                  />
                  <text x="135" y="55" fill="#333" fontSize="10" fontWeight="bold">Arica</text>
                  
                  {/* Hotspot for Iquique */}
                  <circle 
                    cx="125" 
                    cy="100" 
                    r="8" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="140" y="105" fill="#333" fontSize="10" fontWeight="bold">Iquique</text>
                  
                  {/* Hotspot for Antofagasta */}
                  <circle 
                    cx="130" 
                    cy="150" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="145" y="155" fill="#333" fontSize="10" fontWeight="bold">Antofagasta</text>
                  
                  {/* Hotspot for La Serena */}
                  <circle 
                    cx="115" 
                    cy="280" 
                    r="8" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="130" y="285" fill="#333" fontSize="10" fontWeight="bold">La Serena</text>
                  
                  {/* Hotspot for Viña del Mar */}
                  <circle 
                    cx="100" 
                    cy="350" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="115" y="355" fill="#333" fontSize="10" fontWeight="bold">Viña del Mar</text>
                  
                  {/* Hotspot for Santiago (larger) */}
                  <circle 
                    cx="95" 
                    cy="380" 
                    r="15" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors pulse-animation"
                  />
                  <text x="115" y="385" fill="#333" fontSize="12" fontWeight="bold">Santiago</text>
                  
                  {/* Hotspot for Rancagua */}
                  <circle 
                    cx="95" 
                    cy="420" 
                    r="7" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="110" y="425" fill="#333" fontSize="10" fontWeight="bold">Rancagua</text>
                  
                  {/* Hotspot for Talca */}
                  <circle 
                    cx="95" 
                    cy="470" 
                    r="8" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="110" y="475" fill="#333" fontSize="10" fontWeight="bold">Talca</text>
                  
                  {/* Hotspot for Concepción */}
                  <circle 
                    cx="90" 
                    cy="520" 
                    r="12" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="105" y="525" fill="#333" fontSize="10" fontWeight="bold">Concepción</text>
                  
                  {/* Hotspot for Temuco */}
                  <circle 
                    cx="90" 
                    cy="600" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="105" y="605" fill="#333" fontSize="10" fontWeight="bold">Temuco</text>
                  
                  {/* Hotspot for Valdivia */}
                  <circle 
                    cx="90" 
                    cy="650" 
                    r="8" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="105" y="655" fill="#333" fontSize="10" fontWeight="bold">Valdivia</text>
                  
                  {/* Hotspot for Puerto Montt */}
                  <circle 
                    cx="80" 
                    cy="700" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="95" y="705" fill="#333" fontSize="10" fontWeight="bold">Pto. Montt</text>
                  
                  {/* Hotspot for Punta Arenas */}
                  <circle 
                    cx="70" 
                    cy="780" 
                    r="10" 
                    fill="#2d219b" 
                    className="cursor-pointer hover:fill-indigo-500 transition-colors"
                  />
                  <text x="85" y="785" fill="#333" fontSize="10" fontWeight="bold">Pta. Arenas</text>
                  
                  {/* Legend */}
                  <circle cx="25" cy="30" r="5" fill="#2d219b" />
                  <text x="35" y="35" fill="#333" fontSize="10">Locales VecinoXpress</text>
                </svg>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 border-t border-indigo-100">
                <p className="text-indigo-900 font-medium text-center">
                  ¡Más de 500 puntos VecinoXpress en todo Chile!
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                  Locales destacados
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Store className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-indigo-900">Minimarket El Sol</h4>
                      <p className="text-indigo-600">Santiago Centro</p>
                      <p className="text-sm text-indigo-700 mt-1">Av. Libertador 1234, Santiago</p>
                      <div className="mt-2 flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-indigo-600">Abierto ahora</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-100" />
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Store className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-indigo-900">Librería Central</h4>
                      <p className="text-indigo-600">Providencia</p>
                      <p className="text-sm text-indigo-700 mt-1">Av. Providencia 2145, Providencia</p>
                      <div className="mt-2 flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star, idx) => (
                            <svg key={star} className={`w-4 h-4 ${idx < 4 ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-indigo-600">Abierto ahora</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-100" />
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Store className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-indigo-900">Kiosco Express</h4>
                      <p className="text-indigo-600">Las Condes</p>
                      <p className="text-sm text-indigo-700 mt-1">Av. Apoquindo 6415, Las Condes</p>
                      <div className="mt-2 flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-indigo-600">Abierto ahora</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      // Redirect to store locator page
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Ver todos los locales
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">
                  Buscar por ubicación
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-indigo-900">Región</label>
                    <select className="w-full rounded-md border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <option>Selecciona una región</option>
                      <option>Región Metropolitana</option>
                      <option>Valparaíso</option>
                      <option>Biobío</option>
                      <option>La Araucanía</option>
                      <option>Otras regiones</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-indigo-900">Comuna</label>
                    <select className="w-full rounded-md border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <option>Selecciona una comuna</option>
                      <option>Santiago</option>
                      <option>Providencia</option>
                      <option>Las Condes</option>
                      <option>Ñuñoa</option>
                      <option>Otras comunas</option>
                    </select>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-indigo-300 text-indigo-700"
                  >
                    Buscar locales cercanos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
              Lo que dicen nuestros socios
            </h2>
            <p className="text-lg text-indigo-700 max-w-3xl mx-auto">
              Conoce las experiencias de algunos de nuestros comercios asociados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-indigo-900">Minimarket El Sol</CardTitle>
                    <CardDescription>Santiago Centro</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-indigo-700">
                  "Unirme a VecinoXpress ha sido una excelente decisión para mi negocio. Ahora recibo entre 15-20 clientes diarios que vienen por documentos y muchos aprovechan para comprar algo más."
                </p>
                <p className="text-indigo-600 font-medium mt-4">
                  Carlos Ramírez, Propietario
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-indigo-900">Librería Lecturas</CardTitle>
                    <CardDescription>Providencia</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-indigo-700">
                  "Las comisiones adicionales por los servicios de certificación me han permitido aumentar mis ingresos en un 30%. El sistema es muy fácil de usar y el soporte es excelente."
                </p>
                <p className="text-indigo-600 font-medium mt-4">
                  Marcela Soto, Propietaria
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-indigo-900">Cafetería El Rincón</CardTitle>
                    <CardDescription>Ñuñoa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star, idx) => (
                    <svg key={star} className={`w-5 h-5 ${idx < 4 ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-indigo-700">
                  "Tenía dudas al principio, pero la integración fue muy sencilla. Ahora ofrezco un servicio adicional que atrae más clientes y genera ingresos extras sin interferir con mi negocio principal."
                </p>
                <p className="text-indigo-600 font-medium mt-4">
                  Javier Morales, Propietario
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Registration Form Section */}
      <section id="registro" className="py-20 bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="lg:w-1/2">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
                  Únete hoy a nuestra red de socios
                </h2>
                <p className="text-lg text-indigo-700">
                  Completa el formulario y un representante se pondrá en contacto contigo para iniciar el proceso de incorporación.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-xl border border-indigo-100">
                {renderFormStep()}
              </div>
            </div>
            
            <div className="lg:w-1/2 lg:sticky lg:top-24">
              <div className="bg-white p-8 rounded-xl shadow-xl border border-indigo-100 mb-8">
                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <PhoneIcon className="mr-2 h-5 w-5 text-indigo-600" />
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-indigo-700 mb-4">
                  Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:
                </p>
                <ul className="space-y-3 text-indigo-700">
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                    <span>+56 2 2123 4567</span>
                  </li>
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                    <span>socios@vecinoxpress.cl</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                    <span>Lunes a Viernes: 9:00 - 18:00</span>
                  </li>
                </ul>
              </div>
              
              <Accordion type="single" collapsible className="bg-white p-3 rounded-xl shadow-lg border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-2 px-3 pt-3">Preguntas frecuentes</h3>
                <AccordionItem value="item-1" className="border-b border-indigo-100">
                  <AccordionTrigger className="text-indigo-800 hover:text-indigo-600 font-medium">
                    ¿Hay algún costo para unirme al programa?
                  </AccordionTrigger>
                  <AccordionContent className="text-indigo-700">
                    No, unirse al programa VecinoXpress es completamente gratuito. Nosotros proporcionamos todo el equipamiento necesario sin costo alguno.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-b border-indigo-100">
                  <AccordionTrigger className="text-indigo-800 hover:text-indigo-600 font-medium">
                    ¿Qué documentos puedo certificar?
                  </AccordionTrigger>
                  <AccordionContent className="text-indigo-700">
                    Podrás procesar diversos tipos de documentos como certificaciones de identidad, copias autorizadas, declaraciones juradas simples, y más.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-b border-indigo-100">
                  <AccordionTrigger className="text-indigo-800 hover:text-indigo-600 font-medium">
                    ¿Cómo recibo mis comisiones?
                  </AccordionTrigger>
                  <AccordionContent className="text-indigo-700">
                    Las comisiones se calculan automáticamente y se transfieren a tu cuenta bancaria mensualmente. Puedes ver todas tus transacciones y comisiones en tu panel de control.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="border-b border-indigo-100">
                  <AccordionTrigger className="text-indigo-800 hover:text-indigo-600 font-medium">
                    ¿Necesito experiencia legal previa?
                  </AccordionTrigger>
                  <AccordionContent className="text-indigo-700">
                    No, no se requiere experiencia legal previa. Nuestro sistema está diseñado para ser fácil de usar y proporcionamos capacitación completa a todos los socios.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-indigo-800 hover:text-indigo-600 font-medium">
                    ¿Puedo cancelar mi participación en cualquier momento?
                  </AccordionTrigger>
                  <AccordionContent className="text-indigo-700">
                    Sí, puedes cancelar tu participación en cualquier momento con un preaviso de 30 días. Solo deberás devolver el equipamiento proporcionado en buen estado.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-indigo-950 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img src={vecinosXpressLogo} alt="VecinoXpress Logo" className="h-10 mb-4" />
              <p className="text-indigo-200 mb-4">
                Transformando negocios locales en centros de servicios legales digitales.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-indigo-300 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-indigo-300 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-indigo-300 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="text-indigo-300 hover:text-white transition">Beneficios</a></li>
                <li><a href="#como-funciona" className="text-indigo-300 hover:text-white transition">Cómo funciona</a></li>
                <li><a href="#testimonios" className="text-indigo-300 hover:text-white transition">Testimonios</a></li>
                <li><a href="#registro" className="text-indigo-300 hover:text-white transition">Registro</a></li>
                <li><a href="#" className="text-indigo-300 hover:text-white transition">Términos y condiciones</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-indigo-400 mr-2 mt-0.5" />
                  <span className="text-indigo-300">Av. Providencia 1208, Santiago, Chile</span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-indigo-400 mr-2 mt-0.5" />
                  <span className="text-indigo-300">+56 2 2123 4567</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-indigo-400 mr-2 mt-0.5" />
                  <span className="text-indigo-300">info@vecinoxpress.cl</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suscríbete</h3>
              <p className="text-indigo-300 mb-4">
                Recibe noticias y actualizaciones sobre nuestros servicios.
              </p>
              <div className="flex">
                <Input 
                  placeholder="Tu correo electrónico" 
                  className="rounded-r-none bg-indigo-900 border-indigo-700 text-white" 
                />
                <Button 
                  className="rounded-l-none bg-indigo-600 hover:bg-indigo-500"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-indigo-800 text-center text-indigo-400">
            <p>&copy; {new Date().getFullYear()} VecinoXpress. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Video modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-xl font-bold text-indigo-900">Cómo funciona VecinoXpress</h3>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowVideoModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {/* Aquí iría el video, por ahora usamos la ilustración */}
              <div className="text-center">
                <VecinosIllustrations.StoreServing className="w-64 h-64 mx-auto" />
                <p className="text-indigo-700 mt-4">Video de demostración no disponible en este momento</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}