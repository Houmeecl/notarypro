import React, { useEffect, useState } from "react";

// Componente de ilustración de vecino atendiendo clientes
export const NeighborHelping = () => {
  const [moveAngle, setMoveAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMoveAngle(prev => (prev + 1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Cálculo para el efecto de mecerse suavemente
  const offsetY = Math.sin(moveAngle * Math.PI / 180) * 2;
  
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto transition-transform duration-300"
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {/* Fondo */}
      <rect x="20" y="160" width="200" height="20" rx="10" fill="#E5E7EB" />
      
      {/* Mostrador */}
      <rect x="60" y="100" width="120" height="60" rx="5" fill="#60A5FA" />
      <rect x="60" y="120" width="120" height="40" rx="3" fill="#2563EB" />
      
      {/* Persona atendiendo (Vecino) */}
      <circle cx="90" cy="85" r="15" fill="#FCD34D" /> {/* Cabeza */}
      <rect x="80" y="100" width="20" height="30" fill="#10B981" /> {/* Torso */}
      <rect x="80" y="100" width="20" height="10" fill="#059669" /> {/* Cuello */}
      
      {/* Brazos */}
      <rect x="75" y="105" width="5" height="20" rx="2" fill="#10B981" />
      <rect x="100" y="105" width="5" height="20" rx="2" fill="#10B981" />
      <rect x="100" y="105" width="25" height="5" rx="2" fill="#10B981" />
      
      {/* Cliente */}
      <circle cx="150" cy="85" r="15" fill="#FCA5A5" /> {/* Cabeza */}
      <rect x="140" y="100" width="20" height="30" fill="#6366F1" /> {/* Torso */}
      <rect x="140" y="100" width="20" height="10" fill="#4F46E5" /> {/* Cuello */}
      
      {/* Brazos */}
      <rect x="135" y="105" width="5" height="20" rx="2" fill="#6366F1" />
      <rect x="160" y="105" width="5" height="20" rx="2" fill="#6366F1" />
      <rect x="115" y="105" width="20" height="5" rx="2" fill="#6366F1" />
      
      {/* Documento */}
      <rect x="120" y="90" width="15" height="20" fill="#F3F4F6" />
      <line x1="123" y1="95" x2="133" y2="95" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="123" y1="98" x2="133" y2="98" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="123" y1="101" x2="133" y2="101" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="123" y1="104" x2="130" y2="104" stroke="#9CA3AF" strokeWidth="1" />
      
      {/* Letrero */}
      <rect x="75" y="70" width="90" height="15" rx="3" fill="#FBBF24" />
      <text x="85" y="81" fontFamily="Arial" fontSize="10" fill="#7F1D1D">Vecinos Xpress</text>
    </svg>
  );
};

// Componente de ilustración de vendedor visitando tiendas
export const SellerVisiting = () => {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Fondo */}
      <rect x="20" y="160" width="200" height="20" rx="10" fill="#E5E7EB" />
      
      {/* Tienda */}
      <rect x="130" y="70" width="80" height="90" fill="#9CA3AF" />
      <rect x="130" y="70" width="80" height="15" fill="#6B7280" />
      <rect x="145" y="120" width="50" height="40" fill="#6B7280" />
      <rect x="150" y="80" width="40" height="30" fill="#F59E0B" />
      <line x1="170" y1="80" x2="170" y2="110" stroke="#7F1D1D" strokeWidth="2" />
      <line x1="150" y1="95" x2="190" y2="95" stroke="#7F1D1D" strokeWidth="2" />
      
      {/* Letrero */}
      <rect x="150" y="85" width="40" height="8" rx="2" fill="#FBBF24" />
      <text x="155" y="91" fontFamily="Arial" fontSize="6" fill="#7F1D1D">Vecinos Xpress</text>
      
      {/* Persona (Vendedor) */}
      <circle cx="90" cy="100" r="15" fill="#A78BFA" /> {/* Cabeza */}
      <rect x="80" y="115" width="20" height="45" fill="#7C3AED" /> {/* Torso */}
      <rect x="80" y="115" width="20" height="10" fill="#6D28D9" /> {/* Cuello */}
      
      {/* Piernas */}
      <rect x="80" y="160" width="8" height="30" fill="#4B5563" />
      <rect x="92" y="160" width="8" height="30" fill="#4B5563" />
      
      {/* Brazos */}
      <rect x="75" y="120" width="5" height="20" rx="2" fill="#7C3AED" />
      <rect x="100" y="120" width="5" height="20" rx="2" fill="#7C3AED" />
      
      {/* Maletín */}
      <rect x="100" y="140" width="20" height="25" fill="#1F2937" />
      <rect x="107" y="138" width="6" height="4" fill="#1F2937" />
      
      {/* Movimiento */}
      <path d="M110 100 L120 95 L125 100 L120 105 Z" fill="#9333EA" />
    </svg>
  );
};

// Componente de ilustración de supervisores gestionando equipo
export const SupervisorManaging = () => {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Fondo */}
      <rect x="20" y="160" width="200" height="20" rx="10" fill="#E5E7EB" />
      
      {/* Supervisor */}
      <circle cx="120" cy="80" r="20" fill="#FBBF24" /> {/* Cabeza */}
      <rect x="105" y="100" width="30" height="60" fill="#F59E0B" /> {/* Torso */}
      <rect x="105" y="100" width="30" height="15" fill="#D97706" /> {/* Cuello */}
      
      {/* Brazos extendidos */}
      <rect x="90" y="105" width="15" height="7" rx="3" fill="#F59E0B" />
      <rect x="135" y="105" width="15" height="7" rx="3" fill="#F59E0B" />
      
      {/* Piernas */}
      <rect x="110" y="160" width="10" height="30" fill="#4B5563" />
      <rect x="125" y="160" width="10" height="30" fill="#4B5563" />
      
      {/* Empleado 1 */}
      <circle cx="70" cy="110" r="15" fill="#A78BFA" /> {/* Cabeza */}
      <rect x="62.5" y="125" width="15" height="35" fill="#7C3AED" /> {/* Torso */}
      
      {/* Piernas */}
      <rect x="65" y="160" width="5" height="20" fill="#4B5563" />
      <rect x="75" y="160" width="5" height="20" fill="#4B5563" />
      
      {/* Empleado 2 */}
      <circle cx="170" cy="110" r="15" fill="#FCA5A5" /> {/* Cabeza */}
      <rect x="162.5" y="125" width="15" height="35" fill="#EF4444" /> {/* Torso */}
      
      {/* Piernas */}
      <rect x="165" y="160" width="5" height="20" fill="#4B5563" />
      <rect x="175" y="160" width="5" height="20" fill="#4B5563" />
      
      {/* Líneas conectoras */}
      <line x1="90" y1="108" x2="85" y2="108" stroke="#F59E0B" strokeWidth="2" />
      <line x1="85" y1="108" x2="85" y2="95" stroke="#F59E0B" strokeWidth="2" />
      <line x1="85" y1="95" x2="70" y2="95" stroke="#F59E0B" strokeWidth="2" />
      
      <line x1="150" y1="108" x2="155" y2="108" stroke="#F59E0B" strokeWidth="2" />
      <line x1="155" y1="108" x2="155" y2="95" stroke="#F59E0B" strokeWidth="2" />
      <line x1="155" y1="95" x2="170" y2="95" stroke="#F59E0B" strokeWidth="2" />
      
      {/* Gráfica */}
      <rect x="100" y="65" width="40" height="20" fill="white" stroke="#9CA3AF" />
      <path d="M105 80 L115 70 L125 75 L135 65" stroke="#10B981" strokeWidth="2" />
    </svg>
  );
};

// Componente de ilustración de certificador revisando documentos
export const CertifierReviewing = () => {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Fondo */}
      <rect x="20" y="160" width="200" height="20" rx="10" fill="#E5E7EB" />
      
      {/* Mesa */}
      <rect x="40" y="110" width="160" height="10" fill="#92400E" />
      <rect x="45" y="120" width="10" height="40" fill="#92400E" />
      <rect x="185" y="120" width="10" height="40" fill="#92400E" />
      
      {/* Persona certificadora */}
      <circle cx="120" cy="75" r="20" fill="#FCD34D" /> {/* Cabeza */}
      <rect x="105" y="95" width="30" height="30" fill="#0369A1" /> {/* Torso */}
      <rect x="105" y="95" width="30" height="10" fill="#0284C7" /> {/* Cuello */}
      
      {/* Brazos */}
      <rect x="90" y="100" width="15" height="7" rx="3" fill="#0369A1" />
      <rect x="135" y="100" width="15" height="7" rx="3" fill="#0369A1" />
      <rect x="90" y="100" width="7" height="20" rx="3" fill="#0369A1" />
      <rect x="143" y="100" width="7" height="20" rx="3" fill="#0369A1" />
      
      {/* Silla */}
      <rect x="100" y="125" width="40" height="10" fill="#4B5563" />
      <rect x="115" y="135" width="10" height="30" fill="#4B5563" />
      
      {/* Documentos */}
      <rect x="60" y="85" width="30" height="25" fill="#F3F4F6" transform="rotate(-10 60 85)" />
      <rect x="150" y="85" width="30" height="25" fill="#F3F4F6" transform="rotate(10 150 85)" />
      <rect x="100" y="80" width="40" height="30" fill="#F3F4F6" />
      
      {/* Líneas de texto en los documentos */}
      <line x1="105" y1="87" x2="135" y2="87" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="105" y1="92" x2="135" y2="92" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="105" y1="97" x2="135" y2="97" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="105" y1="102" x2="125" y2="102" stroke="#9CA3AF" strokeWidth="1" />
      
      {/* Sello de aprobación */}
      <circle cx="125" cy="95" r="10" stroke="#10B981" strokeWidth="1.5" fill="none" />
      <path d="M118 95 L123 100 L132 90" stroke="#10B981" strokeWidth="1.5" />
    </svg>
  );
};

// Componente de ilustración de sistema de pagos
export const PaymentSystem = () => {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Fondo */}
      <rect x="20" y="160" width="200" height="20" rx="10" fill="#E5E7EB" />
      
      {/* POS Terminal */}
      <rect x="140" y="90" width="50" height="70" rx="5" fill="#4B5563" />
      <rect x="145" y="100" width="40" height="20" rx="2" fill="#F3F4F6" />
      <rect x="150" y="130" width="10" height="10" rx="2" fill="#F3F4F6" />
      <rect x="165" y="130" width="10" height="10" rx="2" fill="#F3F4F6" />
      <rect x="150" y="145" width="10" height="10" rx="2" fill="#F3F4F6" />
      <rect x="165" y="145" width="10" height="10" rx="2" fill="#F3F4F6" />
      
      {/* Tarjeta de crédito */}
      <rect x="130" y="115" width="40" height="25" rx="3" fill="#3B82F6" />
      <rect x="135" y="122" width="20" height="3" rx="1" fill="#F3F4F6" />
      <rect x="135" y="130" width="10" height="5" rx="1" fill="#FCD34D" />
      
      {/* Persona pagando */}
      <circle cx="90" cy="100" r="15" fill="#FCA5A5" /> {/* Cabeza */}
      <rect x="80" y="115" width="20" height="45" fill="#F87171" /> {/* Torso */}
      <rect x="80" y="115" width="20" height="10" fill="#EF4444" /> {/* Cuello */}
      
      {/* Piernas */}
      <rect x="85" y="160" width="5" height="20" fill="#4B5563" />
      <rect x="95" y="160" width="5" height="20" fill="#4B5563" />
      
      {/* Brazos */}
      <rect x="100" y="120" width="35" height="7" rx="3" fill="#F87171" />
      <rect x="75" y="120" width="5" height="20" rx="2" fill="#F87171" />
      
      {/* Recibo/Documento */}
      <rect x="150" y="80" width="15" height="20" fill="#F3F4F6" />
      <line x1="153" y1="85" x2="163" y2="85" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="153" y1="88" x2="163" y2="88" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="153" y1="91" x2="163" y2="91" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="153" y1="94" x2="160" y2="94" stroke="#9CA3AF" strokeWidth="1" />
      
      {/* Símbolo de dinero */}
      <circle cx="120" cy="90" r="15" fill="#059669" opacity="0.7" />
      <text x="115" y="95" fontFamily="Arial" fontSize="15" fontWeight="bold" fill="white">$</text>
    </svg>
  );
};

// Componente de ilustración de tienda atendiendo clientes (para la nueva landing page)
export const StoreServing = () => {
  const [moveAngle, setMoveAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMoveAngle(prev => (prev + 1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Cálculo para el efecto de mecerse suavemente
  const offsetY = Math.sin(moveAngle * Math.PI / 180) * 2;
  
  return (
    <svg
      width="300"
      height="240"
      viewBox="0 0 300 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto transition-transform duration-300"
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {/* Fondo de tienda */}
      <rect x="50" y="40" width="200" height="150" rx="5" fill="#2d219b" opacity="0.1" />
      
      {/* Mostrador */}
      <rect x="70" y="120" width="160" height="50" rx="5" fill="#2d219b" />
      <rect x="70" y="140" width="160" height="30" rx="3" fill="#1e1876" />
      
      {/* Estantería */}
      <rect x="60" y="60" width="40" height="60" fill="#4b5563" />
      <rect x="110" y="60" width="40" height="60" fill="#4b5563" />
      <rect x="60" y="60" width="40" height="10" fill="#374151" />
      <rect x="110" y="60" width="40" height="10" fill="#374151" />
      <rect x="60" y="80" width="40" height="10" fill="#374151" />
      <rect x="110" y="80" width="40" height="10" fill="#374151" />
      <rect x="60" y="100" width="40" height="10" fill="#374151" />
      <rect x="110" y="100" width="40" height="10" fill="#374151" />
      
      {/* Productos en estantería */}
      <rect x="65" y="65" width="10" height="15" fill="#ef4444" />
      <rect x="80" y="65" width="10" height="15" fill="#3b82f6" />
      <rect x="115" y="65" width="10" height="15" fill="#10b981" />
      <rect x="130" y="65" width="10" height="15" fill="#f59e0b" />
      <rect x="65" y="85" width="10" height="15" fill="#8b5cf6" />
      <rect x="80" y="85" width="10" height="15" fill="#ec4899" />
      <rect x="115" y="85" width="10" height="15" fill="#6366f1" />
      <rect x="130" y="85" width="10" height="15" fill="#f97316" />
      
      {/* Terminal POS */}
      <rect x="190" y="100" width="40" height="20" rx="3" fill="#111827" />
      <rect x="195" y="105" width="30" height="10" rx="2" fill="#d1d5db" />
      
      {/* Letrero VecinoXpress */}
      <rect x="80" y="40" width="140" height="25" rx="5" fill="#ffffff" />
      <text x="90" y="58" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="#2d219b">VecinoXpress</text>
      
      {/* Persona atendiendo (Socio) */}
      <circle cx="100" cy="105" r="15" fill="#fbbf24" /> {/* Cabeza */}
      <rect x="90" y="120" width="20" height="25" fill="#2d219b" /> {/* Torso - Color de VecinoXpress */}
      <rect x="90" y="120" width="20" height="8" fill="#1e1876" /> {/* Cuello - Color más oscuro */}
      
      {/* Brazos */}
      <rect x="85" y="125" width="5" height="15" rx="2" fill="#2d219b" />
      <rect x="110" y="125" width="5" height="15" rx="2" fill="#2d219b" />
      <rect x="110" y="125" width="25" height="5" rx="2" fill="#2d219b" />
      
      {/* Cliente */}
      <circle cx="180" cy="105" r="15" fill="#a78bfa" /> {/* Cabeza */}
      <rect x="170" y="120" width="20" height="25" fill="#7c3aed" /> {/* Torso */}
      <rect x="170" y="120" width="20" height="8" fill="#6d28d9" /> {/* Cuello */}
      
      {/* Brazos del cliente */}
      <rect x="165" y="125" width="5" height="15" rx="2" fill="#7c3aed" />
      <rect x="190" y="125" width="5" height="15" rx="2" fill="#7c3aed" />
      <rect x="145" y="125" width="20" height="5" rx="2" fill="#7c3aed" />
      
      {/* Documento */}
      <rect x="140" y="115" width="15" height="20" fill="#ffffff" />
      <line x1="143" y1="120" x2="153" y2="120" stroke="#9ca3af" strokeWidth="1" />
      <line x1="143" y1="123" x2="153" y2="123" stroke="#9ca3af" strokeWidth="1" />
      <line x1="143" y1="126" x2="153" y2="126" stroke="#9ca3af" strokeWidth="1" />
      <line x1="143" y1="129" x2="150" y2="129" stroke="#9ca3af" strokeWidth="1" />
      
      {/* Sello/certificación */}
      <circle cx="150" cy="125" r="8" stroke="#2d219b" strokeWidth="1.5" fill="none" />
      <path d="M145 125 L149 129 L155 122" stroke="#2d219b" strokeWidth="1.5" />
    </svg>
  );
};

// Componente principal que agrupa todas las ilustraciones
const VecinosIllustrations = {
  NeighborHelping,
  SellerVisiting,
  SupervisorManaging,
  CertifierReviewing,
  PaymentSystem,
  StoreServing
};

export default VecinosIllustrations;