import React from 'react';

interface UniversitySealProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UniversitySeal: React.FC<UniversitySealProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-white shadow-xs shrink-0 select-none ${dimensions} ${className}`}
      aria-label="University of La Salette, Inc. Official Seal"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer Navy Ring */}
        <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1b325f" strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#1b325f" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* 8 Starburst rays */}
        <polygon
          points="50,12 57,34 80,20 66,43 88,50 66,57 80,80 57,66 50,88 43,66 20,80 34,57 12,50 34,43 20,20 43,34"
          fill="#1e3a8a"
          opacity="0.14"
        />

        {/* Inner Shield / Circle */}
        <circle cx="50" cy="50" r="29" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />

        {/* Cross and Pincers / Hammer La Salette Motif */}
        <line x1="50" y1="26" x2="50" y2="62" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="37" y1="38" x2="63" y2="38" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" />

        {/* Diagonal emblems */}
        <line x1="39" y1="46" x2="46" y2="39" stroke="#b49238" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="61" y1="46" x2="54" y2="39" stroke="#b49238" strokeWidth="2.2" strokeLinecap="round" />

        {/* Open Book at Base */}
        <path
          d="M36 62 Q43 59 50 62 Q57 59 64 62 L64 69 Q57 66 50 69 Q43 66 36 69 Z"
          fill="#b49238"
          stroke="#1b325f"
          strokeWidth="1.2"
        />

        {/* Decorative Dots Around Rim */}
        <circle cx="50" cy="15" r="1.8" fill="#1b325f" />
        <circle cx="50" cy="85" r="1.8" fill="#1b325f" />
        <circle cx="15" cy="50" r="1.8" fill="#1b325f" />
        <circle cx="85" cy="50" r="1.8" fill="#1b325f" />
      </svg>
    </div>
  );
};
