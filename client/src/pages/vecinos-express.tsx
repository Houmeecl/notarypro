import { useState } from "react";
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
  FileText
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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Importamos el logo
import notaryProLogo from "@assets/logo12582620.png";

export default function VecinosExpress() {
  const [, setLocation] = useLocation();
  
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
      // Mostrar loading state
      const loadingToast = {
        title: "Enviando solicitud",
        description: "Procesando su solicitud, por favor espere...",
        variant: "default"
      };
      
      // Aquí enviaríamos los datos del formulario a la API
      // Por ahora simulamos un delay para mostrar el proceso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar confirmación
      const successToast = {
        title: "¡Solicitud enviada con éxito!",
        description: "Hemos recibido su solicitud. Una supervisora revisará sus datos y se pondrá en contacto con usted en breve para coordinar la entrega y configuración de su equipo.",
        variant: "success"
      };
      
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
      const errorToast = {
        title: "Error al enviar solicitud",
        description: "Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente.",
        variant: "destructive"
      };
    }
  };

  // Componente para cada paso del formulario
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Información del Negocio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Negocio</label>
                <Input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Ej: Minimarket Don Pedro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Negocio</label>
                <Input
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  placeholder="Ej: Minimarket, Librería, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Propietario</label>
                <Input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RUT</label>
                <Input
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  placeholder="12.345.678-9"
                  required
                />
              </div>
            </div>
            <Button 
              onClick={nextStep} 
              className="mt-4 w-full md:w-auto"
            >
              Continuar <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.cl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
              >
                Volver
              </Button>
              <Button 
                onClick={nextStep}
              >
                Continuar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Datos Bancarios</h3>
            <p className="text-gray-600 text-sm mb-4">
              Esta información será utilizada para transferir sus comisiones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Banco</label>
                <Input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Nombre del banco"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número de Cuenta</label>
                <Input
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="Número de cuenta bancaria"
                  required
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Nota importante:</strong> Al enviar este formulario, usted acepta nuestros términos y condiciones para el programa Vecinos NotaryPro Express. Un representante se pondrá en contacto con usted para concretar los detalles de su incorporación.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
              >
                Volver
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-primary hover:bg-red-700"
              >
                Enviar Solicitud
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">¡Solicitud enviada con éxito!</h2>
            <div className="max-w-md mx-auto mb-8">
              <p className="text-gray-600 mb-4">
                Gracias por su interés en unirse al programa Vecinos NotaryPro Express. Hemos recibido su solicitud y será revisada por nuestro equipo de supervisión.
              </p>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <h3 className="font-semibold text-lg mb-2">Próximos pasos:</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <span>Una supervisora revisará su solicitud en un plazo de 48 horas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <span>Recibirá un correo de confirmación con sus credenciales de acceso al sistema.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <span>La supervisora coordinará la entrega y configuración del equipamiento en su negocio.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <span>Recibirá capacitación sobre el uso del sistema.</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-primary hover:bg-red-700"
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-50 to-red-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <div className="flex items-center mb-4">
                <img src={notaryProLogo} alt="NotaryPro Logo" className="h-12 mr-3" />
                <h2 className="text-2xl font-bold">Vecinos NotaryPro Express</h2>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Convierta su negocio en un centro de servicios legales
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Incremente sus ingresos ofreciendo servicios de certificación de documentos y trámites legales en su establecimiento.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-primary hover:bg-red-700 text-white py-2 px-6"
                  onClick={() => {
                    const element = document.getElementById('registro');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Registre su negocio
                </Button>
                <Button 
                  variant="outline"
                  className="border-primary text-primary hover:bg-red-50"
                  onClick={() => {
                    const element = document.getElementById('como-funciona');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Cómo funciona
                </Button>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setLocation('/partners/webapp-pos-official')}
                >
                  Acceder a POS Web
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full"></div>
                <div className="bg-white p-6 rounded-xl shadow-xl relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center bg-red-50 p-4 rounded-lg">
                      <DollarSign className="h-8 w-8 text-primary mb-2" />
                      <p className="text-center font-semibold">Nuevos ingresos</p>
                    </div>
                    <div className="flex flex-col items-center bg-blue-50 p-4 rounded-lg">
                      <Store className="h-8 w-8 text-blue-500 mb-2" />
                      <p className="text-center font-semibold">Mayor afluencia</p>
                    </div>
                    <div className="flex flex-col items-center bg-green-50 p-4 rounded-lg">
                      <Award className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-center font-semibold">Prestigio comercial</p>
                    </div>
                    <div className="flex flex-col items-center bg-purple-50 p-4 rounded-lg">
                      <FileText className="h-8 w-8 text-purple-500 mb-2" />
                      <p className="text-center font-semibold">Trámites sencillos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cómo funciona Vecinos NotaryPro Express</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforme su negocio en un punto de servicios notariales con solo tres pasos sencillos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Regístrese</h3>
              <p className="text-gray-600">
                Complete el formulario de inscripción y uno de nuestros representantes se pondrá en contacto para evaluar y completar el proceso.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Reciba su equipamiento</h3>
              <p className="text-gray-600">
                Le proporcionaremos una tablet con nuestra aplicación instalada, material publicitario, y capacitación para usar el sistema.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Comience a operar</h3>
              <p className="text-gray-600">
                Empiece a ofrecer servicios de certificación documental en su negocio y obtenga comisiones por cada trámite completado.
              </p>
            </div>
          </div>
          
          <div className="mt-12 bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-1/4 flex justify-center">
                <img src={notaryProLogo} alt="NotaryPro App" className="h-28" />
              </div>
              <div className="md:w-3/4">
                <h3 className="text-2xl font-bold mb-3">Aplicación fácil de usar</h3>
                <p className="text-gray-700 mb-4">
                  Nuestra aplicación para tablet está diseñada para ser extremadamente intuitiva. Solo necesita seguir 3 pasos para completar cada trámite:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Escanear el documento del cliente</li>
                  <li>Verificar la identidad mediante huella digital o cédula</li>
                  <li>Enviar a certificación y cobrar el servicio</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Beneficios para su negocio</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra por qué más de 200 comercios ya son parte de la red Vecinos NotaryPro Express
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Ingresos Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Obtenga comisiones de hasta el 40% por cada servicio de certificación que se realice en su local, aumentando significativamente sus ingresos mensuales.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Mayor Tráfico de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Al ofrecer estos servicios, aumentará el flujo de personas en su negocio, lo que puede traducirse en ventas adicionales de sus productos regulares.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Prestigio y Reconocimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Forme parte de una red de establecimientos reconocidos oficialmente para realizar trámites documentales, aumentando la confianza de sus clientes.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Sin Horarios Fijos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Usted decide en qué horarios ofrecer los servicios, adaptándolos a la operación habitual de su negocio sin comprometer sus actividades principales.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">Sin inversión inicial</h3>
                <p className="text-gray-700 mb-4">
                  A diferencia de otras franquicias, unirse a Vecinos NotaryPro Express no requiere inversión monetaria:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Equipamiento tecnológico incluido (tablet)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Material publicitario (afiches, folletos)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Capacitación gratuita para su personal</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Soporte técnico permanente</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img src={notaryProLogo} alt="Equipo NotaryPro" className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros socios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra cómo ha cambiado el programa la realidad de estos negocios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Carlos Mendoza</h4>
                  <p className="text-gray-500 text-sm">Minimarket Las Condes</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Desde que me uní al programa, mis ventas aumentaron en un 25%. Los clientes vienen por los trámites y terminan comprando otros productos. Las comisiones representan ahora el 20% de mis ingresos mensuales."
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">María Juárez</h4>
                  <p className="text-gray-500 text-sm">Librería Maipú</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "La tablet es muy fácil de usar y el soporte técnico siempre está disponible. Mis clientes valoran poder hacer sus trámites aquí sin tener que ir al centro de la ciudad. Ha sido un gran complemento para mi negocio."
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Pedro Alarcón</h4>
                  <p className="text-gray-500 text-sm">Ferretería Providencia</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Al principio dudé, pero después de ver cómo funcionaba en otro local, decidí unirme. La inversión fue cero y ahora genero ingresos adicionales que me ayudan a mantener estable el negocio incluso en temporadas bajas."
              </p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center">
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-red-50"
              onClick={() => {
                const element = document.getElementById('registro');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Conviértase en socio <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="preguntas" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Resolvemos sus dudas sobre el programa Vecinos NotaryPro Express
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué tipo de negocios pueden participar?</AccordionTrigger>
                <AccordionContent>
                  Cualquier negocio con un local físico puede aplicar: minimarkets, librerías, ferreterías, farmacias, centros de fotocopiado, quioscos, etc. Evaluamos cada solicitud individualmente considerando la ubicación y el flujo de personas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cuánto puedo ganar con las comisiones?</AccordionTrigger>
                <AccordionContent>
                  Las comisiones varían entre el 25% y el 40% del valor de cada trámite, dependiendo del volumen mensual. Un negocio promedio puede generar entre $150.000 y $500.000 pesos chilenos adicionales al mes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Necesito conocimientos legales?</AccordionTrigger>
                <AccordionContent>
                  No se requiere ningún conocimiento legal previo. Nuestra aplicación guía paso a paso el proceso y nos encargamos de toda la parte legal. Proporcionamos capacitación completa a usted y su personal.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cómo recibo mis comisiones?</AccordionTrigger>
                <AccordionContent>
                  Las comisiones se liquidan quincenalmente mediante transferencia bancaria a la cuenta que usted registre. Puede consultar su saldo y movimientos en tiempo real a través del panel de control de la aplicación.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>¿Hay algún costo para unirse al programa?</AccordionTrigger>
                <AccordionContent>
                  No hay ningún costo para unirse. Proporcionamos el equipamiento, software y material publicitario sin cargo. Solo requerimos que mantenga un mínimo de operaciones mensuales para mantener activa la participación.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>¿Qué requisitos técnicos necesito?</AccordionTrigger>
                <AccordionContent>
                  Solo necesita una conexión a internet estable (WiFi) y un espacio pequeño para colocar la tablet y el material informativo. La tablet incluye datos móviles de respaldo en caso de fallas en su conexión.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="registro" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Registro de Negocios</h2>
              <p className="text-xl text-gray-600">
                Complete el formulario para unirse al programa Vecinos NotaryPro Express
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
              {/* Step progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${formStep >= 1 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                      <Building className="h-5 w-5" />
                    </div>
                    <span className="text-sm mt-1">Negocio</span>
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full ${formStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: formStep === 1 ? '0%' : '100%' }}></div>
                  </div>
                  <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${formStep >= 2 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <span className="text-sm mt-1">Contacto</span>
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full ${formStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: formStep === 3 ? '100%' : '0%' }}></div>
                  </div>
                  <div className={`flex flex-col items-center ${formStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${formStep >= 3 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-sm mt-1">Pagos</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {renderFormStep()}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#EC1C24] to-[#d91920] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img src={notaryProLogo} alt="NotaryPro Logo" className="h-16 mx-auto mb-6 filter brightness-0 invert" />
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Únase a nuestra red de puntos de servicio y transforme su negocio en un centro de trámites documentales certificados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => {
                const element = document.getElementById('registro');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-[#EC1C24] hover:bg-white/90 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Registrar mi negocio
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
              onClick={() => {
                const element = document.getElementById('preguntas');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver más información
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="flex items-center mb-6 md:mb-0">
              <img src={notaryProLogo} alt="NotaryPro Logo" className="h-10 mr-3 filter brightness-0 invert" />
              <div>
                <h3 className="text-xl font-bold">Vecinos NotaryPro Express</h3>
                <p className="text-gray-400 text-sm">Transformando negocios locales</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#EC1C24] transition-colors">
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-gray-800">
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre NotaryPro</h3>
              <p className="text-gray-400">
                Programa de puntos de servicio para trámites documentales certificados. 
                Expandiendo el acceso a servicios legales en todo Chile.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>Av. Principal 123, Santiago</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>+56 2 2123 4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#EC1C24]" />
                  <span>vecinos@cerfidoc.cl</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#beneficios" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Beneficios
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#testimonios" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Testimonios
                  </a>
                </li>
                <li>
                  <a href="#preguntas" className="hover:text-white hover:ml-1 transition-all flex items-center">
                    <span className="text-[#EC1C24] mr-2">→</span> Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Reciba actualizaciones</h3>
              <p className="text-gray-400 mb-4">
                Suscríbase para recibir las últimas novedades sobre nuestro programa
              </p>
              <form className="flex">
                <Input 
                  type="email"
                  placeholder="Su correo electrónico"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-r-none"
                />
                <Button type="submit" className="bg-[#EC1C24] hover:bg-[#d91920] rounded-l-none">
                  Enviar
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} CerfiDoc NotaryPro. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white">Términos y condiciones</a>
                <a href="#" className="text-gray-400 hover:text-white">Política de privacidad</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}