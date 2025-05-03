import React, { useState, useEffect } from 'react';

interface NFCMicroInteractionsProps {
  className?: string;
}

const NFCMicroInteractions: React.FC<NFCMicroInteractionsProps> = ({ className = '' }) => {
  const [animationState, setAnimationState] = useState<number>(0);

  // Efecto para animar el componente
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 4);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Dispositivo móvil */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-40 bg-gray-800 rounded-xl border-4 border-gray-700 shadow-lg">
          {/* Pantalla */}
          <div className="absolute inset-2 bg-[#2d219b] opacity-70 rounded-lg flex items-center justify-center">
            <div className="text-white text-xs font-bold">NFC</div>
          </div>
          
          {/* Círculos de animación para simular lectura NFC */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              animationState === 0 ? 'opacity-70' : 'opacity-0'
            }`}
          >
            <div className="w-20 h-20 rounded-full border-2 border-white animate-ping opacity-30"></div>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              animationState === 1 ? 'opacity-70' : 'opacity-0'
            }`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-white animate-ping opacity-40"></div>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              animationState === 2 ? 'opacity-70' : 'opacity-0'
            }`}
          >
            <div className="w-12 h-12 rounded-full border-2 border-white animate-ping opacity-50"></div>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              animationState === 3 ? 'opacity-70' : 'opacity-0'
            }`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white animate-ping opacity-60"></div>
          </div>
        </div>
      </div>
      
      {/* Cédula/Documento con chip NFC */}
      <div className="absolute right-1/4 bottom-1/3 transform rotate-12">
        <div className="w-32 h-20 bg-white rounded-md shadow-md border border-gray-300 overflow-hidden relative">
          {/* Diseño de documento */}
          <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-indigo-700 to-indigo-500"></div>
          <div className="absolute top-8 left-3 w-10 h-12 bg-gradient-to-br from-amber-300 to-amber-100 rounded-sm"></div>
          <div className="absolute top-10 right-4 w-12 h-2 bg-gray-400 rounded-sm"></div>
          <div className="absolute top-14 right-4 w-10 h-2 bg-gray-300 rounded-sm"></div>
          
          {/* Chip NFC */}
          <div 
            className={`absolute bottom-2 left-3 w-8 h-6 bg-gradient-to-br from-amber-500 to-amber-300 rounded-sm transition-all duration-500 ${
              animationState % 2 === 0 ? 'shadow-md shadow-amber-300' : ''
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-6 h-px bg-amber-700"></div>
              <div className="w-6 h-px bg-amber-700 mt-1"></div>
              <div className="w-6 h-px bg-amber-700 mt-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCMicroInteractions;