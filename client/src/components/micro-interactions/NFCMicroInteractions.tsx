import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowSize } from 'react-use';
import { Shield, CheckCircle2, Zap, Award, PartyPopper } from 'lucide-react';

interface NFCMicroInteractionsProps {
  status: 'idle' | 'scanning' | 'success' | 'error';
  message?: string;
  onComplete?: () => void;
}

/**
 * Componente de micro-interacciones para la validación NFC
 * Muestra diferentes animaciones según el estado del proceso de lectura NFC
 */
const NFCMicroInteractions: React.FC<NFCMicroInteractionsProps> = ({ 
  status,
  message,
  onComplete
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [pointsEarned, setPointsEarned] = useState(0);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  // Efecto para manejar la animación de progreso durante el escaneo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (status === 'scanning') {
      // Reiniciar progreso
      setProgressValue(0);
      
      // Animar el progreso de 0 a 100% mientras está escaneando
      intervalId = setInterval(() => {
        setProgressValue(prev => {
          // Aumentar progreso gradualmente, más lento cerca del final
          const nextValue = prev + (100 - prev) * 0.03;
          return Math.min(nextValue, 98); // Nunca llega al 100% hasta que realmente termine
        });
      }, 150);
    } else if (status === 'success') {
      // Completar progreso inmediatamente al éxito
      setProgressValue(100);
      
      // Mostrar confeti al tener éxito
      setShowConfetti(true);
      
      // Asignar puntos de gamificación
      setPointsEarned(25);
      
      // Otorgar insignia ocasionalmente (20% de probabilidad)
      if (Math.random() < 0.2) {
        setBadgeEarned(true);
      }
      
      // Ocultar confetti después de 4 segundos
      setTimeout(() => {
        setShowConfetti(false);
        
        // Notificar que la animación ha terminado
        if (onComplete) {
          onComplete();
        }
      }, 4000);
    } else if (status === 'error') {
      // Resetear progreso en error
      setProgressValue(0);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [status, onComplete]);
  
  // Simulación visual de confeti con elementos DOM
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    // En lugar de usar un componente de confeti externo, usamos elementos DOM animados
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-sm w-2 h-2 ${
              ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][
                Math.floor(Math.random() * 5)
              ]
            }`}
            initial={{ 
              x: Math.random() * width, 
              y: -20,
              rotate: Math.random() * 360,
              opacity: 1 
            }}
            animate={{ 
              y: height + 20,
              rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: 0
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              ease: "easeOut",
              delay: Math.random() * 0.8
            }}
            style={{ 
              width: 5 + Math.random() * 10, 
              height: 5 + Math.random() * 10 
            }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative">
      {/* Animación mientras escanea */}
      {status === 'scanning' && (
        <div className="mb-6">
          {/* Barra de progreso animada */}
          <div className="bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
            <motion.div 
              className="bg-blue-500 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progressValue}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          
          {/* Círculo pulsante con ícono */}
          <div className="flex justify-center">
            <motion.div
              className="relative bg-blue-50 rounded-full p-6 border-2 border-blue-300"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(59, 130, 246, 0.5)',
                  '0 0 0 15px rgba(59, 130, 246, 0)',
                  '0 0 0 0 rgba(59, 130, 246, 0)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  opacity: [0.6, 1, 0.6] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
              >
                <Zap size={40} className="text-blue-500" />
              </motion.div>
              
              {/* Partículas girando alrededor */}
              <motion.div
                className="absolute -top-2 -right-2 bg-blue-400 rounded-full p-1"
                animate={{
                  rotate: 360,
                  x: [0, 10, 0, -10, 0],
                  y: [0, -10, 0, 10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2 bg-blue-500 rounded-full p-1"
                animate={{
                  rotate: -360,
                  x: [0, -10, 0, 10, 0],
                  y: [0, 10, 0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </motion.div>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-center text-blue-600 font-medium mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message || "Leyendo cédula... Mantenga quieto el dispositivo"}
          </motion.p>
        </div>
      )}
      
      {/* Animación de éxito */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-6"
          >
            <motion.div 
              className="mb-4 inline-flex items-center justify-center bg-green-100 p-4 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(74, 222, 128, 0.4)',
                  '0 0 0 20px rgba(74, 222, 128, 0)',
                  '0 0 0 0 rgba(74, 222, 128, 0)'
                ]
              }}
              transition={{ duration: 1.5 }}
            >
              <CheckCircle2 size={50} className="text-green-500" />
            </motion.div>
            
            <motion.h3 
              className="text-xl font-bold text-green-700 mb-2"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              ¡Validación exitosa!
            </motion.h3>
            
            <motion.p 
              className="text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message || "Cédula verificada correctamente"}
            </motion.p>
            
            {/* Puntos ganados */}
            {pointsEarned > 0 && (
              <motion.div 
                className="mt-4 bg-blue-50 rounded-lg p-3 inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-blue-800 font-medium">
                  <span className="text-xl">+{pointsEarned}</span> puntos ganados
                </p>
              </motion.div>
            )}
            
            {/* Insignia obtenida */}
            {badgeEarned && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
                  <div className="mb-2">
                    <Award size={30} className="text-yellow-500 mx-auto" />
                  </div>
                  <p className="text-yellow-700 font-bold">¡Nueva insignia!</p>
                  <p className="text-yellow-600 text-sm">Verificador NFC</p>
                </div>
              </motion.div>
            )}
            
            {renderConfetti()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Animación de error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 rounded-lg p-4 border border-red-200"
          >
            <motion.div 
              animate={{ 
                x: [0, -5, 5, -5, 5, 0]
              }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Shield size={30} className="text-red-500 mx-auto mb-2" />
              <h3 className="text-red-700 font-medium">Error de lectura</h3>
              <p className="text-red-600 text-sm mt-1">
                {message || "No se pudo leer la cédula. Intente nuevamente."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NFCMicroInteractions;