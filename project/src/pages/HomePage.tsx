import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AniNestPicksSection from '../components/home/AniNestPicksSection';
import NewsUpdateSection from '../components/home/NewsUpdateSection';
import CommunitySection from '../components/home/CommunitySection';
import ToastDemo from '../components/ui/ToastDemo';

// Fixed JSX element type issues by ensuring TypeScript recognizes JSX.

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjMTEwNzI2IiBkPSJNMCAwaDYwdjYwSDB6Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzk5MDBGRiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')]">
      <HeroSection />
      <div className="relative z-10">
        <AniNestPicksSection />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30"></div>
          <NewsUpdateSection />
        </div>
        <CommunitySection />
        
        {/* Toast Demo Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <ToastDemo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;