import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AniversePicksSection from '../components/home/AniversePicksSection';
import NewsUpdateSection from '../components/home/NewsUpdateSection';
import CommunitySection from '../components/home/CommunitySection';

// Fixed JSX element type issues by ensuring TypeScript recognizes JSX.

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <AniversePicksSection />
      <NewsUpdateSection />
      <CommunitySection />
    </div>
  );
};

export default HomePage;