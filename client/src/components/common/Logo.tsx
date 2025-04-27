import React from 'react';
import { Link } from 'wouter';
import logoImage from '@/assets/logo12582620.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
  linkTo?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  linkTo = '/'
}) => {
  // Tamaños de altura predefinidos en px
  const heights = {
    sm: 30,
    md: 40,
    lg: 50
  };

  const height = heights[size];
  
  // El logo es un contenedor con una relación de aspecto específica
  const logoContainer = (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="NotaryPro Chile Logo" 
        height={height} 
        className="h-auto max-h-full"
        style={{ height: variant === 'icon' ? `${height}px` : `${height}px` }}
      />
      {/* Eliminamos el texto NotaryPro Chile */}
    </div>
  );

  // Si se especifica un enlace, envolvemos el logo con un Link
  if (linkTo) {
    return (
      <Link href={linkTo} className="flex items-center cursor-pointer">
        {logoContainer}
      </Link>
    );
  }

  // Si no hay enlace, solo devolvemos el logo
  return logoContainer;
};

export default Logo;