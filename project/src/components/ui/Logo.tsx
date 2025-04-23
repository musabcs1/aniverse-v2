import React from 'react';
import { Link } from 'react-router-dom';
import { Tv } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <Tv className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-orbitron font-bold tracking-wide text-white">
          <span className="text-secondary">Ani</span>Verse
        </span>
      </div>
    </Link>
  );
};

export default Logo;