import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AnimeDirectoryPage from './pages/AnimeDirectoryPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import ForumPage from './pages/ForumPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import MobileMenu from './components/layout/MobileMenu';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Header scrolled={scrolled} toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <MobileMenu mobileMenuOpen={mobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />

        <Routes>
          <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!isLoggedIn ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/directory" element={<AnimeDirectoryPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/auth" />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;