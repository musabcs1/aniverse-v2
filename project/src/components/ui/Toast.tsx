import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  type?: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

const toastVariants = {
  hidden: { 
    opacity: 0, 
    y: -20, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.8,
    transition: { 
      duration: 0.2 
    }
  }
};

const getToastIcon = (type: ToastType) => {
  const iconClass = "h-5 w-5";
  
  switch (type) {
    case 'success':
      return <Check className={`${iconClass} text-green-400`} />;
    case 'error':
      return <X className={`${iconClass} text-red-400`} />;
    case 'warning':
      return <Info className={`${iconClass} text-yellow-400`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-primary`} />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-l-4 border-green-400 bg-gradient-to-r from-green-500/10 to-surface-dark';
    case 'error':
      return 'border-l-4 border-red-400 bg-gradient-to-r from-red-500/10 to-surface-dark';
    case 'warning':
      return 'border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-500/10 to-surface-dark';
    case 'info':
    default:
      return 'border-l-4 border-primary bg-gradient-to-r from-primary/10 to-surface-dark';
  }
};

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  duration = 4000,
  onClose,
  isVisible = true
}) => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed top-24 right-4 z-50 w-full max-w-sm rounded-xl shadow-lg shadow-black/20 backdrop-blur-sm ${getToastStyles(type)}`}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              {getToastIcon(type)}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-white text-sm font-medium">{message}</p>
            </div>
            <button 
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 