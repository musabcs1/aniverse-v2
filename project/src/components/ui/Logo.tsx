import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '/logo.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'default'
}) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-14'
  };

  // Always use red color variants
  const textColor = variant === 'white' ? '#ff3333' : '#ff0000';
  
  // For image variant styling - apply red filter
  const imageFilter = 'brightness(0.8) sepia(1) saturate(5) hue-rotate(320deg)';

  return (
    <Link to="/" className="flex items-center group">
      <div className={`flex items-center`}>
        <div className="relative">
          <img 
            src={logoImage} 
            alt="AniNest Logo" 
            className={`${sizeClasses[size]} transition-all duration-300 group-hover:scale-110`}
            style={{ filter: imageFilter }}
          />
          <div className="absolute -inset-1 bg-red-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <span 
          className={`ml-2 font-bold tracking-wider ${
            size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl'
          } text-shadow-red`}
          style={{ color: textColor, textShadow: '0 0 5px rgba(255, 0, 0, 0.5)' }}
        >
           
        </span>
      </div>
    </Link>
  );
};

export default Logo;