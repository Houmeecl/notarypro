import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Users, Award, Target, GraduationCap, Clock, Globe, Landmark, CheckCircle, Fingerprint, Shield } from 'lucide-react';
import logo from '@assets/logo12582620.png';

const QuienesSomosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header con imagen de fondo */}
      <div className="relative bg-primary h-64 md:h-80 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Quiénes Somos</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Transformando la certificación de documentos en Chile con seguridad, tecnología e innovación.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <Tabs defaultValue="nosotros" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nosotros">Nosotros</TabsTrigger>
                <TabsTrigger value="mision">Misión</TabsTrigger>
                <TabsTrigger value="vision">Visión</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nosotros" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-primary">Nuestra Historia</h2>
                  <p className="text-muted-foreground">
                    Cerfidoc nació en 2022 como respuesta a una necesidad creciente en el mercado chileno: 
                    hacer más ágil, confiable y accesible el proceso de certificación de documentos. Lo que comenzó 
                    como un pequeño emprendimiento tecnológico ha crecido para convertirse en la plataforma líder 
                    en verificación documental digital en Chile.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Nuestro Equipo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Contamos con un equipo multidisciplinario de expertos en tecnología, 
                          derecho y servicio al cliente. Nuestra pasión es reinventar procesos 
                          tradicionales a través de la innovación.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Valores
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Integridad, confianza, innovación y compromiso son los pilares 
                          fundamentales que guían nuestras decisiones y acciones diarias 
                          para ofrecer el mejor servicio.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="mision" className="pt-6 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Nuestra Misión</h2>
                  </div>
                  
                  <p className="text-lg font-medium mb-6 text-muted-foreground">
                    <span className="text-primary font-bold">"</span>
                    Brindar servicios de certificación documental ágiles, seguros y accesibles, 
                    transformando la experiencia legal tradicional a través de la tecnología, 
                    contribuyendo a la digitalización de Chile y facilitando la vida de personas y empresas.
                    <span className="text-primary font-bold">"</span>
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Accesibilidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Democratizamos el acceso a servicios legales eliminando barreras geográficas y burocráticas.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Seguridad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Garantizamos la integridad de cada documento mediante procesos trazables y encriptación avanzada.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Agilidad</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Optimizamos los tiempos de respuesta para ofrecer un servicio inmediato y eficiente.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vision" className="pt-6 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Nuestra Visión</h2>
                  </div>
                  
                  <p className="text-lg font-medium mb-6 text-muted-foreground">
                    <span className="text-primary font-bold">"</span>
                    Ser la plataforma líder en Latinoamérica en certificación y verificación documental digital, 
                    reconocida por nuestra innovación tecnológica, confiabilidad y excelencia en el servicio, 
                    contribuyendo activamente a la transformación digital del ecosistema legal en la región.
                    <span className="text-primary font-bold">"</span>
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-primary/5 border">
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="font-normal">2025</Badge>
                        Expansión Nacional
                      </h3>
                      <p className="text-muted-foreground">
                        Consolidar nuestra red de certificadores en todas las regiones de Chile, 
                        garantizando acceso universal a nuestros servicios digitales independientemente 
                        de la ubicación geográfica.
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-lg bg-primary/5 border">
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="font-normal">2026</Badge>
                        Integración Regional
                      </h3>
                      <p className="text-muted-foreground">
                        Expandir nuestros servicios a mercados estratégicos en Latinoamérica, 
                        adaptándonos a las regulaciones locales y estableciendo alianzas con 
                        instituciones clave en cada país.
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-lg bg-primary/5 border">
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="font-normal">2030</Badge>
                        Liderazgo en Innovación
                      </h3>
                      <p className="text-muted-foreground">
                        Desarrollar nuevas tecnologías para la verificación documental basadas en 
                        blockchain, inteligencia artificial y biometría avanzada, estableciendo 
                        estándares de seguridad en la industria.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Cerfidoc en cifras</CardTitle>
                <CardDescription>
                  Nuestro impacto en números
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">100,000+</span>
                  <span className="text-sm text-muted-foreground">Documentos certificados</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">50+</span>
                  <span className="text-sm text-muted-foreground">Certificadores en Chile</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">15</span>
                  <span className="text-sm text-muted-foreground">Regiones con cobertura</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">7 min</span>
                  <span className="text-sm text-muted-foreground">Tiempo promedio de atención</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Nuestras Certificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Landmark className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Cumplimiento Ley 19.799</p>
                    <p className="text-xs text-muted-foreground">Documentos Electrónicos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">ISO 27001</p>
                    <p className="text-xs text-muted-foreground">Seguridad de la Información</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Verificación Biométrica</p>
                    <p className="text-xs text-muted-foreground">Autenticación avanzada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Enlaces de interés</h3>
              
              <Link href="/servicios-empresariales">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Servicios Empresariales
                </Button>
              </Link>
              
              <Link href="/unete-al-equipo">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Únete al Equipo
                </Button>
              </Link>
              
              <Link href="/aviso-legal">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Aviso Legal
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sección equipo */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary">Nuestro Equipo Directivo</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Contamos con profesionales de amplia experiencia en tecnología, derecho y gestión empresarial, 
              comprometidos con transformar la experiencia de certificación documental en Chile.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                name: "Eduardo Castillo",
                position: "Director General",
                bio: "Más de 10 años de experiencia en emprendimientos tecnológicos y digitalización de servicios legales."
              },
              {
                name: "Marcela Jiménez",
                position: "Directora Tecnológica",
                bio: "Especialista en seguridad digital y desarrollo de plataformas de validación de identidad."
              },
              {
                name: "Luis Fuentes",
                position: "Director Legal",
                bio: "Abogado con máster en derecho digital y amplia experiencia en el ámbito notarial y registral."
              },
              {
                name: "Carolina Méndez",
                position: "Directora Comercial",
                bio: "Liderazgo en expansión de negocios digitales y creación de redes de partners estratégicos."
              }
            ].map((person, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-40 bg-primary/10 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary/40" />
                </div>
                <CardHeader>
                  <CardTitle>{person.name}</CardTitle>
                  <CardDescription>{person.position}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{person.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* CTA final */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-primary/5 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">¿Listo para transformar tu experiencia con documentos legales?</h2>
            <p className="text-muted-foreground mb-6">
              Únete a los miles de usuarios que ya disfrutan de certificación documental moderna, 
              rápida y segura con Cerfidoc.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/servicios-empresariales">
                <Button size="lg" variant="outline">Conoce nuestros servicios</Button>
              </Link>
              <Link href="/document-categories">
                <Button size="lg">Comenzar ahora</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuienesSomosPage;