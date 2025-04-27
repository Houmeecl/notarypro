import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

export function Logo({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
  linkTo = '/',
}: LogoProps) {
  // Importar las imágenes de los logos
  const logoImage = '/assets/logo.png';
  
  // Definir tamaños de logo según el parámetro size
  const logoSizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };
  
  // Definir colores de texto según la variante
  const textColors = {
    default: 'text-gray-900',
    white: 'text-white',
  };
  
  const LogoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <img 
        src={logoImage} 
        alt="NotaryPro Logo" 
        className={cn(logoSizes[size])}
      />
      
      {showText && (
        <span className={cn('font-bold text-xl', textColors[variant])}>
          NotaryPro
        </span>
      )}
    </div>
  );
  
  // Si se proporciona un enlace, envolver en un componente Link
  if (linkTo) {
    return <Link href={linkTo}>{LogoContent}</Link>;
  }
  
  // De lo contrario, devolver solo el contenido
  return LogoContent;
}

export function PartnerLogo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const partnerLogoImage = '/src/assets/corporate-logo.jpeg';
  
  const logoSizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };
  
  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src={partnerLogoImage} 
        alt="Logo Corporativo" 
        className={cn(logoSizes[size], 'object-contain')}
      />
    </div>
  );
}