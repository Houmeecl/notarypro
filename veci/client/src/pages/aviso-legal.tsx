import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <a className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </a>
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-secondary mb-6">Aviso Legal</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              NotaryPro Chile ofrece servicios presenciales y virtuales de certificación de documentos electrónicos y firma digital, de conformidad con la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación de dicha firma, y su Reglamento. Nuestros servicios son prestados por profesionales debidamente acreditados, incluyendo certificadores autorizados para validar la identidad de los firmantes y certificar documentos con firma electrónica avanzada.
            </p>
            
            <p className="mb-4">
              La plataforma cumple con todas las disposiciones establecidas en la legislación chilena para la certificación de documentos electrónicos. Cualquier referencia en nuestra plataforma a términos como "notario digital", "notarización en línea" o expresiones similares se utiliza de forma estrictamente descriptiva y se refiere exclusivamente a nuestros servicios de certificación y validación de identidad legalmente reconocidos en Chile.
            </p>
            
            <p className="mb-4">
              De acuerdo con la Ley 19.799, la firma electrónica avanzada tiene la misma validez jurídica que una firma manuscrita, siempre que haya sido certificada por un prestador acreditado. NotaryPro Chile facilita este proceso de certificación mediante su plataforma, cumpliendo con todos los requisitos técnicos y legales establecidos en la normativa.
            </p>
            
            <p className="mb-4">
              NotaryPro Chile no es un estudio jurídico y no ofrece asesoramiento legal, representación legal ni opiniones legales. Si bien facilitamos servicios de certificación digital y firma electrónica, no ofrecemos asesoramiento legal sobre la validez, exigibilidad ni aceptación de documentos por parte de terceros.
            </p>
            
            <p className="mb-4">
              Si necesita asesoramiento legal sobre la ejecución, validez o uso de un documento, le recomendamos encarecidamente consultar con un abogado cualificado u otros profesionales del derecho. Además, antes de proceder con la certificación digital, la firma electrónica avanzada o la ejecución electrónica de documentos, es recomendable verificar la aceptación con los destinatarios previstos, como tribunales, organismos gubernamentales u otras instituciones.
            </p>
            
            <h2 className="text-xl font-semibold text-secondary mt-8 mb-4">Cumplimiento con la Ley 19.799</h2>
            
            <p className="mb-4">
              Nuestra plataforma cumple con los siguientes aspectos fundamentales de la Ley 19.799:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Proporciona mecanismos confiables para la firma electrónica simple y avanzada (Artículo 2° letras f y g).</li>
              <li className="mb-2">Garantiza la identificación inequívoca del firmante (Artículo 2° letra j).</li>
              <li className="mb-2">Mantiene la integridad del documento electrónico (Artículo 2° letra h).</li>
              <li className="mb-2">Asegura el no repudio del documento firmado (Artículo 3°).</li>
              <li className="mb-2">Permite la verificación de la firma electrónica avanzada por cualquier persona (Artículo 2° letra g).</li>
              <li className="mb-2">Mantiene registros de todas las operaciones realizadas (Artículo 11).</li>
            </ul>
            
            <p className="mb-4">
              Para conocer más sobre la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y Servicios de Certificación, puede visitar el sitio web de la <a href="https://www.bcn.cl/leychile/navegar?idNorma=196640" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Biblioteca del Congreso Nacional de Chile</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}