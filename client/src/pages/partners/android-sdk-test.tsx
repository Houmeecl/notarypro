import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Smartphone, QrCode, Copy, Check, ArrowRight, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

export default function AndroidSdkTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('installation');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Función para descargar el SDK
  const downloadSdk = async () => {
    try {
      const response = await fetch('/assets/vecinos-notarypro-sdk-dist.js');
      const text = await response.text();
      
      // Crear un blob con el contenido
      const blob = new Blob([text], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      // Crear un elemento <a> para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vecinos-notarypro-sdk.js';
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: 'SDK descargado',
        description: 'El archivo del SDK ha sido descargado correctamente.',
      });
    } catch (error) {
      console.error('Error al descargar SDK:', error);
      toast({
        title: 'Error al descargar',
        description: 'No se pudo descargar el SDK. Intente nuevamente más tarde.',
        variant: 'destructive'
      });
    }
  };

  // Copiar SDK al portapapeles
  const copySdk = async () => {
    try {
      // Obtener el SDK desde el archivo dist
      const response = await fetch('/assets/vecinos-notarypro-sdk-dist.js');
      const text = await response.text();
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      toast({
        title: 'SDK copiado',
        description: 'El código del SDK ha sido copiado al portapapeles.',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar SDK:', error);
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el SDK. Intente descargarlo en su lugar.',
        variant: 'destructive'
      });
    }
  };

  // Simular la instalación en el iframe
  const loadSdkInSandbox = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      
      if (!iframeDocument) {
        throw new Error('No se pudo acceder al documento del iframe');
      }
      
      // Limpiar iframe
      iframeDocument.open();
      iframeDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SDK Vecinos NotaryPro</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 16px;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
              font-size: 24px; 
              margin-top: 0;
              color: #111827;
            }
            h2 { 
              font-size: 18px; 
              margin-top: 24px;
              color: #111827;
            }
            .form-group {
              margin-bottom: 16px;
            }
            label {
              display: block;
              margin-bottom: 4px;
              font-weight: 500;
            }
            input, select, textarea {
              width: 100%;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 16px;
            }
            button {
              background-color: #EC1C24;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover {
              background-color: #d31920;
            }
            .status {
              padding: 16px;
              background-color: #f0f0f0;
              border-radius: 4px;
              margin-top: 24px;
            }
            .log-window {
              background-color: #2d2d2d;
              color: #f0f0f0;
              padding: 16px;
              border-radius: 4px;
              max-height: 200px;
              overflow-y: auto;
              font-family: monospace;
              margin-top: 24px;
            }
            .log-item {
              margin-bottom: 8px;
              line-height: 1.4;
            }
            .success { color: #10b981; }
            .error { color: #ef4444; }
            .info { color: #60a5fa; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Tablet Android SDK Test</h1>
            <p>Esta simulación muestra cómo funciona el SDK de Vecinos NotaryPro Express en una tablet Android.</p>
            
            <div class="status">
              <h2>Estado del SDK</h2>
              <div id="sdk-status">Esperando inicialización...</div>
            </div>
            
            <h2>Paso 1: Configurar punto de servicio</h2>
            <div class="form-group">
              <label for="store-id">ID de tienda:</label>
              <input type="text" id="store-id" value="12345" />
            </div>
            <div class="form-group">
              <label for="store-name">Nombre de tienda:</label>
              <input type="text" id="store-name" value="Almacén Don Pedro" />
            </div>
            <div class="form-group">
              <label for="store-address">Dirección:</label>
              <input type="text" id="store-address" value="Av. Principal 123, Santiago" />
            </div>
            <div class="form-group">
              <label for="store-api-key">API Key:</label>
              <input type="text" id="store-api-key" value="demo-api-key-123456" />
            </div>
            
            <button id="init-sdk">Inicializar SDK</button>
            
            <h2>Consola de log</h2>
            <div class="log-window" id="log-window">
              <div class="log-item">// Los mensajes del SDK aparecerán aquí</div>
            </div>
            
            <div id="sdk-form" style="display: none; margin-top: 24px;">
              <h2>Paso 2: Registrar cliente</h2>
              <div class="form-group">
                <label for="client-name">Nombre completo:</label>
                <input type="text" id="client-name" placeholder="Ej: Juan Pérez" />
              </div>
              <div class="form-group">
                <label for="client-rut">RUT:</label>
                <input type="text" id="client-rut" placeholder="Ej: 12.345.678-9" />
              </div>
              <div class="form-group">
                <label for="client-email">Email:</label>
                <input type="text" id="client-email" placeholder="Ej: juan@ejemplo.cl" />
              </div>
              <div class="form-group">
                <label for="client-phone">Teléfono:</label>
                <input type="text" id="client-phone" placeholder="Ej: +56912345678" />
              </div>
              
              <button id="register-client">Registrar cliente</button>
              
              <div id="document-form" style="display: none; margin-top: 24px;">
                <h2>Paso 3: Procesar documento</h2>
                <div class="form-group">
                  <label for="doc-type">Tipo de documento:</label>
                  <select id="doc-type">
                    <option value="declaracion_jurada">Declaración jurada</option>
                    <option value="poder">Poder simple</option>
                    <option value="contrato">Contrato</option>
                    <option value="certificado">Certificado</option>
                    <option value="finiquito">Finiquito</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="doc-title">Título:</label>
                  <input type="text" id="doc-title" placeholder="Ej: Declaración jurada de residencia" />
                </div>
                <div class="form-group">
                  <label for="doc-details">Detalles:</label>
                  <textarea id="doc-details" placeholder="Información adicional sobre el documento..."></textarea>
                </div>
                <div class="form-group">
                  <label for="doc-amount">Monto a cobrar (CLP):</label>
                  <input type="number" id="doc-amount" value="5000" />
                </div>
                <div class="form-group">
                  <label for="doc-payment">Método de pago:</label>
                  <select id="doc-payment">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                
                <button id="process-document">Procesar documento</button>
                
                <div id="receipt-form" style="display: none; margin-top: 24px;">
                  <h2>Paso 4: Generar recibo</h2>
                  <p>El documento ha sido procesado correctamente. Ahora puede generar un recibo para el cliente.</p>
                  <button id="generate-receipt">Generar recibo</button>
                  
                  <div id="receipt-view" style="display: none; margin-top: 24px;">
                    <h2>Recibo generado</h2>
                    <div style="border: 1px solid #ccc; padding: 16px; border-radius: 4px;">
                      <div style="text-align: center; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Vecinos NotaryPro Express</h3>
                        <p style="margin: 4px 0;">Almacén Don Pedro</p>
                        <p style="margin: 4px 0;">Av. Principal 123, Santiago</p>
                      </div>
                      
                      <h3 style="margin-top: 0;">RECIBO DE DOCUMENTO</h3>
                      <p><strong>Cliente:</strong> <span id="receipt-client-name"></span></p>
                      <p><strong>RUT:</strong> <span id="receipt-client-rut"></span></p>
                      <p><strong>Documento:</strong> <span id="receipt-doc-title"></span></p>
                      <p><strong>Tipo:</strong> <span id="receipt-doc-type"></span></p>
                      <p><strong>Fecha:</strong> <span id="receipt-date"></span></p>
                      <p><strong>Monto:</strong> $<span id="receipt-amount"></span></p>
                      <p><strong>Método de pago:</strong> <span id="receipt-payment"></span></p>
                      
                      <div style="text-align: center; margin-top: 24px; padding: 16px; border: 1px dashed #ccc;">
                        <p style="margin: 0;">Para verificar este documento, visite:</p>
                        <p style="font-weight: bold; margin: 8px 0;">cerfidoc.cl/verificar</p>
                        <p style="margin: 0;">Código: <span id="receipt-code">DOC-12345</span></p>
                      </div>
                      
                      <div style="text-align: center; margin-top: 24px;">
                        <p>¡Gracias por usar Vecinos NotaryPro Express!</p>
                      </div>
                    </div>
                    
                    <div style="margin-top: 16px; display: flex; gap: 8px;">
                      <button id="print-receipt">Imprimir recibo</button>
                      <button id="restart-process">Nuevo documento</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Simulación del SDK (no es el SDK real, solo para la demo)
            console.originalLog = console.log;
            console.log = function() {
              // Imprimir en la consola normal
              console.originalLog.apply(console, arguments);
              
              // También imprimir en nuestra consola simulada
              const logWindow = document.getElementById('log-window');
              const logItem = document.createElement('div');
              logItem.className = 'log-item';
              
              // Convertir argumentos a texto
              let message = Array.from(arguments).map(arg => {
                if (typeof arg === 'object') {
                  return JSON.stringify(arg);
                }
                return arg;
              }).join(' ');
              
              // Colorear basado en el contenido
              if (message.includes('✅') || message.includes('✓')) {
                logItem.classList.add('success');
              } else if (message.includes('⚠️') || message.includes('Error')) {
                logItem.classList.add('error');
              } else if (message.includes('🔄') || message.includes('ℹ️')) {
                logItem.classList.add('info');
              }
              
              logItem.textContent = message;
              logWindow.appendChild(logItem);
              logWindow.scrollTop = logWindow.scrollHeight;
            };
            
            // Simulación básica de la clase VecinosPOS
            class VecinosPOS {
              constructor(config) {
                // Verificar configuración mínima
                if (!config.id || !config.nombre || !config.apiKey) {
                  console.log('⚠️ Error: Configuración incompleta. Verifique que tenga id, nombre y apiKey.');
                  document.getElementById('sdk-status').textContent = 'Error: Configuración incompleta';
                  document.getElementById('sdk-status').style.color = '#ef4444';
                  return;
                }
                
                this.config = config;
                this.apiUrl = "https://api.cerfidoc.cl";
                this.modoOffline = false;
                
                console.log('✅ Punto de servicio configurado: ' + config.nombre);
                document.getElementById('sdk-status').textContent = 'SDK inicializado correctamente';
                document.getElementById('sdk-status').style.color = '#10b981';
                
                // Mostrar el formulario de cliente
                document.getElementById('sdk-form').style.display = 'block';
                
                // Para propósitos de la demo
                this.clienteRegistrado = null;
                this.documentoProcesado = null;
                
                // Simular verificación de conexión
                setTimeout(() => {
                  console.log('🌐 Conexión a internet disponible');
                }, 500);
              }
              
              async registrarCliente(cliente) {
                console.log('👤 Registrando cliente:', cliente.nombre);
                
                // Validar datos
                if (!cliente.nombre || !cliente.rut || !cliente.email) {
                  console.log('⚠️ Error: Datos de cliente incompletos. Nombre, RUT y email son obligatorios.');
                  throw new Error('Datos de cliente incompletos');
                }
                
                return new Promise((resolve) => {
                  // Simular tiempo de procesamiento
                  setTimeout(() => {
                    const resultado = {
                      id: 12345,
                      cliente: cliente
                    };
                    this.clienteRegistrado = resultado;
                    console.log('✓ Cliente registrado correctamente');
                    resolve(resultado);
                    
                    // Mostrar el formulario de documento
                    document.getElementById('document-form').style.display = 'block';
                  }, 1000);
                });
              }
              
              async procesarDocumento(clienteId, documento) {
                console.log('📄 Procesando documento:', documento.titulo);
                
                // Validar datos
                if (!clienteId || !documento.tipo || !documento.titulo || !documento.monto || !documento.metodoPago) {
                  console.log('⚠️ Error: Datos de documento incompletos.');
                  throw new Error('Datos de documento incompletos');
                }
                
                return new Promise((resolve) => {
                  // Simular tiempo de procesamiento
                  setTimeout(() => {
                    const resultado = {
                      documentoId: 98765,
                      estado: 'recibido'
                    };
                    this.documentoProcesado = {
                      ...resultado,
                      documento: documento
                    };
                    console.log('✓ Documento procesado correctamente');
                    resolve(resultado);
                    
                    // Mostrar el formulario de recibo
                    document.getElementById('receipt-form').style.display = 'block';
                  }, 1500);
                });
              }
              
              async imprimirRecibo(documentoId, cliente, documento) {
                console.log('🖨️ Generando recibo para documento:', documentoId);
                
                return new Promise((resolve) => {
                  // Simular tiempo de procesamiento
                  setTimeout(() => {
                    console.log('✓ Recibo generado correctamente');
                    
                    // Rellenar datos del recibo
                    document.getElementById('receipt-client-name').textContent = cliente.nombre;
                    document.getElementById('receipt-client-rut').textContent = cliente.rut;
                    document.getElementById('receipt-doc-title').textContent = documento.titulo;
                    document.getElementById('receipt-doc-type').textContent = this.getTipoDocumentoTexto(documento.tipo);
                    document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('es-CL');
                    document.getElementById('receipt-amount').textContent = documento.monto;
                    document.getElementById('receipt-payment').textContent = this.getMetodoPagoTexto(documento.metodoPago);
                    document.getElementById('receipt-code').textContent = 'DOC-' + documentoId;
                    
                    // Mostrar el recibo
                    document.getElementById('receipt-view').style.display = 'block';
                    
                    resolve({
                      reciboUrl: 'https://cerfidoc.cl/recibos/' + documentoId,
                      codigoQR: 'https://cerfidoc.cl/qr/' + documentoId
                    });
                  }, 1000);
                });
              }
              
              getTipoDocumentoTexto(tipo) {
                const tipos = {
                  'declaracion_jurada': 'Declaración jurada',
                  'poder': 'Poder simple',
                  'contrato': 'Contrato',
                  'certificado': 'Certificado',
                  'finiquito': 'Finiquito'
                };
                return tipos[tipo] || tipo;
              }
              
              getMetodoPagoTexto(metodo) {
                const metodos = {
                  'efectivo': 'Efectivo',
                  'tarjeta': 'Tarjeta',
                  'transferencia': 'Transferencia bancaria'
                };
                return metodos[metodo] || metodo;
              }
            }
            
            // Constantes requeridas por el SDK
            const TIPO_DOCUMENTO = {
              PODER: 'poder',
              DECLARACION_JURADA: 'declaracion_jurada',
              CONTRATO: 'contrato', 
              CERTIFICADO: 'certificado',
              FINIQUITO: 'finiquito',
              OTRO: 'otro'
            };
            
            const METODO_PAGO = {
              EFECTIVO: 'efectivo',
              TARJETA: 'tarjeta',
              TRANSFERENCIA: 'transferencia'
            };
            
            // Variables globales
            let pos = null;
            
            // Evento: Inicializar SDK
            document.getElementById('init-sdk').addEventListener('click', function() {
              const id = parseInt(document.getElementById('store-id').value);
              const nombre = document.getElementById('store-name').value;
              const direccion = document.getElementById('store-address').value;
              const apiKey = document.getElementById('store-api-key').value;
              
              // Inicializar SDK
              pos = new VecinosPOS({
                id: id,
                nombre: nombre,
                direccion: direccion,
                region: 'Metropolitana',
                comuna: 'Santiago',
                apiKey: apiKey
              });
            });
            
            // Evento: Registrar cliente
            document.getElementById('register-client').addEventListener('click', async function() {
              if (!pos) {
                console.log('⚠️ Error: SDK no inicializado');
                return;
              }
              
              const nombre = document.getElementById('client-name').value;
              const rut = document.getElementById('client-rut').value;
              const email = document.getElementById('client-email').value;
              const telefono = document.getElementById('client-phone').value;
              
              try {
                await pos.registrarCliente({
                  nombre: nombre,
                  rut: rut,
                  email: email,
                  telefono: telefono
                });
              } catch (error) {
                console.log('⚠️ Error: ' + error.message);
              }
            });
            
            // Evento: Procesar documento
            document.getElementById('process-document').addEventListener('click', async function() {
              if (!pos || !pos.clienteRegistrado) {
                console.log('⚠️ Error: Cliente no registrado');
                return;
              }
              
              const tipo = document.getElementById('doc-type').value;
              const titulo = document.getElementById('doc-title').value;
              const detalle = document.getElementById('doc-details').value;
              const monto = parseInt(document.getElementById('doc-amount').value);
              const metodoPago = document.getElementById('doc-payment').value;
              
              try {
                await pos.procesarDocumento(pos.clienteRegistrado.id, {
                  tipo: tipo,
                  titulo: titulo,
                  detalle: detalle,
                  monto: monto,
                  metodoPago: metodoPago
                });
              } catch (error) {
                console.log('⚠️ Error: ' + error.message);
              }
            });
            
            // Evento: Generar recibo
            document.getElementById('generate-receipt').addEventListener('click', async function() {
              if (!pos || !pos.clienteRegistrado || !pos.documentoProcesado) {
                console.log('⚠️ Error: No hay documento procesado');
                return;
              }
              
              try {
                await pos.imprimirRecibo(
                  pos.documentoProcesado.documentoId,
                  pos.clienteRegistrado.cliente,
                  pos.documentoProcesado.documento
                );
              } catch (error) {
                console.log('⚠️ Error: ' + error.message);
              }
            });
            
            // Evento: Imprimir recibo (solo simula la acción)
            document.getElementById('print-receipt').addEventListener('click', function() {
              console.log('🖨️ Enviando recibo a la impresora...');
              setTimeout(() => {
                console.log('✓ Recibo impreso correctamente');
              }, 1000);
            });
            
            // Evento: Reiniciar proceso
            document.getElementById('restart-process').addEventListener('click', function() {
              // Reiniciar formularios
              document.getElementById('client-name').value = '';
              document.getElementById('client-rut').value = '';
              document.getElementById('client-email').value = '';
              document.getElementById('client-phone').value = '';
              document.getElementById('doc-title').value = '';
              document.getElementById('doc-details').value = '';
              document.getElementById('doc-amount').value = '5000';
              
              // Ocultar secciones
              document.getElementById('document-form').style.display = 'none';
              document.getElementById('receipt-form').style.display = 'none';
              document.getElementById('receipt-view').style.display = 'none';
              
              // Reiniciar estado
              if (pos) {
                pos.clienteRegistrado = null;
                pos.documentoProcesado = null;
                console.log('🔄 Proceso reiniciado');
              }
            });
            
            // Mensaje inicial
            console.log('📱 Simulador de tablet Android iniciado');
            console.log('ℹ️ Configure el punto de servicio y haga clic en "Inicializar SDK"');
          </script>
        </body>
        </html>
      `);
      iframeDocument.close();
      
      toast({
        title: 'Simulador iniciado',
        description: 'El simulador de tablet Android está listo para usar.'
      });
    } catch (error) {
      console.error('Error al cargar simulador:', error);
      toast({
        title: 'Error al cargar simulador',
        description: 'No se pudo iniciar el simulador de tablet. Intente nuevamente.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'simulator') {
      loadSdkInSandbox();
    }
  }, [activeTab]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">SDK para Tablets Android</h1>
      <p className="text-gray-600 mb-8">Pruebe y descargue el SDK para integrar en su tablet Android del programa Vecinos NotaryPro Express</p>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="installation">Instalación</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="download">Descargar</TabsTrigger>
          <TabsTrigger value="documentation">Documentación</TabsTrigger>
        </TabsList>
        
        {/* TAB: INSTALACIÓN */}
        <TabsContent value="installation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Guía de instalación</CardTitle>
                  <CardDescription>
                    Siga estos pasos para instalar el SDK en su tablet Android
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Requisitos mínimos</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Smartphone className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Tablet Android 5.0 o superior</p>
                          <p className="text-sm text-gray-600">
                            Recomendamos tablets con al menos 2GB de RAM para un rendimiento óptimo.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Navegador web compatible con JavaScript</p>
                          <p className="text-sm text-gray-600">
                            Chrome, Firefox o el navegador nativo de la tablet.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Cuenta activa en el programa Vecinos NotaryPro</p>
                          <p className="text-sm text-gray-600">
                            Necesitará su ID de socio y clave API para la configuración.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Instalación para desarrolladores</h3>
                    <ol className="space-y-6 list-decimal pl-6">
                      <li>
                        <div>
                          <p className="font-medium">Descargue el archivo SDK</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Obtenga el archivo <code className="px-1 py-0.5 bg-gray-100 rounded">vecinos-notarypro-sdk.js</code> desde la pestaña "Descargar".
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setActiveTab('download')}
                            className="text-sm"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Ir a descargas
                          </Button>
                        </div>
                      </li>
                      <li>
                        <div>
                          <p className="font-medium">Incluya el archivo en su proyecto Android</p>
                          <p className="text-sm text-gray-600">
                            Añada el SDK a la carpeta <code className="px-1 py-0.5 bg-gray-100 rounded">assets/js/</code> de su proyecto Android.
                          </p>
                          <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm border">
                            <p className="font-mono text-xs">
                              // Ejemplo de cómo cargar el SDK en un WebView (Java)<br />
                              WebView webView = findViewById(R.id.webView);<br />
                              webView.getSettings().setJavaScriptEnabled(true);<br />
                              webView.loadUrl("file:///android_asset/js/vecinos-notarypro-sdk.js");
                            </p>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div>
                          <p className="font-medium">Inicialice el SDK</p>
                          <p className="text-sm text-gray-600">
                            Configure el SDK con los datos de su punto de servicio.
                          </p>
                          <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm border">
                            <p className="font-mono text-xs">
                              // Ejemplo de inicialización del SDK (JavaScript)<br />
                              const pos = new VecinosPOS({'{'}<br />
                              &nbsp;&nbsp;id: 123, // ID asignado a su tienda<br />
                              &nbsp;&nbsp;nombre: "Minimarket Don Pedro",<br />
                              &nbsp;&nbsp;direccion: "Calle Principal 123",<br />
                              &nbsp;&nbsp;region: "Metropolitana",<br />
                              &nbsp;&nbsp;comuna: "Santiago",<br />
                              &nbsp;&nbsp;apiKey: "su-clave-secreta-aqui"<br />
                              {'}'});
                            </p>
                          </div>
                        </div>
                      </li>
                    </ol>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-4">
                  <div className="bg-primary/10 p-4 rounded-md w-full">
                    <h3 className="font-medium mb-2">Opción para usuarios no técnicos</h3>
                    <p className="text-sm mb-3">
                      Si prefiere no hacer la instalación técnica, puede usar nuestra aplicación oficial:
                    </p>
                    <Button variant="default">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Descargar app "Vecinos POS" de Google Play
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Equipo e instalación</CardTitle>
                  <CardDescription>Contenido del kit para socios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-md bg-gray-100 flex items-center justify-center">
                    <img 
                      src="/assets/tablet-example.jpg" 
                      alt="Tablet con SDK instalado" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x250?text=Tablet+SDK";
                      }}
                    />
                  </div>
                  
                  <h3 className="font-medium">El kit incluye:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Tablet Android preconfigurada</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>App Vecinos POS con SDK instalado</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Impresora térmica Bluetooth</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Material publicitario para el punto</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Capacitación para uso del sistema</span>
                    </li>
                  </ul>
                  
                  <div className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-200 mt-4">
                    <p className="text-yellow-800">
                      <strong>Nota:</strong> La descarga del SDK es sólo para partners que desean desarrollar su propia aplicación. Si usted es un punto de servicio normal, recibirá el equipo ya configurado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* TAB: SIMULADOR */}
        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Tablet Android</CardTitle>
              <CardDescription>
                Pruebe cómo funciona el SDK en una tablet Android sin necesidad de instalar nada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm">
                  Este simulador muestra el funcionamiento básico del SDK para procesamiento de documentos.
                  Siga los pasos que se muestran en la interfaz: inicializar el SDK, registrar un cliente,
                  procesar un documento y generar un recibo.
                </p>
              </div>
              
              <div className="border rounded-md overflow-hidden" style={{ height: '600px' }}>
                <iframe 
                  ref={iframeRef}
                  title="Simulador de Tablet Android"
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: DESCARGAR */}
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Descargar SDK</CardTitle>
              <CardDescription>
                Obtenga el SDK para implementarlo en su punto de servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-md border">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">SDK Vecinos NotaryPro Express v1.0</h3>
                    <p className="text-gray-600 mb-4">
                      Archivo JavaScript con todas las funciones necesarias para operar
                      un punto de servicio NotaryPro. Compatible con Android 5.0+.
                    </p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Tamaño: 27KB - Optimizado para carga rápida</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Sin dependencias externas - Funciona independientemente</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Modo offline incluido - Funciona incluso sin conexión</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Documentación en español incluida en el archivo</span>
                      </li>
                    </ul>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={downloadSdk}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar SDK
                      </Button>
                      <Button variant="outline" onClick={copySdk}>
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar código
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="md:w-1/4 flex justify-center">
                    <FileText className="h-32 w-32 text-primary/20" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Guía de instalación rápida</h3>
                
                <ol className="space-y-4 list-decimal pl-6">
                  <li>
                    <p className="font-medium">Descargar SDK</p>
                    <p className="text-sm text-gray-600">
                      Descargue el archivo <code>vecinos-notarypro-sdk.js</code> usando el botón de arriba.
                    </p>
                  </li>
                  <li>
                    <p className="font-medium">Crear proyecto Android (para desarrolladores)</p>
                    <p className="text-sm text-gray-600">
                      Si está creando una aplicación personalizada, añada el archivo a su proyecto
                      Android en la carpeta <code>assets/js/</code>.
                    </p>
                  </li>
                  <li>
                    <p className="font-medium">Para usuarios no técnicos</p>
                    <p className="text-sm text-gray-600">
                      Utilice nuestra app "Vecinos POS" disponible en Google Play Store que ya
                      incluye el SDK integrado.
                    </p>
                  </li>
                </ol>
              </div>
              
              <div className="rounded-md border p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Soporte técnico</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Si necesita ayuda con la instalación o uso del SDK, contacte a nuestro equipo de soporte:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Email de soporte</p>
                    <p>soporte@cerfidoc.cl</p>
                  </div>
                  <div>
                    <p className="font-medium">Teléfono de soporte</p>
                    <p>+56 2 2123 4567</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* TAB: DOCUMENTACIÓN */}
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentación técnica</CardTitle>
              <CardDescription>
                Guía completa del SDK para puntos de servicio Vecinos NotaryPro Express
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="prose">
                  <h3>Introducción</h3>
                  <p>
                    El SDK de Vecinos NotaryPro Express es una herramienta diseñada para permitir a los puntos
                    de servicio procesar documentos legales de forma rápida y sencilla. El SDK está optimizado
                    para funcionar en tablets Android y permite operar incluso sin conexión a internet.
                  </p>
                  
                  <h3>Configuración inicial</h3>
                  <p>
                    Para comenzar a utilizar el SDK, primero debe inicializar una instancia de la clase
                    <code>VecinosPOS</code> con la configuración de su punto de servicio:
                  </p>
                  
                  <pre className="bg-gray-50 p-3 rounded-md text-sm border overflow-auto">
                    {`const pos = new VecinosPOS({
  id: 123,                           // ID asignado a su tienda
  nombre: "Minimarket Don Pedro",    // Nombre de su tienda
  direccion: "Calle Principal 123",  // Dirección física
  region: "Metropolitana",           // Región
  comuna: "Santiago",                // Comuna
  apiKey: "su-clave-secreta-aqui"    // Clave proporcionada por NotaryPro
});`}
                  </pre>
                  
                  <h3>Flujo de trabajo</h3>
                  <p>
                    El SDK está diseñado para un flujo de trabajo de 3 pasos:
                  </p>
                  
                  <h4>1. Registrar cliente</h4>
                  <p>
                    El primer paso es registrar los datos del cliente o buscar un cliente existente por su RUT:
                  </p>
                  
                  <pre className="bg-gray-50 p-3 rounded-md text-sm border overflow-auto">
                    {`const resultado = await pos.registrarCliente({
  nombre: "María González",
  rut: "12.345.678-9",
  email: "maria@ejemplo.cl",
  telefono: "912345678"  // opcional
});

// Guardar el ID del cliente para el siguiente paso
const clienteId = resultado.id;`}
                  </pre>
                  
                  <h4>2. Procesar documento</h4>
                  <p>
                    Con el cliente registrado, puede procesar un documento:
                  </p>
                  
                  <pre className="bg-gray-50 p-3 rounded-md text-sm border overflow-auto">
                    {`const resultado = await pos.procesarDocumento(clienteId, {
  tipo: TIPO_DOCUMENTO.DECLARACION_JURADA,
  titulo: "Declaración jurada de residencia",
  detalle: "Para trámite municipal",  // opcional
  monto: 5000,  // precio en pesos chilenos
  metodoPago: METODO_PAGO.EFECTIVO
});

// Guardar el ID del documento para el siguiente paso
const documentoId = resultado.documentoId;`}
                  </pre>
                  
                  <h4>3. Imprimir recibo</h4>
                  <p>
                    Finalmente, genere e imprima un recibo para el cliente:
                  </p>
                  
                  <pre className="bg-gray-50 p-3 rounded-md text-sm border overflow-auto">
                    {`const reciboInfo = await pos.imprimirRecibo(
  documentoId,
  cliente,    // objeto con los datos del cliente
  documento   // objeto con los datos del documento
);

// Acceder a la URL del recibo
const reciboUrl = reciboInfo.reciboUrl;
const codigoQR = reciboInfo.codigoQR;`}
                  </pre>
                  
                  <h3>Modo offline</h3>
                  <p>
                    El SDK detecta automáticamente si hay conexión a internet. Si no hay conexión,
                    guarda todas las operaciones localmente y las sincroniza cuando se restablece la conexión.
                  </p>
                  
                  <h3>Constantes</h3>
                  <p>
                    Para garantizar la consistencia de los datos, utilice siempre las constantes
                    proporcionadas por el SDK:
                  </p>
                  
                  <h4>Tipos de documentos</h4>
                  <ul>
                    <li><code>TIPO_DOCUMENTO.PODER</code></li>
                    <li><code>TIPO_DOCUMENTO.DECLARACION_JURADA</code></li>
                    <li><code>TIPO_DOCUMENTO.CONTRATO</code></li>
                    <li><code>TIPO_DOCUMENTO.CERTIFICADO</code></li>
                    <li><code>TIPO_DOCUMENTO.FINIQUITO</code></li>
                    <li><code>TIPO_DOCUMENTO.OTRO</code></li>
                  </ul>
                  
                  <h4>Métodos de pago</h4>
                  <ul>
                    <li><code>METODO_PAGO.EFECTIVO</code></li>
                    <li><code>METODO_PAGO.TARJETA</code></li>
                    <li><code>METODO_PAGO.TRANSFERENCIA</code></li>
                  </ul>
                  
                  <h4>Estados de documentos</h4>
                  <ul>
                    <li><code>ESTADO_DOCUMENTO.RECIBIDO</code></li>
                    <li><code>ESTADO_DOCUMENTO.EN_PROCESO</code></li>
                    <li><code>ESTADO_DOCUMENTO.COMPLETADO</code></li>
                    <li><code>ESTADO_DOCUMENTO.RECHAZADO</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/partners/sdk-demo">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Volver al demo del SDK
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/admin-dashboard">
            <ArrowRight className="h-4 w-4 ml-2" />
            Ir al Panel de Administración
          </Link>
        </Button>
      </div>
    </div>
  );
}