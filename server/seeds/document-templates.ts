import { storage } from "../storage";

const CONTRATOS_COMERCIALES_ID = 1;
const DOCUMENTOS_CORPORATIVOS_ID = 2;
const BIENES_RAICES_ID = 3;
const DOCUMENTOS_FINANCIEROS_ID = 4;

export async function seedDocumentTemplates() {
  console.log("Verificando plantillas de documentos existentes...");
  
  // Obtener plantillas existentes
  const templates = await storage.getAllDocumentTemplates();
  if (templates.length > 0) {
    console.log(`Se encontraron ${templates.length} plantillas existentes.`);
  }
  
  // Plantillas para Contratos Comerciales (solo agregar si no existe una con el mismo nombre)
  const templateNames = templates.map(t => t.name);
  
  // CONTRATOS COMERCIALES
  if (!templateNames.includes("Contrato de Compraventa")) {
    await storage.createDocumentTemplate({
      categoryId: CONTRATOS_COMERCIALES_ID,
      name: "Contrato de Compraventa",
      description: "Acuerdo legal para la compra y venta de bienes o servicios",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato de Compraventa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
        .parties { display: flex; justify-content: space-between; }
        .party { width: 45%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>CONTRATO DE COMPRAVENTA</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, entre:</p>
            
            <div class="parties">
                <div class="party">
                    <h2>VENDEDOR</h2>
                    <p><strong>Nombre:</strong> {{nombreVendedor}}</p>
                    <p><strong>RUT:</strong> {{rutVendedor}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioVendedor}}</p>
                </div>
                
                <div class="party">
                    <h2>COMPRADOR</h2>
                    <p><strong>Nombre:</strong> {{nombreComprador}}</p>
                    <p><strong>RUT:</strong> {{rutComprador}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioComprador}}</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>PRIMERO: OBJETO DEL CONTRATO</h2>
            <p>Por el presente instrumento, el VENDEDOR vende, cede y transfiere al COMPRADOR, quien compra, acepta y adquiere para sí el siguiente bien: {{descripcionBien}}, en adelante "el Bien".</p>
        </div>
        
        <div class="section">
            <h2>SEGUNDO: PRECIO Y FORMA DE PAGO</h2>
            <p>El precio de la compraventa es la suma de $\{{precio\}} (\{{precioPalabras\}}), que el COMPRADOR pagará al VENDEDOR de la siguiente forma: {{formaPago}}.</p>
        </div>
        
        <div class="section">
            <h2>TERCERO: ENTREGA</h2>
            <p>El VENDEDOR entregará el Bien al COMPRADOR en la siguiente fecha: {{fechaEntrega}} en la siguiente dirección: {{lugarEntrega}}.</p>
        </div>
        
        <div class="section">
            <h2>CUARTO: ESTADO DEL BIEN</h2>
            <p>El COMPRADOR declara conocer el estado actual del Bien, y lo acepta en las condiciones en que se encuentra.</p>
        </div>
        
        <div class="section">
            <h2>QUINTO: GARANTÍA</h2>
            <p>El VENDEDOR garantiza que el Bien se encuentra libre de gravámenes, prohibiciones y embargos, y que no tiene vicios ocultos.</p>
        </div>
        
        <div class="section">
            <h2>SEXTO: DOMICILIO Y JURISDICCIÓN</h2>
            <p>Para todos los efectos legales del presente contrato, las partes fijan domicilio en la ciudad de {{ciudad}} y se someten a la jurisdicción de sus tribunales de justicia.</p>
        </div>
        
        <div class="signature-line">
            <div class="parties">
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreVendedor}}</p>
                    <p>VENDEDOR</p>
                </div>
                
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreComprador}}</p>
                    <p>COMPRADOR</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      price: 6000,
      formSchema: {
        type: "object",
        required: [
          "nombreVendedor", 
          "rutVendedor", 
          "domicilioVendedor", 
          "nombreComprador", 
          "rutComprador", 
          "domicilioComprador", 
          "descripcionBien", 
          "precio", 
          "precioPalabras", 
          "formaPago", 
          "fechaEntrega", 
          "lugarEntrega", 
          "ciudad"
        ],
        properties: {
          nombreVendedor: {
            type: "string",
            title: "Nombre del Vendedor"
          },
          rutVendedor: {
            type: "string",
            title: "RUT del Vendedor"
          },
          domicilioVendedor: {
            type: "string",
            title: "Domicilio del Vendedor"
          },
          nombreComprador: {
            type: "string",
            title: "Nombre del Comprador"
          },
          rutComprador: {
            type: "string",
            title: "RUT del Comprador"
          },
          domicilioComprador: {
            type: "string",
            title: "Domicilio del Comprador"
          },
          descripcionBien: {
            type: "string",
            title: "Descripción del Bien",
            maxLength: 500
          },
          precio: {
            type: "number",
            title: "Precio (en números)"
          },
          precioPalabras: {
            type: "string",
            title: "Precio (en palabras)"
          },
          formaPago: {
            type: "string",
            title: "Forma de Pago",
            maxLength: 300
          },
          fechaEntrega: {
            type: "string",
            title: "Fecha de Entrega",
            format: "date"
          },
          lugarEntrega: {
            type: "string",
            title: "Lugar de Entrega"
          },
          ciudad: {
            type: "string",
            title: "Ciudad donde se firma"
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Contrato de Compraventa' creada");
  }

  if (!templateNames.includes("Contrato de Confidencialidad")) {
    await storage.createDocumentTemplate({
      categoryId: CONTRATOS_COMERCIALES_ID,
      name: "Contrato de Confidencialidad",
      description: "Acuerdo para proteger información confidencial entre partes",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato de Confidencialidad</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
        .parties { display: flex; justify-content: space-between; }
        .party { width: 45%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ACUERDO DE CONFIDENCIALIDAD</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, entre:</p>
            
            <div class="parties">
                <div class="party">
                    <h2>PARTE DIVULGANTE</h2>
                    <p><strong>Nombre/Razón Social:</strong> {{nombreDivulgante}}</p>
                    <p><strong>RUT:</strong> {{rutDivulgante}}</p>
                    <p><strong>Representante:</strong> {{representanteDivulgante}}</p>
                </div>
                
                <div class="party">
                    <h2>PARTE RECEPTORA</h2>
                    <p><strong>Nombre/Razón Social:</strong> {{nombreReceptor}}</p>
                    <p><strong>RUT:</strong> {{rutReceptor}}</p>
                    <p><strong>Representante:</strong> {{representanteReceptor}}</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>PRIMERO: OBJETO DEL ACUERDO</h2>
            <p>El presente acuerdo tiene por objeto establecer los términos y condiciones bajo los cuales la Parte Receptora tratará la información confidencial que le sea proporcionada por la Parte Divulgante en el contexto de {{contextoRelacion}}.</p>
        </div>
        
        <div class="section">
            <h2>SEGUNDO: DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL</h2>
            <p>Para efectos de este acuerdo, se entenderá por "Información Confidencial" toda aquella información que, independientemente del medio en que se encuentre contenida, sea proporcionada por la Parte Divulgante a la Parte Receptora, incluyendo pero no limitándose a: {{tipoInformacion}}.</p>
        </div>
        
        <div class="section">
            <h2>TERCERO: OBLIGACIONES DE LA PARTE RECEPTORA</h2>
            <p>La Parte Receptora se obliga a:</p>
            <ol>
                <li>Mantener la confidencialidad de la Información Confidencial y no revelarla a terceros.</li>
                <li>Utilizar la Información Confidencial únicamente para los fines relacionados con {{propositoUso}}.</li>
                <li>Limitar el acceso a la Información Confidencial exclusivamente a aquellos empleados, agentes o representantes que necesiten conocerla para dichos fines.</li>
                <li>Proteger la Información Confidencial con el mismo grado de cuidado que utiliza para proteger su propia información confidencial.</li>
            </ol>
        </div>
        
        <div class="section">
            <h2>CUARTO: EXCEPCIONES</h2>
            <p>Las obligaciones establecidas en este acuerdo no se aplicarán a información que:</p>
            <ol>
                <li>Sea o se convierta en información de dominio público sin culpa de la Parte Receptora.</li>
                <li>Estuviera legítimamente en posesión de la Parte Receptora antes de ser revelada por la Parte Divulgante.</li>
                <li>Sea desarrollada independientemente por la Parte Receptora sin utilizar Información Confidencial.</li>
                <li>Deba ser revelada por mandato legal o judicial.</li>
            </ol>
        </div>
        
        <div class="section">
            <h2>QUINTO: VIGENCIA</h2>
            <p>Este acuerdo tendrá una vigencia de {{duracion}} a partir de la fecha de su firma. Las obligaciones de confidencialidad subsistirán por un período de {{periodoPostTermino}} después de terminado el acuerdo.</p>
        </div>
        
        <div class="section">
            <h2>SEXTO: JURISDICCIÓN</h2>
            <p>Para todos los efectos legales del presente contrato, las partes fijan domicilio en la ciudad de {{ciudad}} y se someten a la jurisdicción de sus tribunales de justicia.</p>
        </div>
        
        <div class="signature-line">
            <div class="parties">
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreDivulgante}}</p>
                    <p>PARTE DIVULGANTE</p>
                </div>
                
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreReceptor}}</p>
                    <p>PARTE RECEPTORA</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      price: 5500,
      formSchema: {
        type: "object",
        required: [
          "nombreDivulgante", 
          "rutDivulgante", 
          "representanteDivulgante", 
          "nombreReceptor", 
          "rutReceptor", 
          "representanteReceptor", 
          "contextoRelacion", 
          "tipoInformacion", 
          "propositoUso", 
          "duracion", 
          "periodoPostTermino", 
          "ciudad"
        ],
        properties: {
          nombreDivulgante: {
            type: "string",
            title: "Nombre/Razón Social Divulgante"
          },
          rutDivulgante: {
            type: "string",
            title: "RUT Divulgante"
          },
          representanteDivulgante: {
            type: "string",
            title: "Representante Divulgante"
          },
          nombreReceptor: {
            type: "string",
            title: "Nombre/Razón Social Receptor"
          },
          rutReceptor: {
            type: "string",
            title: "RUT Receptor"
          },
          representanteReceptor: {
            type: "string",
            title: "Representante Receptor"
          },
          contextoRelacion: {
            type: "string",
            title: "Contexto de la Relación",
            maxLength: 300
          },
          tipoInformacion: {
            type: "string",
            title: "Tipo de Información Confidencial",
            maxLength: 300
          },
          propositoUso: {
            type: "string",
            title: "Propósito de Uso",
            maxLength: 300
          },
          duracion: {
            type: "string",
            title: "Duración del Acuerdo"
          },
          periodoPostTermino: {
            type: "string",
            title: "Periodo Post-Término"
          },
          ciudad: {
            type: "string",
            title: "Ciudad donde se firma"
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Contrato de Confidencialidad' creada");
  }

  // DOCUMENTOS CORPORATIVOS
  if (!templateNames.includes("Acta de Constitución de Sociedad")) {
    await storage.createDocumentTemplate({
      categoryId: DOCUMENTOS_CORPORATIVOS_ID,
      name: "Acta de Constitución de Sociedad",
      description: "Documento formal para la creación legal de una sociedad",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Acta de Constitución de Sociedad</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
        .signatures { display: flex; flex-wrap: wrap; justify-content: space-between; }
        .signature { width: 45%; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ACTA DE CONSTITUCIÓN DE SOCIEDAD</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, comparecen:</p>
            <p>{{comparecientes}}</p>
            <p>Todos mayores de edad, quienes acuerdan constituir una sociedad de conformidad con las siguientes cláusulas:</p>
        </div>
        
        <div class="section">
            <h2>PRIMERO: NOMBRE Y TIPO DE SOCIEDAD</h2>
            <p>Se constituye una sociedad de responsabilidad {{tipoSociedad}} bajo el nombre "{{nombreSociedad}}", que se regirá por las disposiciones del presente contrato y, en lo no previsto en él, por las disposiciones legales pertinentes.</p>
        </div>
        
        <div class="section">
            <h2>SEGUNDO: DOMICILIO</h2>
            <p>El domicilio de la sociedad será en la ciudad de {{domicilioSociedad}}, sin perjuicio de que pueda establecer sucursales, agencias o establecimientos en otras ciudades del país o en el extranjero.</p>
        </div>
        
        <div class="section">
            <h2>TERCERO: OBJETO SOCIAL</h2>
            <p>La sociedad tendrá por objeto: {{objetoSocial}}</p>
        </div>
        
        <div class="section">
            <h2>CUARTO: CAPITAL SOCIAL</h2>
            <p>El capital social es de $\{{capitalSocial\}} (\{{capitalSocialPalabras\}}), dividido en {{numeroAcciones}} acciones/participaciones con un valor nominal de $\{{valorNominal\}} cada una, suscritas y pagadas de la siguiente manera:</p>
            <p>{{distribucionCapital}}</p>
        </div>
        
        <div class="section">
            <h2>QUINTO: ADMINISTRACIÓN</h2>
            <p>La administración de la sociedad estará a cargo de {{administracion}}, quien(es) tendrá(n) las facultades establecidas en la ley y en los estatutos sociales.</p>
        </div>
        
        <div class="section">
            <h2>SEXTO: DURACIÓN</h2>
            <p>La duración de la sociedad será de {{duracion}}.</p>
        </div>
        
        <div class="section">
            <h2>SÉPTIMO: EJERCICIO SOCIAL Y UTILIDADES</h2>
            <p>El ejercicio social coincidirá con el año calendario. Al final de cada ejercicio se prepararán los estados financieros. Las utilidades obtenidas en cada ejercicio se distribuirán conforme a {{distribucionUtilidades}}.</p>
        </div>
        
        <div class="signature-line">
            <p>En constancia de lo anterior, firman los socios constituyentes:</p>
            
            <div class="signatures">
                <div class="signature">
                    <p>_________________________</p>
                    <p>Nombre:</p>
                    <p>RUT:</p>
                </div>
                
                <div class="signature">
                    <p>_________________________</p>
                    <p>Nombre:</p>
                    <p>RUT:</p>
                </div>
                
                <div class="signature">
                    <p>_________________________</p>
                    <p>Nombre:</p>
                    <p>RUT:</p>
                </div>
                
                <div class="signature">
                    <p>_________________________</p>
                    <p>Nombre:</p>
                    <p>RUT:</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      price: 8500,
      formSchema: {
        type: "object",
        required: [
          "ciudad", 
          "comparecientes", 
          "tipoSociedad", 
          "nombreSociedad", 
          "domicilioSociedad", 
          "objetoSocial", 
          "capitalSocial", 
          "capitalSocialPalabras", 
          "numeroAcciones", 
          "valorNominal", 
          "distribucionCapital", 
          "administracion", 
          "duracion", 
          "distribucionUtilidades"
        ],
        properties: {
          ciudad: {
            type: "string",
            title: "Ciudad"
          },
          comparecientes: {
            type: "string",
            title: "Comparecientes (nombres, RUT, domicilios)",
            maxLength: 500
          },
          tipoSociedad: {
            type: "string",
            title: "Tipo de Sociedad",
            enum: ["limitada", "anónima", "por acciones", "colectiva", "en comandita"]
          },
          nombreSociedad: {
            type: "string",
            title: "Nombre de la Sociedad"
          },
          domicilioSociedad: {
            type: "string",
            title: "Domicilio de la Sociedad"
          },
          objetoSocial: {
            type: "string",
            title: "Objeto Social",
            maxLength: 500
          },
          capitalSocial: {
            type: "number",
            title: "Capital Social (en números)"
          },
          capitalSocialPalabras: {
            type: "string",
            title: "Capital Social (en palabras)"
          },
          numeroAcciones: {
            type: "number",
            title: "Número de Acciones/Participaciones"
          },
          valorNominal: {
            type: "number",
            title: "Valor Nominal de cada Acción/Participación"
          },
          distribucionCapital: {
            type: "string",
            title: "Distribución del Capital",
            maxLength: 500
          },
          administracion: {
            type: "string",
            title: "Administración",
            maxLength: 300
          },
          duracion: {
            type: "string",
            title: "Duración de la Sociedad"
          },
          distribucionUtilidades: {
            type: "string",
            title: "Distribución de Utilidades",
            maxLength: 300
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Acta de Constitución de Sociedad' creada");
  }

  if (!templateNames.includes("Poder General")) {
    await storage.createDocumentTemplate({
      categoryId: DOCUMENTOS_CORPORATIVOS_ID,
      name: "Poder General",
      description: "Documento que otorga facultades de representación a un tercero",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Poder General</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PODER GENERAL</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, yo:</p>
            
            <p><strong>OTORGANTE:</strong><br>
            Nombre: {{nombreOtorgante}}<br>
            RUT: {{rutOtorgante}}<br>
            Domicilio: {{domicilioOtorgante}}<br>
            {{datosAdicionales}}</p>
            
            <p>Por el presente instrumento, confiero PODER GENERAL a:</p>
            
            <p><strong>APODERADO:</strong><br>
            Nombre: {{nombreApoderado}}<br>
            RUT: {{rutApoderado}}<br>
            Domicilio: {{domicilioApoderado}}</p>
        </div>
        
        <div class="section">
            <h2>FACULTADES</h2>
            <p>El apoderado está facultado para representarme en los siguientes actos y contratos:</p>
            <p>{{facultades}}</p>
        </div>
        
        <div class="section">
            <h2>LIMITACIONES</h2>
            <p>El presente poder tendrá las siguientes limitaciones:</p>
            <p>{{limitaciones}}</p>
        </div>
        
        <div class="section">
            <h2>VIGENCIA</h2>
            <p>Este poder tendrá vigencia {{vigencia}}.</p>
        </div>
        
        <div class="section">
            <h2>RENDICIÓN DE CUENTAS</h2>
            <p>El apoderado deberá rendir cuentas de su gestión {{rendicionCuentas}}.</p>
        </div>
        
        <div class="section">
            <h2>REVOCACIÓN</h2>
            <p>Este poder puede ser revocado en cualquier momento por el otorgante, mediante escritura pública, notificada legalmente al apoderado.</p>
        </div>
        
        <div class="signature-line">
            <p>_________________________</p>
            <p>{{nombreOtorgante}}</p>
            <p>OTORGANTE</p>
        </div>
    </div>
</body>
</html>`,
      price: 4500,
      formSchema: {
        type: "object",
        required: [
          "ciudad", 
          "nombreOtorgante", 
          "rutOtorgante", 
          "domicilioOtorgante", 
          "nombreApoderado", 
          "rutApoderado", 
          "domicilioApoderado", 
          "facultades", 
          "limitaciones", 
          "vigencia", 
          "rendicionCuentas"
        ],
        properties: {
          ciudad: {
            type: "string",
            title: "Ciudad"
          },
          nombreOtorgante: {
            type: "string",
            title: "Nombre del Otorgante"
          },
          rutOtorgante: {
            type: "string",
            title: "RUT del Otorgante"
          },
          domicilioOtorgante: {
            type: "string",
            title: "Domicilio del Otorgante"
          },
          datosAdicionales: {
            type: "string",
            title: "Datos Adicionales del Otorgante (opcional)",
            maxLength: 300
          },
          nombreApoderado: {
            type: "string",
            title: "Nombre del Apoderado"
          },
          rutApoderado: {
            type: "string",
            title: "RUT del Apoderado"
          },
          domicilioApoderado: {
            type: "string",
            title: "Domicilio del Apoderado"
          },
          facultades: {
            type: "string",
            title: "Facultades Otorgadas",
            maxLength: 500
          },
          limitaciones: {
            type: "string",
            title: "Limitaciones del Poder",
            maxLength: 300
          },
          vigencia: {
            type: "string",
            title: "Vigencia del Poder"
          },
          rendicionCuentas: {
            type: "string",
            title: "Rendición de Cuentas",
            maxLength: 200
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Poder General' creada");
  }

  // BIENES RAÍCES
  if (!templateNames.includes("Promesa de Compraventa Inmobiliaria")) {
    await storage.createDocumentTemplate({
      categoryId: BIENES_RAICES_ID,
      name: "Promesa de Compraventa Inmobiliaria",
      description: "Contrato previo para la compra de un bien inmueble",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Promesa de Compraventa Inmobiliaria</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
        .parties { display: flex; justify-content: space-between; }
        .party { width: 45%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PROMESA DE COMPRAVENTA INMOBILIARIA</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, entre:</p>
            
            <div class="parties">
                <div class="party">
                    <h2>PROMITENTE VENDEDOR</h2>
                    <p><strong>Nombre:</strong> {{nombreVendedor}}</p>
                    <p><strong>RUT:</strong> {{rutVendedor}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioVendedor}}</p>
                </div>
                
                <div class="party">
                    <h2>PROMITENTE COMPRADOR</h2>
                    <p><strong>Nombre:</strong> {{nombreComprador}}</p>
                    <p><strong>RUT:</strong> {{rutComprador}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioComprador}}</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>PRIMERO: OBJETO DEL CONTRATO</h2>
            <p>El Promitente Vendedor promete vender, ceder y transferir al Promitente Comprador, quien promete comprar, aceptar y adquirir para sí el siguiente inmueble:</p>
            <p><strong>Tipo de propiedad:</strong> {{tipoPropiedad}}</p>
            <p><strong>Ubicación:</strong> {{ubicacionPropiedad}}</p>
            <p><strong>Superficie:</strong> {{superficiePropiedad}}</p>
            <p><strong>Deslindes:</strong> {{deslindesPropiedad}}</p>
            <p><strong>Inscripción:</strong> El dominio del inmueble se encuentra inscrito a nombre del Promitente Vendedor a fojas {{fojasInscripcion}} número {{numeroInscripcion}} del Registro de Propiedad del Conservador de Bienes Raíces de {{conservadorBienesRaices}} del año {{añoInscripcion}}.</p>
        </div>
        
        <div class="section">
            <h2>SEGUNDO: PRECIO Y FORMA DE PAGO</h2>
            <p>El precio de la compraventa prometida es la suma de $\{{precioVenta\}} (\{{precioVentaPalabras\}}), que el Promitente Comprador pagará al Promitente Vendedor de la siguiente forma:</p>
            <p>{{formaPago}}</p>
        </div>
        
        <div class="section">
            <h2>TERCERO: PLAZO PARA CELEBRAR CONTRATO DEFINITIVO</h2>
            <p>El contrato de compraventa definitivo deberá celebrarse a más tardar el día {{fechaEscritura}}, ante el Notario Público de {{ciudadNotaria}}, don/doña {{nombreNotario}}.</p>
        </div>
        
        <div class="section">
            <h2>CUARTO: ENTREGA DEL INMUEBLE</h2>
            <p>La entrega material del inmueble se efectuará {{entregaInmueble}}.</p>
        </div>
        
        <div class="section">
            <h2>QUINTO: ARRAS</h2>
            <p>Como garantía de celebración del contrato definitivo, el Promitente Comprador entrega en este acto al Promitente Vendedor la suma de $\{{montoArras\}} (\{{montoArrasPalabras\}}) en calidad de arras.</p>
        </div>
        
        <div class="section">
            <h2>SEXTO: CLÁUSULA PENAL</h2>
            <p>{{clausulaPenal}}</p>
        </div>
        
        <div class="section">
            <h2>SÉPTIMO: GASTOS</h2>
            <p>Los gastos notariales y de inscripción de la compraventa definitiva serán de cargo de {{gastos}}.</p>
        </div>
        
        <div class="section">
            <h2>OCTAVO: DOMICILIO Y JURISDICCIÓN</h2>
            <p>Para todos los efectos legales derivados del presente contrato, las partes fijan domicilio en la ciudad de {{domicilioJuridico}} y se someten a la jurisdicción de sus tribunales ordinarios de justicia.</p>
        </div>
        
        <div class="signature-line">
            <div class="parties">
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreVendedor}}</p>
                    <p>PROMITENTE VENDEDOR</p>
                </div>
                
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombreComprador}}</p>
                    <p>PROMITENTE COMPRADOR</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      price: 7500,
      formSchema: {
        type: "object",
        required: [
          "ciudad",
          "nombreVendedor",
          "rutVendedor",
          "domicilioVendedor",
          "nombreComprador",
          "rutComprador",
          "domicilioComprador",
          "tipoPropiedad",
          "ubicacionPropiedad",
          "superficiePropiedad",
          "deslindesPropiedad",
          "fojasInscripcion",
          "numeroInscripcion",
          "conservadorBienesRaices",
          "añoInscripcion",
          "precioVenta",
          "precioVentaPalabras",
          "formaPago",
          "fechaEscritura",
          "ciudadNotaria",
          "nombreNotario",
          "entregaInmueble",
          "montoArras",
          "montoArrasPalabras",
          "clausulaPenal",
          "gastos",
          "domicilioJuridico"
        ],
        properties: {
          ciudad: {
            type: "string",
            title: "Ciudad donde se firma"
          },
          nombreVendedor: {
            type: "string",
            title: "Nombre del Vendedor"
          },
          rutVendedor: {
            type: "string",
            title: "RUT del Vendedor"
          },
          domicilioVendedor: {
            type: "string",
            title: "Domicilio del Vendedor"
          },
          nombreComprador: {
            type: "string",
            title: "Nombre del Comprador"
          },
          rutComprador: {
            type: "string",
            title: "RUT del Comprador"
          },
          domicilioComprador: {
            type: "string",
            title: "Domicilio del Comprador"
          },
          tipoPropiedad: {
            type: "string",
            title: "Tipo de Propiedad",
            enum: ["Casa", "Departamento", "Terreno", "Local Comercial", "Oficina", "Otro"]
          },
          ubicacionPropiedad: {
            type: "string",
            title: "Ubicación de la Propiedad"
          },
          superficiePropiedad: {
            type: "string",
            title: "Superficie de la Propiedad"
          },
          deslindesPropiedad: {
            type: "string",
            title: "Deslindes de la Propiedad",
            maxLength: 500
          },
          fojasInscripcion: {
            type: "string",
            title: "Fojas de Inscripción"
          },
          numeroInscripcion: {
            type: "string",
            title: "Número de Inscripción"
          },
          conservadorBienesRaices: {
            type: "string",
            title: "Conservador de Bienes Raíces"
          },
          añoInscripcion: {
            type: "string",
            title: "Año de Inscripción"
          },
          precioVenta: {
            type: "number",
            title: "Precio de Venta (en números)"
          },
          precioVentaPalabras: {
            type: "string",
            title: "Precio de Venta (en palabras)"
          },
          formaPago: {
            type: "string",
            title: "Forma de Pago",
            maxLength: 300
          },
          fechaEscritura: {
            type: "string",
            title: "Fecha para Escritura Definitiva",
            format: "date"
          },
          ciudadNotaria: {
            type: "string",
            title: "Ciudad de la Notaría"
          },
          nombreNotario: {
            type: "string",
            title: "Nombre del Notario"
          },
          entregaInmueble: {
            type: "string",
            title: "Condiciones de Entrega del Inmueble",
            maxLength: 300
          },
          montoArras: {
            type: "number",
            title: "Monto de Arras (en números)"
          },
          montoArrasPalabras: {
            type: "string",
            title: "Monto de Arras (en palabras)"
          },
          clausulaPenal: {
            type: "string",
            title: "Cláusula Penal",
            maxLength: 500
          },
          gastos: {
            type: "string",
            title: "Responsable de los Gastos",
            enum: ["comprador", "vendedor", "ambas partes por igual"]
          },
          domicilioJuridico: {
            type: "string",
            title: "Domicilio Jurídico"
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Promesa de Compraventa Inmobiliaria' creada");
  }

  // DOCUMENTOS FINANCIEROS
  if (!templateNames.includes("Pagaré")) {
    await storage.createDocumentTemplate({
      categoryId: DOCUMENTOS_FINANCIEROS_ID,
      name: "Pagaré",
      description: "Documento para reconocimiento formal de deuda",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pagaré</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .container { max-width: 800px; margin: 0 auto; }
        .signature-line { margin-top: 80px; }
        .amount { font-weight: bold; font-size: 1.2em; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-info div { padding: 10px; border: 1px solid #ddd; }
        .main-content { text-align: justify; }
        .conditions { margin-top: 30px; }
        .signature { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Pagaré</h1>
        
        <div class="header-info">
            <div>
                <p><strong>Número:</strong> {{numeroPagare}}</p>
                <p><strong>Fecha de Emisión:</strong> {{date}}</p>
            </div>
            <div>
                <p><strong>Monto:</strong> <span class="amount">$\{{montoPagare\}}</span></p>
                <p><strong>Vencimiento:</strong> {{fechaVencimiento}}</p>
            </div>
        </div>
        
        <div class="main-content">
            <p>Por este pagaré, yo <strong>{{nombreDeudor}}</strong>, RUT {{rutDeudor}}, domiciliado en {{domicilioDeudor}}, me obligo a pagar incondicionalmente a la orden de <strong>{{nombreAcreedor}}</strong>, RUT {{rutAcreedor}}, domiciliado en {{domicilioAcreedor}}, o a quien sus derechos represente, la suma de <strong>$\{{montoPagare\}} (\{{montoPagarePalabras\}})</strong>.</p>
            
            <p>El pago de esta obligación se realizará {{formaPago}}.</p>
            
            <p>{{clausulasEspeciales}}</p>
        </div>
        
        <div class="conditions">
            <p><strong>Lugar de Pago:</strong> {{lugarPago}}</p>
            <p><strong>Interés:</strong> {{interes}}</p>
            <p><strong>Interés por Mora:</strong> {{interesMora}}</p>
            <p>Se deja constancia que este pagaré tiene mérito ejecutivo conforme a la ley y no requiere protesto.</p>
            <p>{{clausulasAdicionales}}</p>
        </div>
        
        <div class="signature-line">
            <p>_______________________________________</p>
            <p>{{nombreDeudor}}</p>
            <p>RUT: {{rutDeudor}}</p>
            <p>DEUDOR</p>
        </div>
    </div>
</body>
</html>`,
      price: 5000,
      formSchema: {
        type: "object",
        required: [
          "numeroPagare", 
          "montoPagare", 
          "fechaVencimiento", 
          "nombreDeudor", 
          "rutDeudor", 
          "domicilioDeudor", 
          "nombreAcreedor", 
          "rutAcreedor", 
          "domicilioAcreedor", 
          "montoPagarePalabras", 
          "formaPago", 
          "lugarPago", 
          "interes", 
          "interesMora"
        ],
        properties: {
          numeroPagare: {
            type: "string",
            title: "Número de Pagaré"
          },
          montoPagare: {
            type: "number",
            title: "Monto del Pagaré (en números)"
          },
          fechaVencimiento: {
            type: "string",
            title: "Fecha de Vencimiento",
            format: "date"
          },
          nombreDeudor: {
            type: "string",
            title: "Nombre del Deudor"
          },
          rutDeudor: {
            type: "string",
            title: "RUT del Deudor"
          },
          domicilioDeudor: {
            type: "string",
            title: "Domicilio del Deudor"
          },
          nombreAcreedor: {
            type: "string",
            title: "Nombre del Acreedor"
          },
          rutAcreedor: {
            type: "string",
            title: "RUT del Acreedor"
          },
          domicilioAcreedor: {
            type: "string",
            title: "Domicilio del Acreedor"
          },
          montoPagarePalabras: {
            type: "string",
            title: "Monto del Pagaré (en palabras)"
          },
          formaPago: {
            type: "string",
            title: "Forma de Pago",
            maxLength: 300
          },
          clausulasEspeciales: {
            type: "string",
            title: "Cláusulas Especiales (opcional)",
            maxLength: 500
          },
          lugarPago: {
            type: "string",
            title: "Lugar de Pago"
          },
          interes: {
            type: "string",
            title: "Interés"
          },
          interesMora: {
            type: "string",
            title: "Interés por Mora"
          },
          clausulasAdicionales: {
            type: "string",
            title: "Cláusulas Adicionales (opcional)",
            maxLength: 500
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Pagaré' creada");
  }

  if (!templateNames.includes("Contrato de Préstamo")) {
    await storage.createDocumentTemplate({
      categoryId: DOCUMENTOS_FINANCIEROS_ID,
      name: "Contrato de Préstamo",
      description: "Documento que formaliza un préstamo entre partes",
      htmlTemplate: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato de Préstamo</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1 { color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; padding-top: 10px; }
        .parties { display: flex; justify-content: space-between; }
        .party { width: 45%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>CONTRATO DE PRÉSTAMO</h1>
        
        <div class="section">
            <p>En la ciudad de {{ciudad}}, a {{date}}, entre:</p>
            
            <div class="parties">
                <div class="party">
                    <h2>PRESTAMISTA</h2>
                    <p><strong>Nombre:</strong> {{nombrePrestamista}}</p>
                    <p><strong>RUT:</strong> {{rutPrestamista}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioPrestamista}}</p>
                </div>
                
                <div class="party">
                    <h2>PRESTATARIO</h2>
                    <p><strong>Nombre:</strong> {{nombrePrestatario}}</p>
                    <p><strong>RUT:</strong> {{rutPrestatario}}</p>
                    <p><strong>Domicilio:</strong> {{domicilioPrestatario}}</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>PRIMERO: OBJETO DEL CONTRATO</h2>
            <p>Por el presente instrumento, el PRESTAMISTA otorga en préstamo al PRESTATARIO, quien acepta y recibe a su entera satisfacción, la suma de $\{{montoPrestamo\}} (\{{montoPrestamoLetras\}}).</p>
        </div>
        
        <div class="section">
            <h2>SEGUNDO: FINALIDAD DEL PRÉSTAMO</h2>
            <p>El PRESTATARIO destinará el dinero prestado a: {{finalidadPrestamo}}.</p>
        </div>
        
        <div class="section">
            <h2>TERCERO: PLAZO Y FORMA DE PAGO</h2>
            <p>El PRESTATARIO se obliga a devolver al PRESTAMISTA la totalidad del préstamo en un plazo de {{plazoDevolucion}}, mediante {{formaDevolucion}}.</p>
        </div>
        
        <div class="section">
            <h2>CUARTO: INTERESES</h2>
            <p>El préstamo devengará intereses a razón de {{tasaInteres}} sobre el monto prestado. {{detallesInteres}}</p>
        </div>
        
        <div class="section">
            <h2>QUINTO: GARANTÍAS</h2>
            <p>Para garantizar el cumplimiento de las obligaciones contraídas en este contrato, el PRESTATARIO constituye las siguientes garantías: {{garantias}}</p>
        </div>
        
        <div class="section">
            <h2>SEXTO: INCUMPLIMIENTO</h2>
            <p>En caso de incumplimiento por parte del PRESTATARIO, se aplicarán las siguientes medidas: {{medidasIncumplimiento}}</p>
        </div>
        
        <div class="section">
            <h2>SÉPTIMO: DOMICILIO Y JURISDICCIÓN</h2>
            <p>Para todos los efectos legales del presente contrato, las partes fijan domicilio en la ciudad de {{domicilioJuridico}} y se someten a la jurisdicción de sus tribunales ordinarios de justicia.</p>
        </div>
        
        <div class="signature-line">
            <div class="parties">
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombrePrestamista}}</p>
                    <p>PRESTAMISTA</p>
                </div>
                
                <div class="party">
                    <p>_________________________</p>
                    <p>{{nombrePrestatario}}</p>
                    <p>PRESTATARIO</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      price: 6000,
      formSchema: {
        type: "object",
        required: [
          "ciudad",
          "nombrePrestamista",
          "rutPrestamista",
          "domicilioPrestamista",
          "nombrePrestatario",
          "rutPrestatario",
          "domicilioPrestatario",
          "montoPrestamo",
          "montoPrestamoLetras",
          "finalidadPrestamo",
          "plazoDevolucion",
          "formaDevolucion",
          "tasaInteres",
          "detallesInteres",
          "garantias",
          "medidasIncumplimiento",
          "domicilioJuridico"
        ],
        properties: {
          ciudad: {
            type: "string",
            title: "Ciudad donde se firma"
          },
          nombrePrestamista: {
            type: "string",
            title: "Nombre del Prestamista"
          },
          rutPrestamista: {
            type: "string",
            title: "RUT del Prestamista"
          },
          domicilioPrestamista: {
            type: "string",
            title: "Domicilio del Prestamista"
          },
          nombrePrestatario: {
            type: "string",
            title: "Nombre del Prestatario"
          },
          rutPrestatario: {
            type: "string",
            title: "RUT del Prestatario"
          },
          domicilioPrestatario: {
            type: "string",
            title: "Domicilio del Prestatario"
          },
          montoPrestamo: {
            type: "number",
            title: "Monto del Préstamo (en números)"
          },
          montoPrestamoLetras: {
            type: "string",
            title: "Monto del Préstamo (en letras)"
          },
          finalidadPrestamo: {
            type: "string",
            title: "Finalidad del Préstamo",
            maxLength: 300
          },
          plazoDevolucion: {
            type: "string",
            title: "Plazo de Devolución"
          },
          formaDevolucion: {
            type: "string",
            title: "Forma de Devolución",
            maxLength: 300
          },
          tasaInteres: {
            type: "string",
            title: "Tasa de Interés"
          },
          detallesInteres: {
            type: "string",
            title: "Detalles de Interés",
            maxLength: 300
          },
          garantias: {
            type: "string",
            title: "Garantías",
            maxLength: 500
          },
          medidasIncumplimiento: {
            type: "string",
            title: "Medidas por Incumplimiento",
            maxLength: 300
          },
          domicilioJuridico: {
            type: "string",
            title: "Domicilio Jurídico"
          }
        }
      },
      active: true
    });
    console.log("Plantilla 'Contrato de Préstamo' creada");
  }

  console.log("Proceso de creación de plantillas completado.");
}