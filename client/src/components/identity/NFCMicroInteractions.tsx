import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface NFCMicroInteractionsProps {
  status: 'idle' | 'scanning' | 'success' | 'error';
  message?: string;
}

/**
 * Componente para microinteracciones durante la lectura NFC
 * Muestra diferentes animaciones según el estado: idle, scanning, success, error
 */
const NFCMicroInteractions: React.FC<NFCMicroInteractionsProps> = ({ 
  status, 
  message = 'Acerque la cédula al lector NFC' 
}) => {
  // Renderizar según el estado
  switch (status) {
    case 'scanning':
      return (
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="relative w-32 h-32 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute rounded-full border-4 border-blue-400 opacity-50"
              initial={{ width: 80, height: 80, opacity: 0.7 }}
              animate={{ 
                width: 130, 
                height: 130, 
                opacity: 0,
                borderWidth: 1
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "easeOut" 
              }}
            />
            <motion.div
              className="absolute rounded-full border-4 border-blue-500 opacity-50"
              initial={{ width: 80, height: 80, opacity: 0.7 }}
              animate={{ 
                width: 130, 
                height: 130, 
                opacity: 0,
                borderWidth: 1
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "easeOut",
                delay: 0.5
              }}
            />
            
            {/* Card icon */}
            <motion.div
              className="bg-blue-100 rounded-lg p-4 z-10"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Smartphone size={40} className="text-blue-600" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="mt-4 text-sm text-blue-700 font-medium text-center max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
          
          <motion.div 
            className="mt-3 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Loader2 className="h-4 w-4 mr-2 text-blue-600 animate-spin" />
            <span className="text-xs text-blue-600">Escaneando...</span>
          </motion.div>
        </div>
      );
    
    case 'success':
      return (
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="bg-green-100 rounded-full p-6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>
          
          <motion.p 
            className="mt-4 text-sm text-green-700 font-medium text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message || 'Lectura completada con éxito'}
          </motion.p>
        </div>
      );
    
    case 'error':
      return (
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="bg-red-100 rounded-full p-6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <AlertCircle size={40} className="text-red-600" />
          </motion.div>
          
          <motion.p 
            className="mt-4 text-sm text-red-700 font-medium text-center max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message || 'Error en la lectura. Intente nuevamente.'}
          </motion.p>
        </div>
      );
    
    case 'idle':
    default:
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gray-100 rounded-lg p-4">
            <Smartphone size={40} className="text-gray-500" />
          </div>
          
          <p className="mt-4 text-sm text-gray-600 text-center">
            {message || 'Esperando para iniciar la lectura'}
          </p>
        </div>
      );
  }
};

export default NFCMicroInteractions;