import { VideoCallInterface } from "@/components/certifier/VideoCallInterface";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function VideocallInterfaceDemo() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Link href="/certifier-dashboard" className="inline-flex items-center text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al panel
        </Link>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border mb-6">
          <div className="p-4 bg-primary/5 border-b">
            <h1 className="text-2xl font-bold">Demostración: Interfaz de Certificación por Video</h1>
            <p className="text-gray-600">
              Este es un ejemplo de la interfaz que utilizará como certificador para las sesiones de certificación online.
            </p>
          </div>
          
          <div className="h-[800px]">
            <VideoCallInterface />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Nota Importante</h2>
          <p className="text-yellow-700">
            Esta es una demostración interactiva del sistema. En las sesiones reales, la plataforma se integrará 
            con un sistema seguro de videollamadas con encriptación de extremo a extremo y cumplirá con todos los 
            requisitos legales de la Ley 19.799 sobre documentos electrónicos y firma electrónica.
          </p>
        </div>
      </div>
    </div>
  );
}