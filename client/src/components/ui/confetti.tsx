import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export const Confetti: React.FC = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Función para actualizar las dimensiones del confeti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Agregar el event listener
    window.addEventListener('resize', handleResize);

    // Ocultar el confeti después de 4 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Limpiar event listeners y timers
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.2}
      colors={['#EC1C24', '#333333', '#F2F2F2', '#FFFFFF', '#FFD700']}
      confettiSource={{
        x: windowSize.width / 2,
        y: 0,
        w: 0,
        h: 0,
      }}
    />
  );
};