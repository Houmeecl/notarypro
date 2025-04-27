import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <section id="faq" className="py-16 bg-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-secondary font-heading mb-4">Preguntas Frecuentes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Resolvemos tus dudas sobre nuestro servicio de firma electrónica y certificación digital.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Qué validez legal tienen los documentos firmados?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                Los documentos firmados con nuestra plataforma tienen plena validez legal conforme a la ley de firma electrónica vigente. 
                La firma electrónica avanzada tiene el mismo valor jurídico que una firma manuscrita, mientras que la firma simple tiene 
                validez en determinados tipos de documentos según la legislación aplicable.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Cómo se verifica la identidad del firmante?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                Para la firma electrónica avanzada, verificamos la identidad mediante un proceso que incluye la captura del documento de identidad, 
                una selfie y la comparación biométrica de ambas imágenes. Además, un certificador autorizado valida la identidad antes de permitir 
                la firma del documento, garantizando así la autenticidad del firmante.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Qué tipos de documentos puedo firmar?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                Puedes firmar prácticamente cualquier tipo de documento que requiera firma manuscrita: contratos, acuerdos, autorizaciones, 
                declaraciones juradas, poderes, convenios laborales, entre otros. La plataforma acepta documentos en formato PDF y Word, 
                que serán convertidos a PDF una vez firmados.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Qué es un certificador y cómo puedo convertirme en uno?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                Un certificador es un profesional autorizado para validar la identidad de los firmantes y certificar documentos con firma electrónica avanzada. 
                Para convertirte en certificador, debes completar nuestro curso de certificación, aprobar el examen final y cumplir con los requisitos legales establecidos. 
                Una vez certificado, tendrás acceso al dashboard de certificadores.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Cuánto tiempo se almacenan los documentos firmados?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                El tiempo de almacenamiento depende del plan contratado. En el plan básico, los documentos se guardan durante 30 días. 
                El plan profesional incluye almacenamiento por 1 año, y el plan empresarial ofrece almacenamiento ilimitado. 
                En cualquier caso, siempre recibirás el documento firmado por correo electrónico y podrás descargarlo durante el periodo de almacenamiento.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
