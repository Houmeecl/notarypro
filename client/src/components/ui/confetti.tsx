import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

export const Confetti: React.FC = () => {
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [show, setShow] = useState(true);

  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    const timer = setTimeout(() => setShow(false), 4000);
    
    return () => {
      window.removeEventListener('resize', detectSize);
      clearTimeout(timer);
    };
  }, []);

  return (
    show ? (
      <ReactConfetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
        colors={[
          '#EC1C24', // rojo (color primario)
          '#333333', // gris oscuro
          '#F2F2F2', // gris claro
          '#FFD700', // oro
          '#E5E4E2', // platino
        ]}
      />
    ) : null
  );
};