import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Download, FileText, BookOpen, FileJson } from "lucide-react";

export default function DocumentacionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Documentación Técnica</h1>
          <p className="text-gray-600 text-center mb-8">
            Acceda a la documentación técnica completa del sistema en diferentes formatos
          </p>

          <div className="grid gap-6">
            <Card className="border-2 border-indigo-600 shadow-lg">
              <CardHeader className="bg-indigo-50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Manual Completo y Código Fuente
                </CardTitle>
                <CardDescription>
                  Documentación completa con manual de NotaryPro, código fuente y detalles técnicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>NUEVO:</strong> Este documento incluye el manual completo de NotaryPro con todos sus enlaces, detalles del código fuente, interacción entre componentes y datos del desarrollador.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <a 
                  href="/docs/NotaryPro_Manual_Completo_y_Codigo_Fuente.md" 
                  download
                  className="w-full"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Manual Completo (Markdown)
                  </Button>
                </a>
                <p className="text-xs text-gray-500 text-center">
                  La documentación completa está disponible como archivo Markdown. 
                  Para convertirlo a PDF, puede usar cualquier conversor Markdown a PDF online o en su ordenador.
                </p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Documentación en la Web
                </CardTitle>
                <CardDescription>
                  Versión HTML para visualización directa en el navegador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Esta versión es ideal para consulta rápida y navegación interactiva.
                </p>
              </CardContent>
              <CardFooter>
                <a 
                  href="/documentacion-tecnica.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver documentación en el navegador
                  </Button>
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Documentación en Microsoft Word
                </CardTitle>
                <CardDescription>
                  Documento DOCX para edición y visualización en Microsoft Word
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Formato editable ideal para imprimir o realizar anotaciones.
                </p>
              </CardContent>
              <CardFooter>
                <a 
                  href="/docs/VecinosExpress_Manual_Tecnico.docx" 
                  download
                  className="w-full"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar documento Word
                  </Button>
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Documentación en PDF
                </CardTitle>
                <CardDescription>
                  Documento PDF para visualización universal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Formato ideal para compartir y visualizar en cualquier dispositivo.
                </p>
              </CardContent>
              <CardFooter>
                <a 
                  href="/docs/VecinosExpress_Manual_Tecnico.pdf" 
                  download
                  className="w-full"
                >
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar documento PDF
                  </Button>
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-purple-600" />
                  Documentación en Markdown
                </CardTitle>
                <CardDescription>
                  Archivo Markdown para desarrolladores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Formato ligero y editable, ideal para desarrolladores y control de versiones.
                </p>
              </CardContent>
              <CardFooter>
                <a 
                  href="/docs/VecinosExpress_Manual_Tecnico.md" 
                  download
                  className="w-full"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar archivo Markdown
                  </Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}