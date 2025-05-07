import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, isBanned } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the current user is banned and redirect if needed
  useEffect(() => {
    if (currentUser && isBanned && location.pathname !== '/banned') {
      navigate('/banned');
    }
  }, [currentUser, isBanned, location.pathname, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Safe to render if user is not banned or if they're already on the banned page
  const isSafeToRender = !isBanned || location.pathname === '/banned' || !currentUser;

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        toggleMobileMenu={toggleMobileMenu} 
        mobileMenuOpen={mobileMenuOpen} 
      />
      <MobileMenu isOpen={mobileMenuOpen} closeMenu={() => setMobileMenuOpen(false)} />
      <main className="flex-grow">
        {isSafeToRender ? children : null}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;