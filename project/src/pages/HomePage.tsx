import React, { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import TrendingSection from '../components/home/TrendingSection';
import AniversePicksSection from '../components/home/AniversePicksSection';
import NewsUpdateSection from '../components/home/NewsUpdateSection';
import CommunitySection from '../components/home/CommunitySection';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate loading delay

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <HeroSection />
      <TrendingSection />
      <AniversePicksSection />
      <NewsUpdateSection />
      <CommunitySection />
    </div>
  );
};

export default HomePage;