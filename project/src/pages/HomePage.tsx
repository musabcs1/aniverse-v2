import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AniNestPicksSection from '../components/home/AniNestPicksSection';
import NewsUpdateSection from '../components/home/NewsUpdateSection';
import CommunitySection from '../components/home/CommunitySection';

// Fixed JSX element type issues by ensuring TypeScript recognizes JSX.

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <AniNestPicksSection />
      <NewsUpdateSection />
      <CommunitySection />
    </div>
  );
};

export default HomePage;