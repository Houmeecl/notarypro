// Templates de documentos para las categorías

export const contractoCompraventaTemplate = {
  categoryId: 1,
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
            <p>En la ciudad de {{ciudad}}, a {{fecha}}, entre:</p>
            
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
            <p>El precio de la compraventa es la suma de $\{{precioVenta\}} (\{{precioVentaPalabras\}}), que el COMPRADOR pagará al VENDEDOR de la siguiente forma: {{formaPago}}.</p>
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
      "precioVenta", 
      "precioVentaPalabras", 
      "formaPago", 
      "fechaEntrega", 
      "lugarEntrega", 
      "ciudad",
      "fecha"
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
      precioVenta: {
        type: "number",
        title: "Precio (en números)"
      },
      precioVentaPalabras: {
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
      },
      fecha: {
        type: "string",
        title: "Fecha del contrato",
        format: "date"
      }
    }
  },
  active: true
};

export const contratoConfidencialidadTemplate = {
  categoryId: 1,
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
            <p>En la ciudad de {{ciudad}}, a {{fecha}}, entre:</p>
            
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
      "ciudad",
      "fecha"
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
      },
      fecha: {
        type: "string",
        title: "Fecha del contrato",
        format: "date"
      }
    }
  },
  active: true
};

// Template para Acta de Constitución de Sociedad
export const actaConstitucionTemplate = {
  categoryId: 2, // DOCUMENTOS_CORPORATIVOS_ID
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
            <p>En la ciudad de {{ciudad}}, a {{fecha}}, comparecen:</p>
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
            <p>El capital social es de $\{{capitalSocialNumero\}} (\{{capitalSocialPalabras\}}), dividido en {{numeroAcciones}} acciones/participaciones con un valor nominal de $\{{valorNominalAccion\}} cada una, suscritas y pagadas de la siguiente manera:</p>
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
      "fecha",
      "comparecientes", 
      "tipoSociedad", 
      "nombreSociedad", 
      "domicilioSociedad", 
      "objetoSocial", 
      "capitalSocialNumero", 
      "capitalSocialPalabras", 
      "numeroAcciones", 
      "valorNominalAccion", 
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
      fecha: {
        type: "string",
        title: "Fecha",
        format: "date"
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
      capitalSocialNumero: {
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
      valorNominalAccion: {
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
};

// Función para añadir todas las plantillas al sistema
export async function seedAllTemplates() {
  const templates = [
    contractoCompraventaTemplate,
    contratoConfidencialidadTemplate,
    actaConstitucionTemplate
  ];
  
  try {
    const response = await fetch('/api/admin/seed-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secretCode: '7723',
        templates: templates
      }),
    });
    
    const data = await response.json();
    console.log('Resultado de la operación:', data);
    return data;
  } catch (error) {
    console.error('Error al sembrar plantillas:', error);
    throw error;
  }
}