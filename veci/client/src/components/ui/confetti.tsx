import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiProps {
  duration?: number;
}

/**
 * Componente de confeti para celebraciones
 * Muestra una animación de confeti que se detiene automáticamente después de la duración especificada
 */
export const Confetti: React.FC<ConfettiProps> = ({ duration = 5000 }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Detectar dimensiones de la ventana
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Agregar listener para redimensionamiento
    window.addEventListener("resize", handleResize);

    // Desactivar el confeti después de la duración especificada
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    // Limpieza
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [duration]);

  if (!isActive) {
    return null;
  }

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.15}
      colors={[
        "#EC1C24", // Rojo principal
        "#F87171", // Rojo claro
        "#3B82F6", // Azul
        "#10B981", // Verde
        "#F59E0B", // Ámbar
        "#8B5CF6", // Púrpura
      ]}
    />
  );
};

export default Confetti;