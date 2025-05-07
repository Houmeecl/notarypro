import React from 'react';

interface PeopleConversationProps {
  className?: string;
  width?: number;
  height?: number;
}

export const PeopleConversation: React.FC<PeopleConversationProps> = ({ 
  className = "", 
  width = 300, 
  height = 200 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 400 300"
      className={className}
      fill="none"
    >
      {/* Background elements */}
      <circle cx="200" cy="150" r="120" fill="#f2f1ff" opacity="0.3" />
      
      {/* Person 1 - Store Owner */}
      <g>
        {/* Head */}
        <circle cx="120" cy="100" r="30" fill="#ffd8b4" />
        <path d="M100 90 Q120 80 140 90" stroke="#333" strokeWidth="2" fill="none" />
        <circle cx="110" cy="95" r="3" fill="#333" />
        <circle cx="130" cy="95" r="3" fill="#333" />
        
        {/* Body */}
        <path d="M120 130 L120 200" stroke="#4338ca" strokeWidth="16" />
        <rect x="100" y="140" width="40" height="60" rx="5" fill="#2d219b" />
        
        {/* Arms */}
        <path d="M120 140 L90 170" stroke="#4338ca" strokeWidth="8" strokeLinecap="round" />
        <path d="M120 140 L150 160" stroke="#4338ca" strokeWidth="8" strokeLinecap="round" />
        
        {/* Name tag */}
        <rect x="110" y="150" width="20" height="10" rx="2" fill="white" />
        
        {/* Conversation bubble */}
        <path d="M160 90 Q180 70 200 90 Q220 110 200 130 Q180 150 160 130 Q140 110 160 90" fill="white" stroke="#333" strokeWidth="1" />
        <text x="180" y="110" textAnchor="middle" fontSize="10" fill="#333">¡Minimarket!</text>
      </g>
      
      {/* Person 2 - Customer */}
      <g>
        {/* Head */}
        <circle cx="280" cy="100" r="30" fill="#f9d1bc" />
        <path d="M260 90 Q280 80 300 90" stroke="#333" strokeWidth="2" fill="none" />
        <circle cx="270" cy="95" r="3" fill="#333" />
        <circle cx="290" cy="95" r="3" fill="#333" />
        
        {/* Body */}
        <path d="M280 130 L280 200" stroke="#6366f1" strokeWidth="14" />
        <rect x="260" y="140" width="40" height="60" rx="5" fill="#8284fc" />
        
        {/* Arms */}
        <path d="M280 140 L250 160" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
        <path d="M280 140 L310 170" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
        
        {/* Conversation bubble */}
        <path d="M220 90 Q240 70 260 90 Q280 110 260 130 Q240 150 220 130 Q200 110 220 90" fill="white" stroke="#333" strokeWidth="1" />
        <text x="240" y="110" textAnchor="middle" fontSize="10" fill="#333">¡Digital!</text>
      </g>
      
      {/* Minimarket elements */}
      <g>
        {/* Counter */}
        <rect x="110" y="210" width="180" height="20" rx="3" fill="#9333ea" />
        <rect x="110" y="230" width="180" height="10" rx="2" fill="#7e22ce" />
        
        {/* Product shelves */}
        <rect x="100" y="250" width="30" height="20" rx="2" fill="#fbbf24" />
        <rect x="140" y="250" width="30" height="20" rx="2" fill="#34d399" />
        <rect x="180" y="250" width="30" height="20" rx="2" fill="#f87171" />
        <rect x="220" y="250" width="30" height="20" rx="2" fill="#60a5fa" />
        <rect x="260" y="250" width="30" height="20" rx="2" fill="#a78bfa" />
      </g>
    </svg>
  );
};

export default PeopleConversation;