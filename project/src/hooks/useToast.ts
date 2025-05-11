import { useState } from 'react';
import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
  const showToast = (message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          style: {
            background: '#fffbeb',
            color: '#d97706',
          },
        });
        break;
      default:
        toast(message, {
          icon: 'ℹ️',
          style: {
            background: '#eff6ff',
            color: '#3b82f6',
          },
        });
    }
  };

  return { showToast };
}; 