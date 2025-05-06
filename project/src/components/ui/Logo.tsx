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

  const textColor = variant === 'white' ? '#ffffff' : '#d32f2f';
  
  // For image variant styling if needed
  const imageFilter = variant === 'white' ? 'brightness(0) invert(1)' : 'none';

  return (
    <Link to="/" className="flex items-center">
      <div className={`flex items-center`}>
        <img 
          src={logoImage} 
          alt="AniNest Logo" 
          className={`${sizeClasses[size]}`}
          style={{ filter: imageFilter }}
        />
        <span 
          className={`ml-2 font-bold tracking-wider ${
            size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl'
          }`}
          style={{ color: textColor }}
        >
          ANINEST
        </span>
      </div>
    </Link>
  );
};

export default Logo;