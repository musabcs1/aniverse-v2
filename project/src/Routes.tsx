// src/Routes.tsx
import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom'; // React Router import
import Home from './pages/Home'; // Home sayfası
import Anime from './pages/Anime'; // Anime sayfası
import Forum from './pages/Forum'; // Forum sayfası
import News from './pages/News'; // News sayfası

const Routes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/anime" element={<Anime />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/news" element={<News />} />
    </RouterRoutes>
  );
};

export default Routes;
