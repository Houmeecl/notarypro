// Demo data for the admin panel

// Tipos de documento disponibles en el sistema
export const DOCUMENT_TYPES = [
  { id: 'power', name: 'Poder Simple', fee: 5000 },
  { id: 'declaration', name: 'Declaración Jurada', fee: 7500 },
  { id: 'contract', name: 'Contrato', fee: 10000 },
  { id: 'certificate', name: 'Certificado', fee: 3500 },
  { id: 'legalization', name: 'Legalización de Documentos', fee: 4500 },
  { id: 'translation', name: 'Traducción Oficial', fee: 15000 }
];

// Datos de ejemplo para documentos
export const sampleDocuments = [
  {
    id: 'doc-1',
    title: 'Poder Simple',
    type: 'Poder Simple',
    price: 5000,
    dateAdded: '2025-04-15T10:30:00Z',
    usageCount: 12,
    status: 'active'
  },
  {
    id: 'doc-2',
    title: 'Declaración Jurada',
    type: 'Declaración Jurada',
    price: 7500,
    dateAdded: '2025-04-12T14:15:00Z',
    usageCount: 8,
    status: 'active'
  },
  {
    id: 'doc-3',
    title: 'Contrato de Arriendo',
    type: 'Contrato',
    price: 10000,
    dateAdded: '2025-04-05T09:20:00Z',
    usageCount: 15,
    status: 'active'
  },
  {
    id: 'doc-4',
    title: 'Certificado de Residencia',
    type: 'Certificado',
    price: 3500,
    dateAdded: '2025-03-28T16:45:00Z',
    usageCount: 7,
    status: 'active'
  },
  {
    id: 'doc-5',
    title: 'Legalización de Documentos',
    type: 'Legalización de Documentos',
    price: 4500,
    dateAdded: '2025-03-20T11:10:00Z',
    usageCount: 5,
    status: 'active'
  }
];

// Datos de ejemplo para clientes
export const sampleClients = [
  {
    id: 'client-1',
    name: 'Juan Pérez',
    rut: '12.345.678-9',
    email: 'juan.perez@ejemplo.com',
    phone: '+56 9 1234 5678',
    address: 'Av. Providencia 1234, Santiago',
    dateAdded: '2025-04-18T09:30:00Z',
    documents: 3,
    status: 'active'
  },
  {
    id: 'client-2',
    name: 'María González',
    rut: '15.876.543-2',
    email: 'maria.gonzalez@ejemplo.com',
    phone: '+56 9 8765 4321',
    address: 'Calle Nueva 567, Providencia',
    dateAdded: '2025-04-15T14:20:00Z',
    documents: 2,
    status: 'active'
  },
  {
    id: 'client-3',
    name: 'Pedro Soto',
    rut: '16.789.123-4',
    email: 'pedro.soto@ejemplo.com',
    phone: '+56 9 7654 3210',
    address: 'Los Leones 890, Las Condes',
    dateAdded: '2025-04-10T11:45:00Z',
    documents: 1,
    status: 'active'
  },
  {
    id: 'client-4',
    name: 'Ana Muñoz',
    rut: '14.234.567-8',
    email: 'ana.munoz@ejemplo.com',
    phone: '+56 9 6543 2109',
    address: 'Av. Matta 432, Santiago',
    dateAdded: '2025-04-05T10:15:00Z',
    documents: 4,
    status: 'active'
  }
];

// Datos de ejemplo para socios
export const samplePartners = [
  {
    id: 'partner-1',
    name: 'Minimarket Don Pedro',
    businessType: 'Minimarket',
    email: 'contacto@donpedro.cl',
    phone: '+56 9 1122 3344',
    address: 'Santa Rosa 765, Santiago',
    dateAdded: '2025-04-20T08:30:00Z',
    documents: 15,
    sales: 120000,
    status: 'active'
  },
  {
    id: 'partner-2',
    name: 'Almacén La Esquina',
    businessType: 'Almacén',
    email: 'info@laesquina.cl',
    phone: '+56 9 2233 4455',
    address: 'Irarrázaval 2345, Ñuñoa',
    dateAdded: '2025-04-18T09:45:00Z',
    documents: 8,
    sales: 75000,
    status: 'active'
  },
  {
    id: 'partner-3',
    name: 'Ferretería El Martillo',
    businessType: 'Ferretería',
    email: 'ventas@elmartillo.cl',
    phone: '+56 9 3344 5566',
    address: 'Av. Portugal 543, Santiago',
    dateAdded: '2025-04-15T10:20:00Z',
    documents: 5,
    sales: 45000,
    status: 'active'
  },
  {
    id: 'partner-4',
    name: 'Farmacia Vecina',
    businessType: 'Farmacia',
    email: 'atencion@farmaciavecina.cl',
    phone: '+56 9 4455 6677',
    address: 'Gran Avenida 1234, La Cisterna',
    dateAdded: '2025-04-10T14:10:00Z',
    documents: 12,
    sales: 95000,
    status: 'active'
  },
  {
    id: 'partner-5',
    name: 'Botillería La Buena',
    businessType: 'Botillería',
    email: 'contacto@labuena.cl',
    phone: '+56 9 5566 7788',
    address: 'Av. Independencia 567, Independencia',
    dateAdded: '2025-04-05T15:30:00Z',
    documents: 3,
    sales: 35000,
    status: 'active'
  }
];