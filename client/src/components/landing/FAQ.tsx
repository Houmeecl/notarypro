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
                Los documentos firmados con nuestra plataforma tienen plena validez legal conforme a la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica en Chile. 
                La firma electrónica avanzada tiene el mismo valor jurídico que una firma manuscrita según el Artículo 3° de dicha ley, mientras que la firma electrónica simple 
                tiene validez en determinados tipos de documentos según lo establecido en el Artículo 5° de la misma legislación.
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
                Un certificador es un profesional autorizado para validar la identidad de los firmantes y certificar documentos con firma electrónica avanzada, conforme a lo establecido en la Ley 19.799 y su reglamento. 
                Para convertirte en certificador, debes completar nuestro curso de certificación acreditado, aprobar el examen final y cumplir con los requisitos establecidos por el Ministerio de Economía, Fomento y Turismo de Chile. 
                Una vez certificado, tendrás acceso al dashboard de certificadores y podrás validar documentos en conformidad con la normativa chilena.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Cómo cumple la plataforma con la Ley 19.799 de Chile?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                Nuestra plataforma cumple con todos los requisitos establecidos en la Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica en Chile, así como con su Reglamento.
                Esto incluye: 1) Proporcionar mecanismos confiables de firma electrónica simple y avanzada, 2) Mantener un sistema seguro de identificación y validación de los firmantes,
                3) Garantizar la integridad y no repudio de los documentos mediante certificación por terceros confiables, 4) Generar sellos de tiempo que aseguran la fecha y hora exacta 
                de la firma, y 5) Mantener un registro inmutable y auditable de todas las transacciones realizadas en la plataforma.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
              <AccordionTrigger className="p-4 text-left font-medium text-secondary hover:no-underline">
                ¿Cuánto tiempo se almacenan los documentos firmados?
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t border-gray-200 text-gray-600">
                El tiempo de almacenamiento depende del plan contratado. En el plan básico, los documentos se guardan durante 30 días. 
                El plan profesional incluye almacenamiento por 1 año, y el plan empresarial ofrece almacenamiento ilimitado. 
                En cualquier caso, siempre recibirás el documento firmado por correo electrónico y podrás descargarlo durante el periodo de almacenamiento, 
                cumpliendo con los plazos mínimos establecidos en la normativa chilena.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
