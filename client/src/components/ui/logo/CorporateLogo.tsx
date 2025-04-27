import React from 'react';

interface CorporateLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'black';
}

export const CorporateLogo: React.FC<CorporateLogoProps> = ({
  className = '',
  size = 'md',
  color = 'primary'
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-auto';
      case 'lg': return 'h-16 w-auto';
      case 'md':
      default: return 'h-12 w-auto';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'white': return 'text-white';
      case 'black': return 'text-black';
      case 'primary':
      default: return 'text-red-600';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className="mr-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`${getSize()} ${getColor()}`}
        >
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          <path d="M12 4v16"></path>
          <path d="M9 8h6"></path>
          <path d="M9 12h6"></path>
          <path d="M9 16h6"></path>
          <path d="M4 9h4"></path>
          <path d="M4 14h4"></path>
        </svg>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={`font-bold leading-tight ${getColor()} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'}`}>
          CERTIFICADORA
        </span>
        <span className={`font-medium leading-tight ${getColor()} ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
          Pública Digital de Chile
        </span>
      </div>
    </div>
  );
};

export const CertifierBadge: React.FC<{ className?: string, size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '',
  size = 'md'
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      case 'md':
      default: return 'text-base';
    }
  };

  return (
    <div className={`inline-flex items-center bg-red-50 border border-red-200 rounded-md px-3 py-1 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="h-4 w-4 mr-1 text-red-600"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <span className={`font-semibold text-red-800 ${getSize()}`}>CERTIFICADORES OFICIAL LEY 19.799</span>
    </div>
  );
};