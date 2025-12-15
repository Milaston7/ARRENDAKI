import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", variant = 'full' }) => {
  const isWhite = variant === 'white';
  const fillPrimary = isWhite ? '#FFFFFF' : '#111827';
  const fillAccent = isWhite ? '#FFFFFF' : '#f97316'; // brand-500

  if (variant === 'icon') {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={fillAccent} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 160 40" 
      className={className}
      aria-label="Arrendaki Logo"
    >
      {/* Icon Part: Simple House */}
      <g transform="translate(0, 5)">
         <path 
            d="M1.5 13.5L12 3L22.5 13.5" 
            stroke={fillAccent} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
         />
         <path 
            d="M4.5 10.5V25.5H19.5V10.5" 
            stroke={fillPrimary} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
         />
         <path 
            d="M9 25.5V16.5H15V25.5" 
            stroke={fillPrimary} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
         />
      </g>

      {/* Text Part */}
      <text x="32" y="27" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="22" fill={fillPrimary}>
        Arrenda<tspan fill={fillAccent}>ki</tspan>
      </text>
    </svg>
  );
};

export default Logo;