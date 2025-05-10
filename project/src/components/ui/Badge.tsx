import React, { useState } from 'react';
import { Badge as BadgeType } from '../../types';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

type BadgeSize = 'sm' | 'md' | 'lg';

const getBadgeStyles = (role: string, size: BadgeSize = 'md', isHovered: boolean) => {
  const baseStyles = "font-medium rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer transform";
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  } as const;

  const colorStyles = {
    admin: `bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-500 ${isHovered ? 'shadow-lg shadow-red-500/25' : ''}`,
    writer: `bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-500 ${isHovered ? 'shadow-lg shadow-blue-500/25' : ''}`,
    reviewer: `bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-500 ${isHovered ? 'shadow-lg shadow-purple-500/25' : ''}`,
    user: `bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-500 ${isHovered ? 'shadow-lg shadow-green-500/25' : ''}`
  } as const;

  const hoverClass = isHovered ? 'scale-110' : '';
  const safeRole = (role in colorStyles) ? role as keyof typeof colorStyles : 'user';

  return `${baseStyles} ${sizeStyles[size]} ${colorStyles[safeRole]} ${hoverClass}`;
};

const Badge: React.FC<BadgeProps> = ({ badge, size = 'md', children }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!badge?.name) return null;

  // Special case for admin badge to accommodate fire effect
  const isAdmin = badge.name === 'admin';
  const contentClass = isAdmin
    ? 'flex items-center justify-center' 
    : `flex items-center justify-center ${isHovered ? 'animate-pulse' : ''}`;

  return (
    <span 
      className={getBadgeStyles(badge.name, size, isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${badge.name.charAt(0).toUpperCase() + badge.name.slice(1)} Badge`}
    >
      <span className={contentClass}>
        {children || badge.name.charAt(0).toUpperCase() + badge.name.slice(1)}
      </span>
    </span>
  );
};

export default Badge;