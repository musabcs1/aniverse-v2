import React from 'react';
import { useToast } from './ToastContainer';
import { motion } from 'framer-motion';

const ToastDemo: React.FC = () => {
  const { showToast } = useToast();

  const showSuccessToast = () => {
    showToast('Operation completed successfully!', 'success');
  };

  const showErrorToast = () => {
    showToast('An error occurred while processing your request.', 'error');
  };

  const showWarningToast = () => {
    showToast('Please review your information before proceeding.', 'warning');
  };

  const showInfoToast = () => {
    showToast('New features have been added to your account!', 'info');
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-white">System Messages</h3>
      <p className="text-gray-300 mb-6">Click the buttons below to see different types of system messages.</p>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="py-3 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center"
          onClick={showSuccessToast}
        >
          Success Message
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center"
          onClick={showErrorToast}
        >
          Error Message
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="py-3 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors flex items-center justify-center"
          onClick={showWarningToast}
        >
          Warning Message
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="py-3 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors flex items-center justify-center"
          onClick={showInfoToast}
        >
          Info Message
        </motion.button>
      </div>
    </div>
  );
};

export default ToastDemo; 