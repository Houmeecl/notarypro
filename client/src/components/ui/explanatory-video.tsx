import React, { useState } from "react";
import { Play, Pause, X, Video, Info, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import videoThumbnails, { videoScripts } from "@/lib/video-thumbnails";

interface ExplanatoryVideoProps {
  title: string;
  description: string;
  videoUrl?: string;
  videoType?: "explanation" | "tutorial" | "verification";
  triggerLabel?: string;
  children?: React.ReactNode;
}

/**
 * Componente para mostrar videos explicativos en distintas partes de la aplicación
 */
// Videos explicativos profesionales para nuestra plataforma
const defaultVideos = {
  explanation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Explicación general de la plataforma
  tutorial: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // Tutorial paso a paso de firma de documentos
  verification: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" // Proceso de verificación de identidad
};

// Títulos y descripciones predeterminados para cada tipo de video
const videoTitles = {
  explanation: "Cómo funciona NotaryPro",
  tutorial: "NotaryPro para Empresas",
  verification: "Programa Vecinos NotaryPro Express"
};

const videoDescriptions = {
  explanation: "Conoce todos los pasos para utilizar NotaryPro: desde la creación de tu cuenta hasta la firma y verificación de documentos. Un recorrido completo por las funcionalidades de la plataforma.",
  tutorial: "Dos ejecutivos discuten cómo implementar NotaryPro en su empresa y los beneficios para el negocio. Descubre por qué empresas de todos los tamaños eligen nuestra plataforma para sus documentos legales.",
  verification: "Conoce cómo funciona nuestro programa Vecinos NotaryPro Express que permite a tiendas locales, minimarkets y almacenes de barrio convertirse en puntos de certificación y obtener comisiones por cada servicio."
};

// Mensajes que se muestran al finalizar el video
const videoCompletionMessages = {
  explanation: "Ya conoces NotaryPro. ¡Prueba nuestra plataforma para experimentar todas sus ventajas!",
  tutorial: "¡Felicidades! Ahora sabes cómo firmar documentos en NotaryPro. ¿Listo para comenzar?",
  verification: "Ahora entiendes nuestro proceso de verificación seguro. Tu identidad está protegida con NotaryPro."
};

export const ExplanatoryVideo: React.FC<ExplanatoryVideoProps> = ({
  title,
  description,
  videoUrl,
  videoType = "explanation",
  triggerLabel = "Ver guión",
  children
}) => {
  // Eliminamos el estado de reproducción ya que ahora mostramos texto
  
  const videoTitle = title || videoTitles[videoType];
  const videoDescription = description || videoDescriptions[videoType];
  
  // Función vacía, ya no necesitamos controlar la reproducción
  const handlePlayPause = () => {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {videoTitle}
          </DialogTitle>
          <DialogDescription>
            {videoDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="relative rounded-md overflow-hidden">
          <div className="relative w-full overflow-hidden rounded-md border border-muted p-4">
            <div className="aspect-video bg-white/90 p-5 overflow-y-auto">
              {videoType === 'explanation' && (
                <div className="text-sm">
                  <h3 className="font-bold text-lg mb-3 text-primary">VIDEO 1: ¿CÓMO FUNCIONA NOTARYPRO?</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 1</h4>
                    <p className="text-muted-foreground mb-1"><i>[Logo NotaryPro animado]</i></p>
                    <p><b>NARRADOR:</b> Bienvenido a NotaryPro, la nueva forma de gestionar documentos legales en Chile.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 2</h4>
                    <p className="text-muted-foreground mb-1"><i>[Persona firmando en tablet]</i></p>
                    <p><b>NARRADOR:</b> Crea, firma y certifica documentos legales desde cualquier lugar.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 3</h4>
                    <p className="text-muted-foreground mb-1"><i>[Firma digital validada con animación de sello de validación]</i></p>
                    <p><b>NARRADOR:</b> Firma electrónica certificada, cumplimiento 100% legal.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 4</h4>
                    <p className="text-muted-foreground mb-1"><i>[Documento enviado a organismo oficial con animación de documento en movimiento]</i></p>
                    <p><b>NARRADOR:</b> Gestión directa ante las entidades requeridas.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 5</h4>
                    <p className="text-muted-foreground mb-1"><i>[Cierre con logo y slogan]</i></p>
                    <p><b>NARRADOR:</b> NotaryPro. Legaliza tu mundo, sin moverte.</p>
                  </div>
                </div>
              )}
              
              {videoType === 'tutorial' && (
                <div className="text-sm">
                  <h3 className="font-bold text-lg mb-3 text-primary">VIDEO 2: TUTORIAL - FIRMA DE DOCUMENTOS ONLINE</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 1</h4>
                    <p className="text-muted-foreground mb-1"><i>[Pantalla de usuario entrando a la web o POS]</i></p>
                    <p><b>NARRADOR:</b> Paso 1: Selecciona tu documento.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 2</h4>
                    <p className="text-muted-foreground mb-1"><i>[Usuario rellenando campos en formulario]</i></p>
                    <p><b>NARRADOR:</b> Paso 2: Completa tus datos personales.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 3</h4>
                    <p className="text-muted-foreground mb-1"><i>[Usuario escaneando QR para verificar identidad]</i></p>
                    <p><b>NARRADOR:</b> Paso 3: Verifica tu identidad con tu cédula.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 4</h4>
                    <p className="text-muted-foreground mb-1"><i>[Usuario firmando en pantalla táctil]</i></p>
                    <p><b>NARRADOR:</b> Paso 4: Firma electrónicamente.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 5</h4>
                    <p className="text-muted-foreground mb-1"><i>[Usuario recibiendo documento]</i></p>
                    <p><b>NARRADOR:</b> Recibe tu documento firmado.</p>
                  </div>
                </div>
              )}
              
              {videoType === 'verification' && (
                <div className="text-sm">
                  <h3 className="font-bold text-lg mb-3 text-primary">VIDEO 3: NOTARY EXPRESS VECINOS</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 1</h4>
                    <p className="text-muted-foreground mb-1"><i>[Imagen de barrio o almacén]</i></p>
                    <p><b>NARRADOR:</b> Tus trámites legales ahora más cerca de ti.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 2</h4>
                    <p className="text-muted-foreground mb-1"><i>[Vecina firmando en una tablet POS de NotaryPro en un almacén]</i></p>
                    <p><b>NARRADOR:</b> En tu almacén de confianza, realiza trámites legales fácilmente.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 3</h4>
                    <p className="text-muted-foreground mb-1"><i>[Documento enviado a WhatsApp]</i></p>
                    <p><b>NARRADOR:</b> Documentos legales certificados al instante.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold">ESCENA 4</h4>
                    <p className="text-muted-foreground mb-1"><i>[Logo NotaryPro Express]</i></p>
                    <p><b>NARRADOR:</b> Tu firma legal donde más la necesitas.</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-3 border-t text-center">
                <p className="text-muted-foreground text-xs">Duración estimada: 1:00 a 1:30 minutos</p>
              </div>
            </div>
            
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => {}}
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">Ver guión completo</span>
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full text-sm gap-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Duración estimada: {videoType === "tutorial" ? "2:30" : (videoType === "verification" ? "2:15" : "2:00")} min
            </div>
            
            <a 
              href={videoScripts[videoType]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar guión
              </Button>
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};