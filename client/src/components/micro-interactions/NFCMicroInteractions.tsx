import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowSize } from 'react-use';
import { CreditCard, CheckCircle, XCircle, Smartphone } from 'lucide-react';

type NFCReadStatus = 'idle' | 'scanning' | 'success' | 'error';

interface NFCMicroInteractionsProps {
  status: NFCReadStatus;
  points?: number;
  message?: string;
  onComplete?: () => void;
  onInteractionComplete?: () => void;
}

const NFCMicroInteractions: React.FC<NFCMicroInteractionsProps> = ({ 
  status, 
  points = 100,
  message,
  onComplete,
  onInteractionComplete
}) => {
  const [confetti, setConfetti] = useState<Array<{ x: number; y: number; size: number; color: string }>>([]);
  const { width, height } = useWindowSize();
  
  // Al cambiar a success, generar confeti
  useEffect(() => {
    if (status === 'success') {
      // Crear partículas de confeti
      const newConfetti = [];
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      for (let i = 0; i < 100; i++) {
        newConfetti.push({
          x: Math.random() * 100, // posición x en porcentaje
          y: Math.random() * 100, // posición y en porcentaje
          size: Math.random() * 10 + 5, // tamaño entre 5 y 15px
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setConfetti(newConfetti);
      
      // Llamar a onComplete después de mostrar las animaciones
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
        if (onInteractionComplete) onInteractionComplete();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [status, onComplete, onInteractionComplete]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Fondo con animación según el estado */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          backgroundColor: 
            status === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 
            status === 'scanning' ? 'rgba(59, 130, 246, 0.1)' :
            status === 'success' ? 'rgba(34, 197, 94, 0.1)' :
            'rgba(239, 68, 68, 0.1)'
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Confeti en caso de éxito */}
      <AnimatePresence>
        {status === 'success' && confetti.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            initial={{ 
              top: '40%', 
              left: '50%',
              opacity: 1,
              scale: 0
            }}
            animate={{ 
              top: `${particle.y}%`, 
              left: `${particle.x}%`,
              opacity: 0,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1 + Math.random(), 
              ease: "easeOut" 
            }}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Contenido principal según el estado */}
      <div className="relative z-10 text-center p-6">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <CreditCard className="w-16 h-16 text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Lector NFC</h3>
              <p className="text-zinc-500">{message || "Esperando para leer cédula"}</p>
            </motion.div>
          )}
          
          {status === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Smartphone className="w-20 h-20 text-blue-600 mb-2" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 opacity-50 animate-ping" />
              </motion.div>
              
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <h3 className="text-xl font-bold mb-2">Leyendo cédula...</h3>
              </motion.div>
              
              <p className="text-zinc-500">{message || "Acerque la cédula al dispositivo"}</p>
              
              {/* Indicador de señal NFC */}
              <div className="mt-4 flex flex-col items-center">
                <p className="text-xs text-blue-600 mb-1">Intensidad de señal</p>
                <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    animate={{ width: ['10%', '90%', '30%', '80%', '50%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
              
              {/* Ondas de escaneo */}
              <div className="relative mt-6">
                <motion.div
                  className="absolute rounded-full border-4 border-blue-400"
                  initial={{ width: 50, height: 50, x: -25, y: -25, opacity: 1 }}
                  animate={{ width: 150, height: 150, x: -75, y: -75, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute rounded-full border-4 border-blue-400"
                  initial={{ width: 50, height: 50, x: -25, y: -25, opacity: 1 }}
                  animate={{ width: 150, height: 150, x: -75, y: -75, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  scale: [0.8, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">¡Cédula verificada!</h3>
              
              {/* Puntos ganados con animación */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-green-100 text-green-800 rounded-full px-4 py-2 font-bold text-lg mt-4"
              >
                +{points} puntos
              </motion.div>
              
              <motion.p 
                className="text-zinc-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {message || "Identidad verificada correctamente"}
              </motion.p>
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  scale: [0.8, 1.1, 1],
                  x: [0, -10, 10, -10, 10, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                <XCircle className="w-24 h-24 text-red-500 mb-4" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-2">Error de lectura</h3>
              <p className="text-zinc-500">{message || "No se pudo leer la cédula, intente nuevamente"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NFCMicroInteractions;