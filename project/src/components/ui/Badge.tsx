import React from 'react';
import { Badge as BadgeType } from '../../types';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode; // Allow children to be passed
}

type BadgeSize = 'sm' | 'md' | 'lg';

const getBadgeStyles = (role: string, size: BadgeSize = 'md') => {
  const baseStyles = "font-medium rounded-full flex items-center justify-center";
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  } as const;

  const colorStyles = {
    admin: "bg-red-500/20 text-red-500",
    writer: "bg-blue-500/20 text-blue-500",
    reviewer: "bg-purple-500/20 text-purple-500",
    user: "bg-green-500/20 text-green-500"
  } as const;

  const safeRole = (role in colorStyles) ? role as keyof typeof colorStyles : 'user';
  return `${baseStyles} ${sizeStyles[size]} ${colorStyles[safeRole]}`;
};

const Badge: React.FC<BadgeProps> = ({ badge, size = 'md', children }) => {
  if (!badge?.name) return null;

  return (
    <span className={getBadgeStyles(badge.name, size)}>
      {children || badge.name.charAt(0).toUpperCase() + badge.name.slice(1)}
    </span>
  );
};

export default Badge;