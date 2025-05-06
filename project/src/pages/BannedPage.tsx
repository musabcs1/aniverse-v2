import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';

const BannedPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-lg bg-surface p-8 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Account Suspended</h1>
        
        <div className="bg-red-500/10 rounded-lg p-4 mb-6">
          <p className="text-gray-300">
            Your account has been suspended for violating our community guidelines. 
            If you believe this is an error, please contact our support team at
            <a href="mailto:support@aninest.com" className="text-primary hover:underline ml-1">
              support@aninest.com
            </a>
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-400">
            Please include your username and any relevant information in your support request.
          </p>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Sign Out
          </button>
          
          <a 
            href="/"
            className="block w-full bg-surface-light py-3 rounded-lg text-white font-medium hover:bg-surface-dark transition-colors"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default BannedPage; 