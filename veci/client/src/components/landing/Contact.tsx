import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    privacy: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      subject: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message || !formData.subject || !formData.privacy) {
      toast({
        title: "Error en el formulario",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    // Here would go the actual form submission logic
    console.log("Form data:", formData);
    
    // Show success message
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos a la brevedad."
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      privacy: false
    });
  };

  return (
    <section id="contacto" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-secondary font-heading mb-4">Contáctanos</h2>
            <p className="text-lg text-gray-600 mb-6">
              Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo lo antes posible.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">Av. Providencia 1208, Oficina 503, Providencia, Santiago de Chile</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">contacto@docusignpro.cl</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">+56 2 2123 4567</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-secondary mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-150">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-150">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-150">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-150">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="bg-light rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <Select onValueChange={handleSelectChange} value={formData.subject}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un asunto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Información general</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="support">Soporte técnico</SelectItem>
                      <SelectItem value="certification">Curso de certificación</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="¿Cómo podemos ayudarte?"
                    className="w-full"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="privacy" 
                    name="privacy"
                    checked={formData.privacy}
                    onCheckedChange={(checked) => setFormData({...formData, privacy: checked})}
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600">
                    Acepto la <a href="#" className="text-primary hover:underline">política de privacidad</a> y el tratamiento de mis datos.
                  </label>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-primary hover:bg-red-700">
                    Enviar mensaje
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
