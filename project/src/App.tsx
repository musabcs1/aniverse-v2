import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import ForumPage from './pages/ForumPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { UserProvider } from './context/UserContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // UserContext dosyasını import edin
import Header from './components/Header'; // Header bileşeninizi import edin
import Routes from './Routes'; // Uygulamanızdaki routing kısmını import edin

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime" element={<AnimeDirectoryPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;